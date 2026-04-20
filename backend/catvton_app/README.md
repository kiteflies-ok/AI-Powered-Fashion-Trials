# Virtual-Try-On-using-CatVTON-with-Gradio
# CatVTON - Virtual Try-On Model

This repository is a reference implementation of the **CatVTON** virtual try-on model based on diffusion techniques. It provides a way to generate realistic virtual clothing try-ons using deep learning models.

## About This Repository

This repository is a modified version of the original open-source CatVTON project. The main implementation remains the same, and all credits for the original work go to the respective authors. This repo serves as a reference and an alternative setup for users who want to explore the project in a different environment.

### Original Repository

For the official implementation and documentation, please visit the [original CatVTON repository] by 
Zheng-Chong and eltociear (https://github.com/Zheng-Chong/CatVTON/).

## Setup and Installation

To use this project, follow these steps:

## Note: I have tested with the python version of 3.9.0 on windows system with nvidio driver for cuda and cudnn with the version of 12.6

1. **Clone the Repository**

   ```bash
   git clone https://github.com/K-GOKULAPPADURAI/Virtual-Try-On-using-CatVTON-with-Gradio.git
   cd Virtual-Try-On-using-CatVTON-with-Gradio
   ```

2. **Install Dependencies**

   ```bash
   pip install -r requirements.txt
   ```

## Gradio UI Integration

This application includes a **Gradio UI** for a user-friendly virtual try-on experience. The interface allows users to:
- Upload images of clothing and a person.
- Process the virtual try-on with the deep learning model.
- Preview and download the final generated image.
- All the emebbeding and models with checkpoints will automatically download when run the appy.py 

To launch the **Gradio UI**, run:

```bash
 python app.py --output_dir="resource/demo/output" --mixed_precision="bf16" --allow_tf32
```

Once started, Gradio will provide a local and public URL where you can interact with the model through a web-based UI.

## AI-Generated Model Images

The system comes with preloaded AI-generated images featuring different outfits:
- **Upper Wear**: Try on different tops, shirts, jackets, etc.
- **Lower Wear**: Experiment with pants, skirts, shorts, etc.
- **Full Outfit**: Apply a complete outfit transformation.

### Input Image Guidelines

For the best results, follow these guidelines when uploading images:
- Use a **white background** for cleaner outputs.
- Ensure the entire body is visible (avoid partial images).
- Avoid selfies or images with **loose hair**, as these may interfere with accurate clothing swaps.
- Clear, well-lit images work best.
- 
## Performance & Hardware Requirements

- **GPU Used**: NVIDIA RTX 3060 (6GB VRAM)
- **Processing Time**: Takes approximately **3 to 5 minutes** for generating a single image.
- **Installation and Setup**: Requires cloning the repository and installing dependencies via `requirements.txt`.

## Contact & Support

For any doubts or queries, feel free to reach out:

- **Email**: [k.gokulappaduraikjgv@gmail.com](mailto:k.gokulappaduraikjgv@gmail.com)
- **Phone**: 9025421765

---


This repository is intended for learning and experimentation purposes, with reference to the original CatVTON project. Once again a big thanks for the author Zheng-Chong and eltociear making this as a opensource to use by all.
