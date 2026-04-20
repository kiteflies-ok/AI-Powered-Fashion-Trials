import os
import json
import redis
import replicate
from PIL import Image
from rembg import remove
from celery_app import celery_app

redis_client = redis.Redis(host=os.getenv("REDIS_HOST", "localhost"), port=6379, db=0, decode_responses=True)

def update_status(job_id, progress, status, step):
    data = {"progress": progress, "status": status, "step": step}
    redis_client.set(f"status:{job_id}", json.dumps(data))
    # In a real app, we might trigger a webhook or use a separate pub/sub for WebSockets.
    # The main app's WebSocket endpoint can poll Redis or use Redis Pub/Sub.

@celery_app.task(name="process_tryon_task")
def process_tryon_task(job_id, person_path, garment_path, remove_bg):
    try:
        # Step 1: Background Removal (Optional)
        if remove_bg:
            update_status(job_id, 10, "Processing", "Removing garment background")
            input_image = Image.open(garment_path)
            output_image = remove(input_image)
            output_image.save(garment_path)
        
        # Step 2: Pose Detection & Segmentation simulation
        update_status(job_id, 30, "Processing", "Detecting pose and partitioning body")
        # IDM-VTON on Replicate handles most of this internally
        
        # Step 3: Calling Replicate API
        update_status(job_id, 50, "Processing", "Generating try-on result (IDM-VTON)")
        
        replicate_client = replicate.Client(api_token=os.getenv("REPLICATE_API_TOKEN"))
        
        # Check for local fallback (simulated)
        if os.getenv("USE_LOCAL_DIFFUSERS") == "true":
             update_status(job_id, 60, "Processing", "Running on local GPU...")
             # Local diffusers logic would go here
             pass

        # Using the specified model yisol/idm-vton
        # Note: Input parameters might vary slightly depending on the exact version on Replicate.
        # We'll use common parameters for IDM-VTON.
        input_data = {
            "human_img": open(person_path, "rb"),
            "garm_img": open(garment_path, "rb"),
            "garment_des": "Modern garment",
            "is_checked": True,
            "is_checked_crop": False,
            "denoise_steps": 30,
            "seed": 42
        }
        
        output = replicate_client.run(
            "yisol/idm-vton:c8718e02", # Example version hash
            input=input_data
        )
        
        # Output is usually a list of URLs or a single URL
        result_url = output[0] if isinstance(output, list) else output
        
        # Final Step: Done
        redis_client.set(f"result:{job_id}", result_url)
        update_status(job_id, 100, "Completed", "Done")
        
    except Exception as e:
        update_status(job_id, 0, "Failed", str(e))
        print(f"Task failed: {e}")
    finally:
        # Clean up temp files
        if os.path.exists(person_path): os.remove(person_path)
        if os.path.exists(garment_path): os.remove(garment_path)
