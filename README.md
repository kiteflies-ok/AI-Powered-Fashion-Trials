# Outfit-Gen: AI-Powered Virtual Try-On System

Outfit-Gen is a high-fidelity, open-source AI Virtual Try-On application designed to seamlessly project garments onto photos of individuals. By utilizing a diffusion-based deep learning pipeline, the application allows users to upload a photo of themselves and an outfit to see how it looks in real-time.

---

## 🌟 Key Features

- **Interactive Try-On Studio**: Drag-and-drop / click-to-upload interface featuring dynamic 3D perspective tilt cards, visual scanline loading, and a custom particle engine.
- **Before-and-After Slider**: Interactive sliding overlay to compare the original image and the generated virtual try-on result.
- **Studio Gallery**: Pre-curated catalog of models and garments with filtering options. Features smart outfit matching that auto-selects combinations with consistent gender, pose, and lighting.
- **Hardware-Adaptive AI Engine**: Automatic fallback detection to run optimally on Nvidia GPUs (CUDA), Intel Arc GPUs (DirectML), or CPU.
- **Visual Micro-Animations**: Sleek design featuring custom glassmorphism, responsive cursor glow, morphing background blobs, and an animated rocket thrust heading effect.

---

## ⚙️ Project Architectures

Outfit-Gen contains multiple architectural designs tailored for different environments:

```mermaid
graph TD
    subgraph Local Development (Active Stack)
        Vite[React + Vite Frontend] <-->|Proxy /api/*| Flask[Flask API Server]
        Flask <-->|Inference Lock| CatVTON[CatVTON Pipeline + AutoMasker]
    end

    subgraph Production Architecture (Docker-Compose)
        NextJS[Next.js Frontend] <--> FastAPI[FastAPI Server]
        FastAPI <--> Redis[(Redis Message Broker)]
        Redis <--> Celery[Celery Workers]
        Celery <--> Replicate[Replicate IDM-VTON API]
    end

    subgraph Cloud Deployment
        HF[HuggingFace Space] <--> Gradio[Gradio Web UI]
        Gradio <--> ZeroGPU[ZeroGPU Pipeline]
    end
```

### 1. Local Development (Flask + Vite)
- **Frontend**: Single-Page React App built on Vite, utilizing TailwindCSS and custom HSL colors. It polls the backend health status and handles canvas image transformations before uploading.
- **Backend**: Synchronous Flask server that locks CUDA inference to one job at a time. It manages local file storage, serves the generated outputs, and loads PyTorch model weights on startup in a daemon thread.

### 2. Production Architecture (Dockerized FastAPI + Celery)
- **Frontend**: Next.js web client communicating via WebSockets for real-time job state notifications.
- **Backend Orchestration**: An asynchronous FastAPI gateway that routes tasks to a Celery worker pool backed by Redis.
- **AI Processing**: Calls the cloud-based Replicate API running the IDM-VTON model, freeing up local system resources.

### 3. HuggingFace Spaces Deployment
- A standalone Gradio web app designed to be hosted directly on HuggingFace.
- Utilizes HuggingFace's ZeroGPU `@spaces.GPU` decorator to dynamically allocate GPU compute per request, leveraging attention slicing to keep memory footprints low.

---

## 🧠 AI Model & Inference Pipeline

The core try-on pipeline is powered by **CatVTON** (Concatenation-based Virtual Try-ON), a deep learning model that stitches garment and person features directly inside the attention mechanism of a Stable Diffusion inpainting model.

1. **AutoMasker Generation**:
   - Uses **DensePose** to parse the person's body part segments.
   - Combines it with **SCHP (Self-Correction for Human Parsing)** to refine the garment contours.
   - Automatically determines whether an `upper`, `lower`, or `overall` torso mask is required based on garment aspect ratios.
   
2. **Diffusion Processing**:
   - Resizes input images to 384×512 (aspect ratio optimized for local inference speed).
   - Feeds the original image, target garment image, and generated binary mask to the CatVTON pipeline.
   - Executes diffusion across 15 steps (local CPU/GPU default) or 40 steps (cloud GPU) with a guidance scale of 2.5.
   - Applies Gaussian blur to mask margins for natural fabric blending.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend UI** | React 18, Vite 5, TailwindCSS 3, Lucide Icons, Canvas API |
| **Interactive Components** | Intersection Observer (Scroll Reveal), Custom Cursor Glow, 3D Card Tilt Hook, Before-After Slider |
| **Active Local Backend** | Python 3.10+, Flask, PyTorch, Hugging Face Hub Client |
| **Alternative Backend** | FastAPI, Celery, Redis, Docker Compose |
| **Cloud Deployment** | Gradio, HuggingFace Spaces (ZeroGPU) |
| **AI Models** | CatVTON (zhengchong/CatVTON), DensePose, SCHP, IDM-VTON (yisol/idm-vton) |

---

## 📂 Repository Layout

- [src/](file:///d:/Repo/Vrtual-try-system/src) — Single-page React frontend application.
  - [components/](file:///d:/Repo/Vrtual-try-system/src/components) — Interactive elements like [ImageUploadCard.jsx](file:///d:/Repo/Vrtual-try-system/src/components/ImageUploadCard.jsx), [ResultDisplay.jsx](file:///d:/Repo/Vrtual-try-system/src/components/ResultDisplay.jsx), [GallerySection.jsx](file:///d:/Repo/Vrtual-try-system/src/components/GallerySection.jsx), and [BeforeAfterSlider.jsx](file:///d:/Repo/Vrtual-try-system/src/components/BeforeAfterSlider.jsx).
  - [index.css](file:///d:/Repo/Vrtual-try-system/src/index.css) — Custom animations, noise textures, glassmorphism styles, and CSS blobs.
- [backend/](file:///d:/Repo/Vrtual-try-system/backend) — Native Flask API server wrapping local PyTorch CatVTON.
  - [app.py](file:///d:/Repo/Vrtual-try-system/backend/app.py) — Main entry point for Flask endpoints.
  - [catvton_app/](file:///d:/Repo/Vrtual-try-system/backend/catvton_app) — Core model pipeline classes, cloth masking logic, and DensePose helpers.
- [virtual-tryon/](file:///d:/Repo/Vrtual-try-system/virtual-tryon) — Celery + Redis + FastAPI production Docker application.
- [hf_space/](file:///d:/Repo/Vrtual-try-system/hf_space) — Codebase for hosting a demo directly on HuggingFace Space.
- [PROJECT_OVERVIEW.js](file:///d:/Repo/Vrtual-try-system/PROJECT_OVERVIEW.js) — Detailed developer map of the repository's code flows and architecture.

