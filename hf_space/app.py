import gradio as gr
import spaces
import torch
import threading
from diffusers import DiffusionPipeline
from PIL import Image

inference_lock = threading.Lock()

print("Initializing CatVTON Pipeline...")
# This will default to CPU first so Spaces doesn't waste GPU time setting up.
pipeline = DiffusionPipeline.from_pretrained(
    "zhengchong/CatVTON", 
    torch_dtype=torch.float16
)
# Enable slicing to keep VRAM footprint low
pipeline.enable_attention_slicing()

@spaces.GPU  # This decorator dynamically assigns a GPU on HuggingFace zero-GPU spaces at runtime
def process_tryon(person_img, garment_img):
    """
    Main inference entrypoint.
    Takes two gradio image components and outputs the styled image string URL.
    """
    global pipeline
    
    if not inference_lock.acquire(blocking=False):
        raise gr.Error("Server busy: Another inference request is actively utilizing the GPU queue. Please try again shortly.")
        
    try:
        if person_img is None or garment_img is None:
            raise gr.Error("Both Person and Garment images are required.")
    
        # Convert paths or NumPy arrays to PIL Images properly if Gradio sends numpy (type="pil" used below prevents this).
        
        # Push pipeline to GPU memory assigned by @spaces decorator.
        pipeline = pipeline.to("cuda")
        
        # Standard inference size
        p_img = person_img.resize((768, 1024))
        g_img = garment_img.resize((768, 1024))
        
        print("Running GPU inference...")
        with torch.no_grad():
            # Using optimal 40 steps for cloud GPU since speed isn't an issue
            result = pipeline(
                person_image=p_img,
                garment_image=g_img,
                category="upper_body",
                num_inference_steps=40,
                guidance_scale=2.5,
                width=768,
                height=1024
            ).images[0]
            
        # Free up GPU for other users immediately
        pipeline = pipeline.to("cpu")
        
        return result
    finally:
        inference_lock.release()

# Construct the Gradio Interface
# We specify api_name="predict" via simple interface deployment to automatically expose a POST /api/predict
demo = gr.Interface(
    fn=process_tryon,
    inputs=[
        gr.Image(type="pil", label="Person Image"),
        gr.Image(type="pil", label="Garment Image")
    ],
    outputs=gr.Image(type="pil", label="Result"),
    title="Virtual Try-On Cloud API",
    description="This is the cloud backend engine for your React App. DO NOT use the web UI directly if configured via API."
)

if __name__ == "__main__":
    demo.launch()
