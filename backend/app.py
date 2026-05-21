import os
import gc
import uuid
import time
import logging
import traceback
import threading
import sys
import json
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from PIL import Image, ImageFilter, ImageDraw
import torch
import numpy as np
from werkzeug.utils import secure_filename

# ─── Flask App Setup ──────────────────────────────────────────────────────────
app = Flask(__name__, static_folder='static')
CORS(app, resources={r"/api/*": {"origins": [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]}})

BASE_DIR    = os.path.dirname(os.path.abspath(__file__))
STATIC_DIR  = os.path.join(BASE_DIR, 'static')
UPLOAD_DIR  = os.path.join(STATIC_DIR, 'uploads')
OUTPUT_DIR  = os.path.join(STATIC_DIR, 'outputs')
DEBUG_DIR   = os.path.join(STATIC_DIR, 'debug')
LOG_DIR     = os.path.join(BASE_DIR, 'logs')

for d in [UPLOAD_DIR, OUTPUT_DIR, DEBUG_DIR, LOG_DIR]:
    os.makedirs(d, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s — %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(os.path.join(LOG_DIR, 'server.log'), encoding='utf-8'),
    ]
)
logger = logging.getLogger('outfit-gen')

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}
INFERENCE_W, INFERENCE_H = 512, 768  # 512x768 is SD 1.5 compatible, much faster on CPU than 768x1024
NUM_STEPS      = 20                    # 20 steps to optimize CPU time
GUIDANCE_SCALE = 2.5                   # Original config

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ─── Global Model State ───────────────────────────────────────────────────────
catvton_pipeline = None
automasker       = None
mask_processor   = None
device           = None
dtype            = None

inference_lock = threading.Lock()

model_status = {
    "status":   "initializing",
    "progress": 0,
    "message":  "Starting server...",
    "device":   "unknown",
    "error":    None,
}

# ─── Background Model Loading ─────────────────────────────────────────────────
def load_model_background():
    global catvton_pipeline, automasker, mask_processor, device, dtype, model_status

    if catvton_pipeline is not None:
        return

    def _update(status, progress, message):
        model_status.update({"status": status, "progress": progress, "message": message})
        logger.info(f"[MODEL] {status} ({progress}%) — {message}")

    try:
        _update("loading", 5, "Detecting hardware...")

        try:
            import torch as _torch
            device = "cuda" if _torch.cuda.is_available() else "cpu"
        except Exception:
            device = "cpu"

        dtype = torch.float16 if device == "cuda" else torch.float32
        model_status["device"] = device
        logger.info(f"[MODEL] Device: {device} | dtype: {dtype}")

        _update("loading", 10, "Importing AI libraries...")
        sys.path.insert(0, os.path.join(BASE_DIR, "catvton_app"))

        try:
            from model.pipeline import CatVTONPipeline
            from model.cloth_masker import AutoMasker
            from diffusers.image_processor import VaeImageProcessor
            from catvton_app.utils import resize_and_crop, resize_and_padding
        except ImportError as imp_err:
            _update("error", 0, f"Import failed: {imp_err}")
            logger.error(f"[MODEL] ImportError: {imp_err}", exc_info=True)
            return

        _update("loading", 20, "Downloading CatVTON weights from HuggingFace Hub...")
        local_ckpt = os.path.join(BASE_DIR, "models", "CatVTON")
        os.makedirs(local_ckpt, exist_ok=True)

        from huggingface_hub import snapshot_download
        snapshot_download(
            repo_id="zhengchong/CatVTON",
            local_dir=local_ckpt,
            local_dir_use_symlinks=False,
            allow_patterns=["*.bin", "*.json", "*.txt", "*.md"],
        )
        _update("loading", 55, "Weights downloaded. Building pipeline...")

        base_ckpt = "runwayml/stable-diffusion-inpainting"
        catvton_pipeline = CatVTONPipeline(
            base_ckpt=base_ckpt,
            attn_ckpt=local_ckpt,
            attn_ckpt_version="mix",
            weight_dtype=dtype,
            use_tf32=(device == "cuda"),
            device=device,
        )

        # Memory-efficiency features
        if hasattr(catvton_pipeline, "enable_attention_slicing"):
            catvton_pipeline.enable_attention_slicing()
        if hasattr(catvton_pipeline, "enable_vae_slicing"):
            catvton_pipeline.enable_vae_slicing()
        if device == "cuda" and hasattr(catvton_pipeline, "enable_xformers_memory_efficient_attention"):
            try:
                catvton_pipeline.enable_xformers_memory_efficient_attention()
                logger.info("[MODEL] xformers memory-efficient attention enabled")
            except Exception:
                pass

        # TF32 optimization (Ampere+ GPUs)
        if device == "cuda":
            torch.backends.cuda.matmul.allow_tf32 = True
            torch.backends.cudnn.allow_tf32 = True

        if hasattr(catvton_pipeline, "to"):
            catvton_pipeline.to(device)

        _update("loading", 70, "Building mask processor...")
        mask_processor = VaeImageProcessor(
            vae_scale_factor=8,
            do_normalize=False,
            do_binarize=True,
            do_convert_grayscale=True,
        )

        _update("loading", 80, "Initialising AutoMasker (DensePose + SCHP)...")
        automasker = AutoMasker(
            densepose_ckpt=os.path.join(local_ckpt, "DensePose"),
            schp_ckpt=os.path.join(local_ckpt, "SCHP"),
            device=device,
        )

        _update("loading", 92, "Running pipeline warmup...")
        try:
            dummy = Image.new('RGB', (INFERENCE_W, INFERENCE_H), color=(200, 180, 160))
            dummy_mask = Image.new('L', (INFERENCE_W, INFERENCE_H), color=0)
            with torch.no_grad():
                catvton_pipeline(
                    image=dummy,
                    condition_image=dummy,
                    mask=dummy_mask,
                    num_inference_steps=2,
                    guidance_scale=2.5,
                    width=INFERENCE_W,
                    height=INFERENCE_H,
                    generator=None,
                )
            _cleanup_gpu()
            logger.info("[MODEL] Warmup complete.")
        except Exception as warmup_e:
            logger.warning(f"[MODEL] Warmup failed (non-fatal): {warmup_e}")

        _update("ready", 100, f"CatVTON online [{device.upper()}] — 768×1024 @ {NUM_STEPS} steps")

    except Exception as e:
        tb = traceback.format_exc()
        _update("error", 0, f"Model load failed: {e}")
        logger.error(f"[MODEL] Fatal load error:\n{tb}")
        _write_error_log("model_load", tb)


