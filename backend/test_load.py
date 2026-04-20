import os
os.environ['HF_ENDPOINT'] = 'https://hf-mirror.com'
from diffusers import DiffusionPipeline
import traceback
try:
    print("Testing pipeline load with trust_remote_code...")
    pipe = DiffusionPipeline.from_pretrained("Zheng-Chong/CatVTON", trust_remote_code=True)
    print("Success!!!")
except Exception as e:
    print("Failed!!!")
    traceback.print_exc()
