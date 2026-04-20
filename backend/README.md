# Local CatVTON Backend

A fully local virtual try-on server utilizing `Zheng-Chong/CatVTON` running securely offline.

## Setup Instructions

1. **Activate Environment**
Run the following in the `backend` directory to construct your environment:
```bash
python -m venv venv
```
For **Windows**: `.\venv\Scripts\Activate.ps1`
For **Mac/Linux**: `source venv/bin/activate`

2. **Install Depedencies**
```bash
pip install -r requirements.txt
```

3. **Start the API Server**
```bash
python app.py
```
*Note: The first run downloads ~1.5GB of model files. Future initializations will execute instantly.*
