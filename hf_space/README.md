# Cloud Deployment Guide (Hugging Face Spaces)

This directory contains everything you need to deploy your backend securely and for free on Hugging Face.

## 1. Create a Space
1. Sign up or log into [Hugging Face](https://huggingface.co).
2. Go to your profile and click **New Space**.
3. Fill in a name (e.g., `Virtual-Try-On-API`).
4. Select **License:** `OpenRail` (or your choice).
5. Select **SDK:** **Gradio**.
6. Select **Space Hardware:** **ZeroGPU** (This allows you to access powerful A100 GPUs for free!).
7. Click **Create Space**.

## 2. Upload Files
Once your space reaches the Setup page, you can upload your files:
1. In the top right corner of the Space files tab, click **Add File** -> **Upload File**.
2. Select and upload the `app.py` from this folder.
3. Upload the `requirements.txt` from this folder.
4. The moment `requirements.txt` is uploaded, Hugging Face will automatically begin installing and building the container.

## 3. Retrieve your API URL
Wait for the status badge at the top to change from `Building` to `Running`.
1. Locate the **Embed this Space** button (often hidden in the top-right `⋮` menu).
2. Click **Direct URL** or look for the endpoint marked as the Direct App link. 
3. Your final API endpoint will be that direct link, appended with `/api/predict`. 
*(E.g. `https://your-username-virtual-try-on.hf.space/api/predict`)*

## 4. Connect your Local App
1. Go back to your local code editor.
2. Open your `.env` or `.env.local` file.
3. Add the following line:
```env
VITE_HF_API_URL=https://your-username-virtual-try-on.hf.space/api/predict
```
4. Start your React frontend (`npm run dev`) and test your application! You will never need the local python backend again!
