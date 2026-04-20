import os
import uuid
import json
from fastapi import FastAPI, UploadFile, File, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List
import redis
from celery_app import celery_app

app = FastAPI(title="Virtual Try-On API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redis for status tracking
redis_client = redis.Redis(host=os.getenv("REDIS_HOST", "localhost"), port=6379, db=0, decode_responses=True)

class TryOnRequest(BaseModel):
    person_image_url: str
    garment_image_url: str
    remove_background: bool = False
    garment_description: str = "A garment"

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, job_id: str):
        await websocket.accept()
        if job_id not in self.active_connections:
            self.active_connections[job_id] = []
        self.active_connections[job_id].append(websocket)

    def disconnect(self, websocket: WebSocket, job_id: str):
        if job_id in self.active_connections:
            self.active_connections[job_id].remove(websocket)

    async def broadcast(self, job_id: str, message: dict):
        if job_id in self.active_connections:
            for connection in self.active_connections[job_id]:
                await connection.send_json(message)

manager = ConnectionManager()

@app.post("/api/tryon")
async def start_tryon(person_image: UploadFile = File(...), garment_image: UploadFile = File(...), remove_bg: bool = False):
    job_id = str(uuid.uuid4())
    
    # In a real app, we'd upload to S3/Cloudinary here.
    # For this demo, we'll assume the worker handles the file bytes or we use temp storage.
    # We'll save them to a local temp dir for the worker to pick up.
    os.makedirs("temp", exist_ok=True)
    person_path = f"temp/{job_id}_person.png"
    garment_path = f"temp/{job_id}_garment.png"
    
    with open(person_path, "wb") as f:
        f.write(await person_image.read())
    with open(garment_path, "wb") as f:
        f.write(await garment_image.read())

    # Queue the Celery task
    from tasks import process_tryon_task
    process_tryon_task.delay(job_id, person_path, garment_path, remove_bg)
    
    redis_client.set(f"status:{job_id}", json.dumps({"progress": 0, "status": "Queued", "step": "Initial preparation"}))
    
    return {"job_id": job_id}

@app.get("/api/status/{job_id}")
async def get_status(job_id: str):
    status_data = redis_client.get(f"status:{job_id}")
    if not status_data:
        return {"error": "Job not found"}
    return json.loads(status_data)

@app.websocket("/ws/{job_id}")
async def websocket_endpoint(websocket: WebSocket, job_id: str):
    await manager.connect(websocket, job_id)
    try:
        # Send initial status
        status_data = redis_client.get(f"status:{job_id}")
        if status_data:
            await websocket.send_json(json.loads(status_data))
        
        while True:
            # Keep connection alive, or handle client messages if needed
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, job_id)

@app.get("/api/result/{job_id}")
async def get_result(job_id: str):
    result = redis_client.get(f"result:{job_id}")
    if not result:
        return {"error": "Result not ready or not found"}
    return {"image_url": result}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
