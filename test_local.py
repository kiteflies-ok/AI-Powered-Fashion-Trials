import os
import sys
import time

sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

# Load test image
person_path = r"d:\Repo\Vrtual-try-system\backend\static\uploads\person_19a551f7-e4f0-4077-a369-1a758f07a4f8.png"
cloth_path = r"d:\Repo\Vrtual-try-system\backend\static\uploads\cloth_19a551f7-e4f0-4077-a369-1a758f07a4f8.png"
out_path = os.path.join(os.path.dirname(__file__), "test_output.png")

import backend.app as app

print("Waiting for model to load...")
app.load_model_background()
while app.catvton_pipeline is None:
    time.sleep(1)

print("Running inference...")
app.run_catvton_inference(person_path, cloth_path, out_path)
print("Done!")