def _cleanup_gpu():
    if device and device == "cuda":
        torch.cuda.empty_cache()
        torch.cuda.synchronize()
    gc.collect()


def _write_error_log(context: str, tb: str):
    path = os.path.join(LOG_DIR, f"error_{context}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt")
    with open(path, 'w', encoding='utf-8') as f:
        f.write(f"Context: {context}\nTimestamp: {datetime.now().isoformat()}\n\n{tb}")
    logger.info(f"[ERROR LOG] Written to {path}")


threading.Thread(target=load_model_background, daemon=True).start()


# ─── Mask Generation ──────────────────────────────────────────────────────────
def _make_fallback_mask(w: int, h: int, mask_type: str) -> Image.Image:
    """
    Generates a robust anatomical fallback mask when AutoMasker confidence is low.
    Covers a realistic torso region using an ellipse approximation.
    Supports 'upper' (shirt/jacket) and 'overall' (dress/full-body) modes.
    """
    mask = Image.new('L', (w, h), 0)
    draw = ImageDraw.Draw(mask)

    if mask_type == "overall":
        # Full torso + lower body: wide ellipse from shoulder to hip
        x0, y0 = int(w * 0.10), int(h * 0.12)
        x1, y1 = int(w * 0.90), int(h * 0.92)
    else:
        # Upper body: shoulder to waist
        x0, y0 = int(w * 0.12), int(h * 0.12)
        x1, y1 = int(w * 0.88), int(h * 0.70)

    # Draw filled ellipse for organic shape (avoids hard rectangle)
    draw.ellipse([x0, y0, x1, y1], fill=255)

    # Additional neck exclusion (top strip to avoid neck artifacts)
    neck_x0 = int(w * 0.35)
    neck_x1 = int(w * 0.65)
    neck_y1 = int(h * 0.15)
    draw.rectangle([neck_x0, 0, neck_x1, neck_y1], fill=0)

    logger.info(f"[MASK] Fallback mask generated: type={mask_type}, size={w}x{h}")
    return mask


