import urllib.request
import io
import urllib.error
from PIL import Image

person = Image.new('RGB', (100, 100), color='red')
cloth = Image.new('RGB', (100, 100), color='blue')
person_bytes = io.BytesIO()
cloth_bytes = io.BytesIO()
person.save(person_bytes, format='PNG')
cloth.save(cloth_bytes, format='PNG')

boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW'
body = []

body.append(f'--{boundary}\r\nContent-Disposition: form-data; name="person_image"; filename="person.png"\r\nContent-Type: image/png\r\n\r\n'.encode('utf-8'))
body.append(person_bytes.getvalue())
body.append(b'\r\n')

body.append(f'--{boundary}\r\nContent-Disposition: form-data; name="cloth_image"; filename="cloth.png"\r\nContent-Type: image/png\r\n\r\n'.encode('utf-8'))
body.append(cloth_bytes.getvalue())
body.append(b'\r\n')
body.append(f'--{boundary}--\r\n'.encode('utf-8'))
data = b''.join(body)

req = urllib.request.Request('http://127.0.0.1:5000/api/try-on', data=data, method='POST')
req.add_header('Content-Type', f'multipart/form-data; boundary={boundary}')

try:
    print(urllib.request.urlopen(req).read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print(f'HTTP Error: {e.code}')
    print(e.read().decode('utf-8'))
