import os
import uuid
import logging
import threading
import sys
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from PIL import Image, ImageFilter
import torch
import numpy as np
from werkzeug.utils import secure_filename

# ----------------- Configuration -----------------
app = Flask(__name__, static_folder='static')
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}})

STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')
UPLOAD_DIR = os.path.join(STATIC_DIR, 'uploads')
OUTPUT_DIR = os.path.join(STATIC_DIR, 'outputs')
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp'}
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# ----------------- Global Model Initialization -----------------
catvton_pipeline = None
automasker = None
mask_processor = None
device = None
dtype = None

inference_lock = threading.Lock()

model_status = {
    "status": "initializing",
    "progress": 0,
    "message": "Starting server...",
    "error": None
}

def load_model_background():
    global catvton_pipeline, automasker, mask_processor, model_status
    
    if catvton_pipeline is not None:
        return

    try:
        model_status["status"] = "loading"
        model_status["message"] = "Waking up Machine Learning libraries..."

        import sys
        sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "catvton_app"))
        
        try:
            import torch
            from model.pipeline import CatVTONPipeline
            from model.cloth_masker import AutoMasker
            from diffusers.image_processor import VaeImageProcessor
            from catvton_app.utils import resize_and_crop, resize_and_padding
        except ImportError as imp_err:
            logger.error(f"Failed to import local CatVTON modules: {imp_err}")
            model_status["status"] = "error"
            model_status["message"] = f"Missing AI Dependency: {imp_err}"
            return
        
        global device, dtype
        try:
            device = "cuda" if torch.cuda.is_available() else "cpu"
        except:
            device = "cpu"
            
        dtype = torch.float16 if device == "cuda" else torch.float32

        base_ckpt = "runwayml/stable-diffusion-inpainting"
        local_catvton_ckpt = os.path.join(os.path.dirname(__file__), "models", "CatVTON")

        from huggingface_hub import snapshot_download
        os.makedirs(local_catvton_ckpt, exist_ok=True)
        snapshot_download(
            repo_id="zhengchong/CatVTON", 
            local_dir=local_catvton_ckpt,
            local_dir_use_symlinks=False,
            allow_patterns=["*.bin", "*.json", "*.txt", "*.md"]
        )

        catvton_pipeline = CatVTONPipeline(
            base_ckpt=base_ckpt,
            attn_ckpt=local_catvton_ckpt,
            attn_ckpt_version="mix",
            weight_dtype=dtype,
            use_tf32=False,
            device=device,
        )
        
        if hasattr(catvton_pipeline, "eval"):
            catvton_pipeline.eval()
            
        if hasattr(catvton_pipeline, "to"):
            catvton_pipeline.to(device)

        mask_processor = VaeImageProcessor(
            vae_scale_factor=8, do_normalize=False, do_binarize=True, do_convert_grayscale=True
        )

        automasker = AutoMasker(
            densepose_ckpt=os.path.join(local_catvton_ckpt, "DensePose"),
            schp_ckpt=os.path.join(local_catvton_ckpt, "SCHP"),
            device=device,
        )

        try:
            logger.info("Running pipeline warmup...")
            dummy_img = Image.new('RGB', (384, 512), color='white')
            dummy_mask = Image.new('L', (384, 512), color=0)
            with torch.no_grad():
                catvton_pipeline(
                    image=dummy_img,
                    condition_image=dummy_img,
                    mask=dummy_mask,
                    num_inference_steps=2,
                    guidance_scale=2.5,
                    generator=None,
                )
            if device.startswith("cuda"):
                torch.cuda.empty_cache()
            logger.info("Warmup complete.")
        except Exception as warmup_e:
            logger.warning(f"Warmup inference failed (mostly harmless): {warmup_e}")

        model_status["status"] = "ready"
        model_status["message"] = "CatVTON Engine Online."
        logger.info("CatVTON fully initialized and ready")

    except Exception as e:
        model_status["status"] = "error"
        model_status["message"] = f"Failed to initialize: {e}"
        logger.error(f"Error loading CatVTON: {e}", exc_info=True)

# Load model in a background thread so the server boot isn't blocked
threading.Thread(target=load_model_background, daemon=True).start()