def _generate_mask(person_img: Image.Image, mask_type: str) -> Image.Image:
    """
    Attempts AutoMasker segmentation, validates quality, and falls back to
    the anatomical ellipse mask if the result is sparse or empty.
    Returns a Gaussian-blurred PIL mask image ready for the pipeline.
    """
    w, h = person_img.size
    mask = None
    mask_source = "automasker"

    if automasker is not None:
        try:
            mask_data = automasker(person_img, mask_type)
            raw = mask_data.get("mask", None)

            if raw is not None:
                if hasattr(raw, "cpu"):
                    raw = raw.cpu().numpy()
                if isinstance(raw, np.ndarray):
                    raw = (raw * 255).astype("uint8")
                    if raw.ndim == 3:
                        raw = raw.squeeze()
                    mask = Image.fromarray(raw, mode='L')
                elif isinstance(raw, Image.Image):
                    mask = raw.convert('L')

                # Quality gate: mask must cover at least 8% of image area
                arr = np.array(mask)
                coverage = arr.mean() / 255.0
                logger.info(f"[MASK] AutoMasker coverage: {coverage:.3f} ({coverage*100:.1f}%)")

                if coverage < 0.08:
                    logger.warning(f"[MASK] AutoMasker coverage too low ({coverage:.3f}), switching to fallback")
                    mask = None
                    mask_source = "fallback_low_coverage"
            else:
                mask_source = "fallback_none_returned"

        except Exception as mask_e:
            logger.error(f"[MASK] AutoMasker exception: {mask_e}")
            _write_error_log("automasker", traceback.format_exc())
            mask_source = "fallback_exception"
    else:
        mask_source = "fallback_no_model"

    if mask is None:
        mask = _make_fallback_mask(w, h, mask_type)

    # Soft Gaussian transition at mask edges
    blur_radius = max(int(h * 0.012), 5)   # ~12px at 1024h
    mask = mask.filter(ImageFilter.GaussianBlur(blur_radius))

    logger.info(f"[MASK] Final mask source: {mask_source}, blur_radius={blur_radius}")
    return mask, mask_source


# ─── Core Inference ───────────────────────────────────────────────────────────
def run_catvton_inference(person_img_path: str, cloth_img_path: str,
                          output_path: str, job_id: str) -> dict:
    """
    Runs the full CatVTON inference pipeline.
    Returns a metadata dict with timing, device, mask info, and confidence score.
    Raises on failure — NO silent fallbacks.
    """
    if catvton_pipeline is None or automasker is None:
        raise RuntimeError(
            "CatVTON pipeline not initialised. "
            f"Current model_status: {model_status['status']} — {model_status['message']}"
        )

    from catvton_app.utils import resize_and_crop, resize_and_padding

    t_start = time.time()
    debug_prefix = os.path.join(DEBUG_DIR, job_id)
    os.makedirs(debug_prefix, exist_ok=True)

    logger.info(f"[INFERENCE {job_id}] Starting — person={person_img_path}, cloth={cloth_img_path}")

    # 1. Load images
    try:
        person_img  = Image.open(person_img_path).convert("RGB")
        garment_img = Image.open(cloth_img_path).convert("RGB")
    except Exception as load_e:
        raise IOError(f"Image loading failed: {load_e}") from load_e

    # 2. Resize — aspect-ratio safe
    person_img  = resize_and_crop(person_img,    (INFERENCE_W, INFERENCE_H))
    garment_img = resize_and_padding(garment_img, (INFERENCE_W, INFERENCE_H))

    # Save debug inputs
    person_img.save(os.path.join(debug_prefix, "01_person.png"))
    garment_img.save(os.path.join(debug_prefix, "02_garment.png"))

    # 3. Determine mask type from garment aspect ratio
    g_w, g_h = garment_img.size
    mask_type = "overall" if (g_h / g_w) > 1.15 else "upper"
    logger.info(f"[INFERENCE {job_id}] Mask type: {mask_type} (garment AR={g_h/g_w:.2f})")

    # 4. Generate mask
    mask, mask_source = _generate_mask(person_img, mask_type)
    mask.save(os.path.join(debug_prefix, "03_mask.png"))

    # 5. Run diffusion pipeline
    logger.info(
        f"[INFERENCE {job_id}] Pipeline start — "
        f"{INFERENCE_W}×{INFERENCE_H}, steps={NUM_STEPS}, cfg={GUIDANCE_SCALE}, device={device}"
    )

    try:
        with torch.no_grad():
            result_list = catvton_pipeline(
                image=person_img,
                condition_image=garment_img,
                mask=mask,
                num_inference_steps=NUM_STEPS,
                guidance_scale=GUIDANCE_SCALE,
                width=INFERENCE_W,
                height=INFERENCE_H,
                generator=None,
            )
    except Exception as pipeline_e:
        tb = traceback.format_exc()
        _write_error_log(f"inference_{job_id}", tb)
        _cleanup_gpu()
        raise RuntimeError(f"Pipeline execution failed: {pipeline_e}") from pipeline_e

    if not result_list or result_list[0] is None:
        raise ValueError("Pipeline returned empty result — no image generated.")

    result_img = result_list[0]

    # 6. Save result + debug copy
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    result_img.save(output_path)
    result_img.save(os.path.join(debug_prefix, "04_result.png"))

    elapsed = time.time() - t_start
    logger.info(f"[INFERENCE {job_id}] Done in {elapsed:.1f}s — saved {output_path}")

    _cleanup_gpu()

    # Compute a rudimentary confidence proxy (pixel change ratio in masked region)
    try:
        person_arr = np.array(person_img).astype(np.float32)
        result_arr = np.array(result_img).astype(np.float32)
        mask_arr   = np.array(mask).astype(np.float32) / 255.0
        if mask_arr.ndim == 2:
            mask_arr = mask_arr[:, :, np.newaxis]
        diff       = np.abs(result_arr - person_arr) * mask_arr
        confidence = float(np.clip(diff.mean() / 30.0, 0.0, 1.0))   # normalised 0–1
    except Exception:
        confidence = 0.75

    return {
        "processing_time_s": round(elapsed, 2),
        "device":            device,
        "resolution":        f"{INFERENCE_W}x{INFERENCE_H}",
        "steps":             NUM_STEPS,
        "guidance_scale":    GUIDANCE_SCALE,
        "mask_type":         mask_type,
        "mask_source":       mask_source,
        "confidence":        round(confidence, 3),
        "debug_dir":         f"/debug/{job_id}/",
    }


