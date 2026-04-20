# Virtual Try-On System

An entirely self-contained, open-source AI Virtual Try-On application. The frontend uses **React + Vite** and the backend is a native **Python Flask** wrapper around the state-of-the-art **CatVTON** deep learning model.

## Prerequisites
- **Node.js** (v18+)
- **Python** (v3.10+) 
- **Git**

## Setup & Installation

### 1. Install Frontend Dependencies
From the root directory, simply run:
```bash
npm install
```

### 2. Set Up the Python Backend
Because the AI processing happens exactly on your machine implicitly through Hugging Face, you need to populate the backend with the required AI libraries:

```bash
# Navigate to backend
cd backend

# Create a virtual environment (Windows)
python -m venv venv
.\venv\Scripts\activate

# Install the Python dependencies (Diffusers, PyTorch, Gradio adapters)
pip install -r requirements.txt
```

> **Note on Hardware Requirements:** 
> The backend gracefully degrades based on your hardware. If an NVIDIA GPU (CUDA) is detected, it will run optimally. If an Intel Arc GPU is detected, it falls back to the `torch-directml` tensor interface. If neither is available, it silently falls back to standard CPU inference. CPU inference can take 2-5 minutes per request. 

### 3. Missing `detectron2` or Compiling Errors (Windows)
The native `AutoMasker` dynamically imports complex mapping structures, which sometimes trigger C++ build errors on Windows. If your `pip install` fails constantly due to Windows building errors, consider replacing standard CPU inference with an online inference wrapper like Replicate. 

## Running the Application Locally
Once both the Node modules and Python packages are installed, you don't actually need to start them separately! 

Return to your project root `virtual-try-on/` and run:
```bash
npm run dev:all
```
This single command spins up both the Flask backend on `http://localhost:5000` and the Vite frontend on `http://localhost:5173/` simultaneously. 

* The very first time it boots, the backend silently pulls down the ~10GB model weights into your `.cache/huggingface/` directory over the HF mirror network.
* When the UI initializes, just upload your images and hit **Try It On**. The resulting deep-learning composite will be served locally into your `backend/static/outputs/` directory.