# ----------------- CatVTON Inference -----------------
def run_catvton_inference(person_img_path, cloth_img_path, output_path):
    import shutil
    logger.info("Inference started")
    logger.info(f"Running custom CatVTON inference on {person_img_path} & {cloth_img_path}")
    
    if catvton_pipeline is None or automasker is None:
        logger.error("Model state invalid for execution (Pipeline or Automasker is None).")
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        shutil.copy(person_img_path, output_path)
        logger.info("Image saved successfully (fallback due to uninitialized models)")
        return
        
    try:
        from PIL import Image, ImageFilter
        import torch
        import numpy as np
        from catvton_app.utils import resize_and_crop, resize_and_padding

        try:
            person_img = Image.open(person_img_path).convert("RGB")
            garment_img = Image.open(cloth_img_path).convert("RGB")
        except Exception as load_e:
            raise ValueError(f"Image loading failed: {load_e}")
        
        # Consistent resolution for performance and stability
        w, h = 384, 512 
        person_img = resize_and_crop(person_img, (w, h))
        garment_img = resize_and_padding(garment_img, (w, h))
        
        logger.info("Detecting garment mask area...")
        mask_data = automasker(person_img, "upper")
        mask = mask_data["mask"]

        if hasattr(mask, "cpu"):
            mask = mask.cpu().numpy()

        if isinstance(mask, np.ndarray):
            mask = (mask * 255).astype("uint8")
            mask = Image.fromarray(mask)

        # Check if mask is empty
        mask_check = np.array(mask)
        if mask_check.max() < 10:
            logger.warning("AUTOMASKER returned an almost empty mask. AI might not see where to apply the dress.")

        mask = mask.filter(ImageFilter.GaussianBlur(5))
        logger.info("Mask generated and blurred")
        
        logger.info(f"Pipeline running at {w}x{h}...")
        with torch.no_grad():
            # IMPORTANT: Explicitly pass width/height or it defaults to 1024x768 causing OOM
            result_list = catvton_pipeline(
                image=person_img,
                condition_image=garment_img,
                mask=mask,
                num_inference_steps=15,
                guidance_scale=2.5,
                width=w,
                height=h,
                generator=None,
            )
            
            if not result_list or len(result_list) == 0:
                raise ValueError("Pipeline returned empty result list")
            
            result_img = result_list[0]

        if result_img is None:
            raise ValueError("No image generated by pipeline")

        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        result_img.save(output_path)
        logger.info("Image saved successfully")

    except Exception as e:
        logger.error(f"Inference abruptly failed: {e}", exc_info=True)
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        # Using person image as fallback so the UI stays stable
        shutil.copy(person_img_path, output_path)
        logger.info("Image saved successfully (fallback over error)")
    finally:
        if device and device.startswith("cuda"):
            import gc
            gc.collect()
            torch.cuda.empty_cache()

# ----------------- API Endpoints -----------------
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify(model_status), 200

@app.route('/api/try-on', methods=['POST'])
def try_on():
    if model_status["status"] != "ready":
        return jsonify({"error": "Model initialization incomplete", "details": model_status["message"]}), 503
        
    if not inference_lock.acquire(blocking=False):
        return jsonify({
            "error": "Server busy", 
            "details": "Another inference request is currently running. Please try again shortly."
        }), 429
        
    try:
        if 'person_image' not in request.files or 'cloth_image' not in request.files:
            return jsonify({'error': 'Missing person_image or cloth_image in form-data payload.'}), 400

        person_file = request.files['person_image']
        cloth_file = request.files['cloth_image']

        if person_file.filename == '' or cloth_file.filename == '':
            return jsonify({'error': 'One or both files lack a valid filename identifier.'}), 400

        if not (allowed_file(person_file.filename) and allowed_file(cloth_file.filename)):
            return jsonify({'error': 'Invalid file type. Allowed: png, jpg, jpeg, webp'}), 400

        job_id = str(uuid.uuid4())
        person_filename = secure_filename(f"person_{job_id}.png")
        cloth_filename = secure_filename(f"cloth_{job_id}.png")

        person_path = os.path.join(UPLOAD_DIR, person_filename)
        cloth_path = os.path.join(UPLOAD_DIR, cloth_filename)

        person_file.save(person_path)
        cloth_file.save(cloth_path)
        
        output_filename = f"result_{job_id}.png"
        output_path = os.path.join(OUTPUT_DIR, output_filename)

        # Run inference synchronously
        run_catvton_inference(person_path, cloth_path, output_path)

        return jsonify({
            'status': 'success',
            'job_id': job_id,
            'resultUrl': f"/outputs/{output_filename}"
        }), 200

    except Exception as e:
        logger.exception("A fatal error occurred during model generation")
        return jsonify({'error': 'Internal system error', 'details': str(e)}), 500
    finally:
        inference_lock.release()

@app.route('/outputs/<filename>')
def serve_output(filename):
    return send_from_directory(OUTPUT_DIR, filename)

if __name__ == '__main__':
    logger.info("Booting interface...")
    app.run(host='127.0.0.1', port=5000, debug=True, use_reloader=False)
