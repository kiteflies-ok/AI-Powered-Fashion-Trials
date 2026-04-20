import os
import sys
import torch
from huggingface_hub import snapshot_download

os.environ['HF_ENDPOINT'] = 'https://hf-mirror.com'
sys.path.append(os.path.join(os.path.dirname(__file__), 'catvton_app'))

try:
    from model.cloth_masker import AutoMasker
    from model.pipeline import CatVTONPipeline
except ImportError as e:
    print("IMPORT ERROR:", e)

device = "cpu"
print("DEVICE:", device)
try:
    repo_path = snapshot_download(repo_id="zhengchong/CatVTON")
    print("REPO PATH:", repo_path)
    pipeline = CatVTONPipeline(
        base_ckpt="booksforcharlie/stable-diffusion-inpainting",
        attn_ckpt=repo_path,
        attn_ckpt_version="mix",
        weight_dtype=torch.float32,
        use_tf32=False,
        device=device
    )
    print("PIPELINE OK")
    from diffusers.image_processor import VaeImageProcessor
    mask_processor = VaeImageProcessor(vae_scale_factor=8, do_normalize=False, do_binarize=True, do_convert_grayscale=True)
    automasker = AutoMasker(
        densepose_ckpt=os.path.join(repo_path, "DensePose"),
        schp_ckpt=os.path.join(repo_path, "SCHP"),
        device=device, 
    )
    print("AUTOMASKER OK")
except Exception as e:
    import traceback
    print("EXCEPTION:")
    traceback.print_exc()