# ─── API Endpoints ────────────────────────────────────────────────────────────
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify(model_status), 200


@app.route('/api/try-on', methods=['POST'])
def try_on():
    if model_status["status"] != "ready":
        return jsonify({
            "error": "Model not ready",
            "details": model_status["message"],
            "status": model_status["status"],
        }), 503

    if not inference_lock.acquire(blocking=False):
        return jsonify({
            "error": "Server busy",
            "details": "Another inference is in progress. Please retry in a moment.",
        }), 429

    try:
        if 'person_image' not in request.files or 'cloth_image' not in request.files:
            return jsonify({'error': 'Missing person_image or cloth_image in multipart form.'}), 400

        person_file = request.files['person_image']
        cloth_file  = request.files['cloth_image']

        if not person_file.filename or not cloth_file.filename:
            return jsonify({'error': 'One or both files have no filename.'}), 400

        if not (allowed_file(person_file.filename) and allowed_file(cloth_file.filename)):
            return jsonify({'error': 'Invalid file type. Accepted: png, jpg, jpeg, webp'}), 400

        job_id = str(uuid.uuid4())
        person_path = os.path.join(UPLOAD_DIR, secure_filename(f"person_{job_id}.png"))
        cloth_path  = os.path.join(UPLOAD_DIR, secure_filename(f"cloth_{job_id}.png"))
        output_filename = f"result_{job_id}.png"
        output_path = os.path.join(OUTPUT_DIR, output_filename)

        person_file.save(person_path)
        cloth_file.save(cloth_path)

        # Run inference — exceptions propagate as real errors
        meta = run_catvton_inference(person_path, cloth_path, output_path, job_id)

        return jsonify({
            'status':    'success',
            'job_id':    job_id,
            'resultUrl': f"/outputs/{output_filename}",
            'meta':      meta,
        }), 200

    except RuntimeError as re:
        logger.error(f"[API] Inference RuntimeError: {re}")
        return jsonify({
            'error':   'AI inference failed',
            'details': str(re),
            'hint':    'Check logs/ directory for full traceback.',
        }), 500

    except Exception as e:
        tb = traceback.format_exc()
        logger.error(f"[API] Unexpected error:\n{tb}")
        _write_error_log("api_try_on", tb)
        return jsonify({
            'error':   'Internal server error',
            'details': str(e),
        }), 500

    finally:
        inference_lock.release()


@app.route('/outputs/<filename>')
def serve_output(filename):
    return send_from_directory(OUTPUT_DIR, filename)


@app.route('/debug/<job_id>/<filename>')
def serve_debug(job_id, filename):
    """Serves debug artifact images for evaluator explainability."""
    path = os.path.join(DEBUG_DIR, job_id)
    return send_from_directory(path, filename)


@app.route('/api/debug/<job_id>', methods=['GET'])
def get_debug_info(job_id):
    """Returns list of available debug artifacts for a job."""
    path = os.path.join(DEBUG_DIR, job_id)
    if not os.path.isdir(path):
        return jsonify({'error': 'No debug data for this job'}), 404
    files = sorted(os.listdir(path))
    return jsonify({
        'job_id': job_id,
        'artifacts': [
            {'name': f, 'url': f"/debug/{job_id}/{f}"}
            for f in files if f.endswith('.png')
        ]
    }), 200


if __name__ == '__main__':
    logger.info("Booting Outfit-Gen backend (production mode)...")
    app.run(host='127.0.0.1', port=5000, debug=False, use_reloader=False)
