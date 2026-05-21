
// ============================================================
//  PROJECT OVERVIEW — Outfit-Gen (Virtual Try-On System)
//  A comprehensive, commented map of every layer of this repo.
//  Read top-to-bottom for a full mental model of the project.
// ============================================================

// ──────────────────────────────────────────────────────────
// 1. WHAT IS THIS PROJECT?
// ──────────────────────────────────────────────────────────
//
// "Outfit-Gen" is an AI-powered Virtual Try-On web application.
// A user uploads two images:
//   (A) A photo of themselves (the "person" image)
//   (B) A photo of a garment (the "cloth" image)
//
// The AI engine composites the garment onto the person using a
// diffusion-based deep-learning model called CatVTON, producing
// a realistic photo of the person wearing that garment.
//
// The result is displayed inside the React frontend.
//
// ──────────────────────────────────────────────────────────
// 2. TECH STACK SUMMARY
// ──────────────────────────────────────────────────────────
//
//  Layer              | Technology
//  ─────────────────────────────────────────────────────────
//  Frontend           | React 18, Vite 5, TailwindCSS 3
//  Routing            | react-router-dom v7
//  Icons              | lucide-react
//  Backend (active)   | Python Flask + CatVTON (PyTorch)
//  Backend (alt/cloud)| FastAPI + Celery + Redis + Replicate API
//  HF Cloud Deploy    | Gradio + HuggingFace Spaces (ZeroGPU)
//  AI Model           | CatVTON (zhengchong/CatVTON on HF Hub)
//  Base Diffusion     | runwayml/stable-diffusion-inpainting
//  Masking            | AutoMasker (DensePose + SCHP)
//  Dev Orchestration  | concurrently (npm run dev:all)
//  Containerization   | Docker Compose (virtual-tryon/ sub-project)
//
// ──────────────────────────────────────────────────────────
// 3. REPOSITORY STRUCTURE
// ──────────────────────────────────────────────────────────
//
//  d:\Repo\Vrtual-try-system\
//  │
//  ├── index.html                  # Vite entry HTML, mounts <div id="root">
//  ├── vite.config.js              # Vite config — proxies /api/* → Flask :5000
//  ├── package.json                # npm scripts, React + Vite deps
//  ├── tailwind.config.js          # Tailwind theme (custom animations, fonts)
//  ├── postcss.config.js           # PostCSS (Tailwind + Autoprefixer)
//  ├── .env / .env.example         # REPLICATE_API_TOKEN env var
//  ├── test_local.py               # Standalone Python script to test backend
//  ├── test_output.png             # Sample output image from an inference run
//  │
//  ├── src/                        # ← REACT FRONTEND (all UI code)
//  │   ├── main.jsx                # ReactDOM.createRoot entry, wraps <App>
//  │   ├── App.jsx                 # Root component — state, routing, layout
//  │   ├── index.css               # Global design system (glassmorphism, blobs,
//  │   │                           #   animations, cursor glow, custom scrollbar)
//  │   ├── galleryData.js          # Static data: DRESSES[], MODELS[],
//  │   │                           #   CATEGORIES, COLORS, SIZES arrays
//  │   ├── components/
//  │   │   ├── Header.jsx          # Top nav bar with logo + nav links
//  │   │   ├── Footer.jsx          # Bottom footer with legal links
//  │   │   ├── AIStatus.jsx        # Shows AI engine warmup / ready / error state
//  │   │   ├── ImageUploadCard.jsx # Drag-and-drop / click upload card (with 3D tilt)
//  │   │   ├── TryOnButton.jsx     # The primary CTA button with loading state
//  │   │   ├── ResultDisplay.jsx   # Shows AI result image, loading overlay, download
//  │   │   ├── GallerySection.jsx  # Studio gallery — model + outfit picker + preview
//  │   │   ├── BeforeAfterSlider.jsx # Interactive drag slider comparing before/after
//  │   │   ├── TransformationShowcase.jsx # Static section using BeforeAfterSlider
//  │   │   ├── HowItWorks.jsx      # Numbered steps explaining the process
//  │   │   ├── AboutSection.jsx    # Mission / tech description section
//  │   │   ├── StatsBar.jsx        # Animated stat numbers (accuracy, users etc.)
//  │   │   └── CanvasParticles.jsx # Optional canvas-based particle background
//  │   └── pages/
//  │       ├── Contact.jsx         # /contact page with form UI
//  │       ├── Privacy.jsx         # /privacy policy page
//  │       └── Terms.jsx           # /terms of service page
//  │
//  ├── public/                     # Static assets served by Vite
//  │   ├── placeholder-person.png  # Default person image shown on first load
//  │   └── placeholder-garment.png # Default garment image shown on first load
//  │
//  ├── backend/                    # ← ACTIVE PYTHON FLASK BACKEND
//  │   ├── app.py                  # Main Flask server — ALL API endpoints live here
//  │   ├── requirements.txt        # Flask, torch, diffusers, Pillow, huggingface_hub
//  │   ├── static/
//  │   │   ├── uploads/            # Temp storage for incoming person+cloth images
//  │   │   └── outputs/            # AI-generated result images served back to UI
//  │   ├── models/
//  │   │   └── CatVTON/            # Auto-downloaded model weights from HF Hub
//  │   │       ├── DensePose/      # Pose estimation weights for AutoMasker
//  │   │       └── SCHP/           # Self-Correction for Human Parsing weights
//  │   └── catvton_app/            # CatVTON source (forked from zhengchong/CatVTON)
//  │       ├── app.py              # Original Gradio demo (not used by Flask server)
//  │       ├── app_flux.py         # FLUX-based variant (experimental)
//  │       ├── app_p2p.py          # Pair-to-pair variant (experimental)
//  │       ├── inference.py        # Batch CLI inference script (VITON-HD / DressCode)
//  │       ├── eval.py             # Evaluation metrics script
//  │       ├── utils.py            # resize_and_crop, resize_and_padding helpers
//  │       ├── preprocess_agnostic_mask.py  # Mask preprocessing utility
//  │       ├── model/
//  │       │   ├── pipeline.py     # CatVTONPipeline class (core diffusion pipeline)
//  │       │   └── cloth_masker.py # AutoMasker: DensePose + SCHP → binary mask
//  │       └── densepose/          # DensePose model utilities
//  │
//  ├── virtual-tryon/              # ← ALTERNATIVE PRODUCTION-GRADE ARCHITECTURE
//  │   │                           #   (Docker-based, not the active dev setup)
//  │   ├── docker-compose.yml      # Orchestrates: FastAPI app, Celery worker,
//  │   │                           #   Redis broker, Next.js frontend
//  │   └── backend/
//  │       ├── main.py             # FastAPI server with WebSocket job tracking
//  │       ├── tasks.py            # Celery task: calls Replicate IDM-VTON API
//  │       ├── celery_app.py       # Celery config (Redis as broker + backend)
//  │       ├── requirements.txt    # FastAPI, celery, redis, replicate, rembg
//  │       └── Dockerfile          # Container image for both app and worker
//  │
//  ├── hf_space/                   # ← HUGGING FACE SPACES DEPLOYMENT
//  │   ├── app.py                  # Gradio interface with @spaces.GPU decorator
//  │   └── requirements.txt        # gradio, torch, diffusers, spaces
//  │
//  └── documentation/              # (Reserved for docs / assets)
//
// ──────────────────────────────────────────────────────────
// 4. HOW THE ACTIVE DEV SETUP WORKS (npm run dev:all)
// ──────────────────────────────────────────────────────────
//
//  npm run dev:all  runs TWO processes in parallel via `concurrently`:
//
//  Process 1 — Flask Backend  (port 5000)
//    cd backend && .\venv\Scripts\activate && python app.py
//    • Boots Flask at http://127.0.0.1:5000
//    • Immediately spawns a background thread to load CatVTON model weights
//    • Model download (~10 GB) happens once into .cache/huggingface/
//
//  Process 2 — Vite Dev Server  (port 5173)
//    vite --host
//    • Serves the React app at http://localhost:5173
//    • Proxies /api/* and /outputs/* → http://127.0.0.1:5000
//      (so the browser never hits CORS issues)
//
//  The proxy is defined in vite.config.js.
//
// ──────────────────────────────────────────────────────────
// 5. BACKEND — backend/app.py  (Flask, port 5000)
// ──────────────────────────────────────────────────────────
//
//  GLOBALS:
//    catvton_pipeline  — CatVTONPipeline instance (None until loaded)
//    automasker        — AutoMasker instance       (None until loaded)
//    mask_processor    — VaeImageProcessor (binarize grayscale masks)
//    device            — "cuda" or "cpu" (auto-detected)
//    dtype             — float16 (GPU) or float32 (CPU)
//    inference_lock    — threading.Lock() — only ONE inference at a time
//    model_status      — dict: { status, progress, message, error }
//
//  STARTUP THREAD — load_model_background():
//    Runs in daemon thread so Flask boots immediately.
//    Steps:
//      1. Imports CatVTONPipeline, AutoMasker, VaeImageProcessor
//      2. Detects CUDA / CPU
//      3. Downloads CatVTON weights from HuggingFace Hub via snapshot_download()
//         (repo: zhengchong/CatVTON → backend/models/CatVTON/)
//      4. Instantiates CatVTONPipeline (attn_ckpt_version="mix")
//      5. Instantiates AutoMasker (DensePose + SCHP checkpoints)
//      6. Runs a 2-step warmup inference on dummy images
//      7. Sets model_status["status"] = "ready"
//
//  ENDPOINTS:
//
//    GET  /api/health
//      → Returns model_status JSON
//      → Frontend polls this every 5 seconds until status === "ready"
//
//    POST /api/try-on
//      → Accepts multipart form-data: person_image + cloth_image
//      → Validates file types (png/jpg/jpeg/webp)
//      → Generates a UUID job_id
//      → Saves uploads to backend/static/uploads/
//      → Calls run_catvton_inference() SYNCHRONOUSLY (blocks until done)
//      → Returns: { status, job_id, resultUrl: "/outputs/result_<id>.png" }
//      → 503 if model not ready, 429 if another inference is running
//
//    GET  /outputs/<filename>
//      → Serves files from backend/static/outputs/ directory
//
//  INFERENCE — run_catvton_inference(person_path, cloth_path, output_path):
//    1. Opens person + garment images as PIL RGB
//    2. Resizes to 384×512 (person: crop-center, garment: pad)
//    3. Determines mask_type: "overall" (tall garment) or "upper" (wide)
//    4. Calls automasker(person_img, mask_type) → binary mask
//    5. If mask is almost empty (mean < 5), draws a fallback rectangle mask
//    6. Applies GaussianBlur(5) to soften mask edges
//    7. Runs pipeline(image, condition_image, mask, steps=15, cfg=2.5, 384×512)
//    8. Saves result_list[0] as PNG to output_path
//    9. On any exception: copies person_img as fallback, logs to error_log.txt
//   10. Always calls torch.cuda.empty_cache() in finally block
//
// ──────────────────────────────────────────────────────────
// 6. FRONTEND — src/App.jsx  (Root React Component)
// ──────────────────────────────────────────────────────────
//
//  STATE:
//    personImage   — data-URL or path of person image (default: placeholder)
//    garmentImage  — data-URL or path of garment image (default: placeholder)
//    result        — { image: url, label: "AI Result" } or null
//    loading       — bool (inference in progress)
//    error         — string or null
//    aiStatus      — { status, progress, message } from /api/health
//
//  KEY EFFECTS:
//    • Scroll-reveal: IntersectionObserver watches .reveal elements
//    • AI health polling: fetches /api/health every 5s until ready/error
//
//  CORE FLOW — handleTryOn():
//    1. Converts both images to base64 (via canvas, handles cross-origin)
//    2. Converts base64 → Blob
//    3. Builds FormData with person_image + cloth_image blobs
//    4. POSTs to /api/try-on with a minimum 7-second UX delay (Promise.all)
//    5. Parses response.resultUrl → setResult({ image: resultUrl })
//    6. On network failure: falls back to showing personImage (never shows error)
//
//  VISUAL EFFECTS (always rendered):
//    • BackgroundVFX — gradient mesh, noise overlay, 3 animated blobs, 28 particles
//    • CursorGlow    — div that follows mouse cursor with a glow effect
//    • Rocket thrust animation behind the hero "Outfit-Gen" heading
//
//  PAGE SECTIONS (in order):
//    1. Hero        — Badge, "Outfit-Gen" title with rocket thrust VFX, subtitle
//    2. AIStatus    — Inline AI warmup progress bar / ready badge
//    3. Upload      — Two ImageUploadCard components (person + garment)
//    4. TryOnButton — Disabled until both uploaded AND model ready
//    5. ResultDisplay — Shows loading overlay → result image → download button
//    6. TransformationShowcase — BeforeAfterSlider demo pairs
//    7. HowItWorks  — 3-step explainer
//    8. GallerySection — Interactive studio gallery
//    9. AboutSection — Mission statement + tech details
//
// ──────────────────────────────────────────────────────────
// 7. KEY COMPONENTS — DETAILED
// ──────────────────────────────────────────────────────────
//
//  ImageUploadCard.jsx
//    • useTilt() hook — applies perspective 3D tilt on mousemove
//    • Handles drag-and-drop and click-to-browse
//    • Reads file via FileReader → passes data-URL to parent via onUpload()
//    • Shows image preview with hover overlay "Change photo" button
//    • Accepts: jpg, png, webp (max 10MB stated in UI)
//
//  ResultDisplay.jsx
//    • LoadingState sub-component:
//        - Cycles through 6 LOADING_MESSAGES every 1.5s
//        - Animates a fake progress bar from 5% → 98%
//        - Shows scanline animation + pulsing orb ring
//    • States: loading | result | empty (idle)
//    • Result state: shows AI image full-cover, success badge, Download + Share buttons
//    • Download: creates <a> element and triggers click with result.image href
//    • Error state intentionally removed — always shows success for UX stability
//
//  GallerySection.jsx
//    • Manages its own "mini try-on" flow independent of App.jsx
//    • Data source: galleryData.js (DRESSES, MODELS arrays with Unsplash URLs)
//    • Each dress/model has: id, image, gender, pose, lighting, category, color
//    • Filtering: gender, category, color (dresses) / gender, size (models)
//    • Smart matching: when Try-On is triggered, enforces gender+pose+lighting
//      consistency between model and outfit (auto-selects closest match)
//    • Backend call: POST /api/try-on with model+dress blobs (same as App.jsx)
//    • Silent fallback: on failure, uses dress image directly (same pose/lighting)
//    • After result: shows AI Metrics panel (Fit%, Style/100, Fabric/100)
//      — these are randomised numbers for demo purposes
//    • Quick Adjustments panel: color swatches + size dropdown (visual only,
//      triggers a 1s "isSimulating" re-render animation)
//
//  BeforeAfterSlider.jsx
//    • Renders two images overlapping; clips "Before" to left of slider position
//    • Mouse + touch drag support with global window event listeners
//    • Glassmorphism "Before"/"After" labels fade at extremes
//    • Handle glows rose-red on hover/drag
//
//  AIStatus.jsx
//    • "ready"       → small emerald badge "AI Engine Synchronized"
//    • "error"       → violet glassmorphism box "AI Engine Optimizing..." (hides real error)
//    • "initializing/loading" → progress bar with message from model_status.message
//
//  Header.jsx — logo left, nav links right (Home, Gallery, About, Contact)
//  Footer.jsx — copyright + links to /terms and /privacy pages
//  HowItWorks.jsx — 3 glassmorphism cards: Upload → AI Analyzes → View Result
//  AboutSection.jsx — Mission text, tech stack badges, open-source statement
//  StatsBar.jsx — Animated counter numbers (e.g. "99.2% Accuracy", "50K+ Users")
//
// ──────────────────────────────────────────────────────────
// 8. AI MODEL PIPELINE — CatVTON
// ──────────────────────────────────────────────────────────
//
//  CatVTON ("Concatenation-based Virtual Try-ON") is a diffusion model that
//  works by concatenating the garment and person images along the attention axis
//  of a Stable Diffusion inpainting model.
//
//  CatVTONPipeline (backend/catvton_app/model/pipeline.py):
//    • Extends Stable Diffusion Inpainting pipeline
//    • Takes: person image, condition (garment) image, binary mask
//    • Internally stitches garment features into the cross-attention layers
//    • attn_ckpt_version: "mix" (trained on both VITON-HD and DressCode datasets)
//
//  AutoMasker (backend/catvton_app/model/cloth_masker.py):
//    • DensePose: estimates body part segmentation from the person image
//    • SCHP (Self-Correction for Human Parsing): refines semantic segmentation
//    • Combines both to produce a binary mask over upper body, lower body, or full
//    • Mask types: "upper" | "lower" | "overall" (dresses/full-body)
//
//  Resolution: 384×512 px (chosen for local CPU/GPU balance)
//  Inference steps: 15 (production local) / 40 (HF Spaces cloud GPU)
//  Guidance scale: 2.5 (standard for try-on tasks)
//
//  Hardware behavior:
//    • NVIDIA GPU (CUDA)  → float16, fastest (~30s for 15 steps)
//    • Intel Arc (DirectML) → torch-directml fallback
//    • CPU only           → float32, slowest (2–5 minutes)
//
// ──────────────────────────────────────────────────────────
// 9. ALTERNATIVE ARCHITECTURE — virtual-tryon/ (Docker)
// ──────────────────────────────────────────────────────────
//
//  This is a production-grade async version of the system.
//  It is NOT used in local dev (npm run dev:all uses backend/ instead).
//
//  Services (docker-compose.yml):
//    app      — FastAPI server (port 8000)
//    worker   — Celery worker process
//    redis    — Redis broker (port 6379)
//    frontend — Next.js frontend (port 3000)
//
//  Flow:
//    1. POST /api/tryon → saves images to temp/, queues Celery task → returns job_id
//    2. Celery task (tasks.py):
//        a. Optional: rembg background removal on garment
//        b. Calls Replicate API (yisol/idm-vton model)
//        c. Stores result URL in Redis: "result:<job_id>"
//        d. Updates status in Redis: "status:<job_id>"
//    3. GET  /api/status/<job_id> → polls Redis for progress
//    4. GET  /api/result/<job_id> → returns final image URL
//    5. WS   /ws/<job_id>         → WebSocket for real-time status push
//
//  Model used here: IDM-VTON (yisol/idm-vton) via Replicate API
//  Env var required: REPLICATE_API_TOKEN
//
// ──────────────────────────────────────────────────────────
// 10. HUGGING FACE SPACES DEPLOYMENT — hf_space/
// ──────────────────────────────────────────────────────────
//
//  hf_space/app.py:
//    • Uses Gradio interface for easy HF Spaces hosting
//    • @spaces.GPU decorator: dynamically allocates GPU per request (ZeroGPU)
//    • Loads CatVTON via DiffusionPipeline.from_pretrained("zhengchong/CatVTON")
//    • Enables attention slicing to reduce VRAM usage
//    • Process: push pipeline to CUDA → resize to 768×1024 → run 40 steps → to CPU
//    • Exposed as POST /api/predict (Gradio auto-generates this endpoint)
//    • The React frontend can use this via VITE_HF_API_URL env var instead of Flask
//
//  hf_space/requirements.txt: gradio, torch, diffusers, spaces
//
// ──────────────────────────────────────────────────────────
// 11. DESIGN SYSTEM — src/index.css
// ──────────────────────────────────────────────────────────
//
//  The entire visual identity is defined in index.css (14KB):
//
//  Color palette:
//    • Primary accent: rose-500 (#f43f5e) — buttons, highlights, CTA
//    • Secondary:      violet/purple (#c084fc) — badges, gradients
//    • Sky:            #38bdf8 — progress bar tail
//    • Background:     near-black (#080810, #0a0a10)
//
//  Effects:
//    • .glass           — backdrop-blur + subtle border + dark bg
//    • .cursor-glow     — fixed div following cursor with radial glow
//    • .bg-mesh         — CSS gradient mesh background layer
//    • .bg-noise        — SVG noise filter overlay for texture
//    • .blob-1/2/3      — large blurred orbs with morph animation
//    • .particle        — tiny floating dots (28 instances in App.jsx)
//    • .reveal          — opacity 0 → 1 on IntersectionObserver trigger
//    • .animate-float   — vertical bob animation
//    • .animate-scan-loop — horizontal scanline sweep
//    • .glow-pulse      — pulsing box-shadow
//    • .hero-organic-blob — morphing SVG blob behind hero title
//    • .eclipse-glow    — radial gradient halo
//    • .rocket-thrust-wrap — full rocket exhaust animation system:
//        .rocket-flame-outer/inner, .rocket-glare, .rocket-shockwave,
//        .rocket-trail, .rocket-particle (36 instances)
//    • .animated-text.animated-glow — gradient-animated "-Gen" text
//    • .text-power-shake — subtle shake keyframe on hero h1
//    • .upload-zone     — dashed border drop zone with hover glow
//    • .animated-border — rotating conic-gradient border animation
//
//  Typography:
//    • font-sans    → Inter (Google Fonts)
//    • font-display → Playfair Display (serif, used in section headings)
//
// ──────────────────────────────────────────────────────────
// 12. DATA — src/galleryData.js
// ──────────────────────────────────────────────────────────
//
//  DRESSES[]  — Array of garment objects
//    Each: { id, name, image (Unsplash URL), category, color, gender, pose, lighting }
//    Categories: Casual, Formal, Streetwear, Ethnic, Sportswear, Party
//    Poses: front_facing, side_profile, walking, posed
//    Lighting: studio, natural, golden_hour, dramatic
//
//  MODELS[]   — Array of model objects
//    Each: { id, image, gender, bodyType, size, pose, lighting }
//    Sizes: XS, S, M, L, XL
//    BodyTypes: Athletic, Slim, Curvy, Plus, Petite
//
//  CATEGORIES, COLORS, SIZES — string arrays used for filter dropdowns
//  RESULT_IMAGES — array of demo result URLs (for static showcase purposes)
//
//  NOTE: All image URLs are Unsplash public images. No real user data is stored.
//
// ──────────────────────────────────────────────────────────
// 13. ENVIRONMENT VARIABLES
// ──────────────────────────────────────────────────────────
//
//  .env (root):
//    REPLICATE_API_TOKEN=<your token>   ← used by virtual-tryon/ Docker backend
//
//  virtual-tryon/.env.example:
//    REPLICATE_API_TOKEN=...
//    REDIS_URL=redis://localhost:6379/0
//    REDIS_HOST=localhost
//
//  In React (vite), any env var prefixed VITE_ is exposed to the browser:
//    VITE_HF_API_URL   — if set, App.jsx treats the model as always "ready"
//                        (intended for routing to HF Spaces instead of Flask)
//
// ──────────────────────────────────────────────────────────
// 14. KNOWN ISSUES & DEBUGGING NOTES
// ──────────────────────────────────────────────────────────
//
//  • CatVTON on CPU is slow (2–5 min). On CPU without CUDA the model
//    may appear to "hang." The frontend's 7s minimum delay + health
//    polling keep the UX graceful during this.
//
//  • AutoMasker requires Detectron2 (DensePose), which needs C++ build
//    tools on Windows. If pip install fails, the backend falls back to
//    a rectangle mask covering the torso area.
//
//  • If the mask is nearly empty (mean pixel < 5), a hardcoded fallback
//    rectangle mask is drawn to ensure the pipeline has something to work with.
//
//  • "AssertionError: Torch not compiled with CUDA" — this appears when
//    the installed PyTorch is CPU-only. Use a CUDA-enabled build or accept CPU speed.
//
//  • inference_lock ensures only one GPU job runs at a time.
//    Concurrent requests get HTTP 429 "Server busy."
//
//  • error_log.txt (in backend/) captures full tracebacks from failed inferences.
//
//  • debug_out.txt and debug_trace.txt in backend/ are logs from debugging sessions.
//
//  • The GallerySection and ResultDisplay both suppress errors from the user.
//    On inference failure, the person or garment image is shown as the "result"
//    so the UI always displays a coherent output.
//
// ──────────────────────────────────────────────────────────
// 15. HOW TO RUN (QUICK REFERENCE)
// ──────────────────────────────────────────────────────────
//
//  Prerequisites:
//    Node.js v18+, Python 3.10+
//
//  One-time setup:
//    npm install                          # Frontend deps
//    cd backend
//    python -m venv venv
//    .\venv\Scripts\activate              # Windows
//    pip install -r requirements.txt
//    cd ..
//
//  Daily dev:
//    npm run dev:all
//    → Frontend: http://localhost:5173
//    → Backend:  http://localhost:5000
//    → First run: model weights download ~10GB (once, cached in .cache/huggingface/)
//
//  Docker (production):
//    cd virtual-tryon
//    cp .env.example .env  (fill REPLICATE_API_TOKEN)
//    docker-compose up --build
//    → API: http://localhost:8000
//    → Frontend: http://localhost:3000
//
//  HF Spaces:
//    Upload hf_space/app.py + hf_space/requirements.txt to a HuggingFace Space.
//    Set VITE_HF_API_URL in .env to point React at that Space's /api/predict.
//
// ──────────────────────────────────────────────────────────
// END OF PROJECT OVERVIEW
// ──────────────────────────────────────────────────────────
