import os
import requests
import io
import time
from PIL import Image, ImageDraw

def create_test_images():
    person = Image.new('RGB', (384, 512), color='red')
    # Draw something so it's not totally blank
    draw_p = ImageDraw.Draw(person)
    draw_p.ellipse([100, 100, 200, 200], fill='pink') # fake face
    draw_p.rectangle([100, 200, 280, 450], fill='blue') # fake body
    
    cloth = Image.new('RGB', (384, 512), color='green')
    draw_c = ImageDraw.Draw(cloth)
    draw_c.rectangle([100, 100, 280, 400], fill='yellow') # fake shirt
    
    person_bytes = io.BytesIO()
    cloth_bytes = io.BytesIO()
    person.save(person_bytes, format='PNG')
    cloth.save(cloth_bytes, format='PNG')
    
    return person_bytes.getvalue(), cloth_bytes.getvalue(), person

def test_inference(iteration, person_bytes, cloth_bytes, person_image):
    print(f"--- Running Test {iteration}/50 ---")
    boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
    body = []

    body.append(f'--{boundary}\r\nContent-Disposition: form-data; name="person_image"; filename="person.png"\r\nContent-Type: image/png\r\n\r\n'.encode('utf-8'))
    body.append(person_bytes)
    body.append(b'\r\n')

    body.append(f'--{boundary}\r\nContent-Disposition: form-data; name="cloth_image"; filename="cloth.png"\r\nContent-Type: image/png\r\n\r\n'.encode('utf-8'))
    body.append(cloth_bytes)
    body.append(b'\r\n')
    body.append(f'--{boundary}--\r\n'.encode('utf-8'))
    data = b''.join(body)

    headers = {'Content-Type': f'multipart/form-data; boundary={boundary}'}
    try:
        response = requests.post('http://127.0.0.1:5000/api/try-on', data=data, headers=headers)
        if response.status_code == 200:
            res_json = response.json()
            result_url = res_json.get('resultUrl')
            
            # Download and verify the result
            if result_url:
                time.sleep(1) # wait a moment for the file system to sync
                res_img_req = requests.get(f"http://127.0.0.1:5000{result_url}")
                if res_img_req.status_code == 200:
                    result_img = Image.open(io.BytesIO(res_img_req.content))
                    # Check if it fell back
                    if list(result_img.getdata()) == list(person_image.getdata()):
                        print(f"Test {iteration} FAILED: Image fell back to original person image.")
                        return False
                    else:
                        print(f"Test {iteration} SUCCESS: Valid new image generated.")
                        return True
                else:
                    print(f"Test {iteration} FAILED: Output image not found.")
                    return False
            else:
                print(f"Test {iteration} FAILED: No result URL in response.")
                return False
        else:
            print(f"Test {iteration} FAILED: HTTP {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"Test {iteration} FAILED with Exception: {e}")
        return False

def main():
    person_bytes, cloth_bytes, person_image = create_test_images()
    
    # Wait for server to be ready
    print("Waiting for server to be ready...")
    ready = False
    for _ in range(60):
        try:
            health = requests.get('http://127.0.0.1:5000/api/health').json()
            if health.get('status') == 'ready':
                ready = True
                break
        except:
            pass
        time.sleep(2)
        
    if not ready:
        print("Server not ready. Exiting.")
        return
        
    print("Server ready. Starting 50 iterations test...")
    success_count = 0
    for i in range(1, 51):
        if test_inference(i, person_bytes, cloth_bytes, person_image):
            success_count += 1
        else:
            print("Test failed. Aborting further tests.")
            break
            
    print(f"=== TEST RUN COMPLETE: {success_count}/50 SUCCESSFUL ===")

if __name__ == '__main__':
    main()
