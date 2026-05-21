import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function captureScreenshots() {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Set a wide viewport for desktop
    await page.setViewport({ width: 1440, height: 900 });
    
    console.log('Navigating to http://127.0.0.1:5173 ...');
    await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle0' });

    const screenshotsDir = path.join(__dirname, 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir);
    }

    console.log('Taking screenshot of Hero section...');
    await page.screenshot({ path: path.join(screenshotsDir, '1_Hero.png') });

    console.log('Scrolling to Upload section...');
    await page.evaluate(() => {
        document.getElementById('upload-section').scrollIntoView({ behavior: 'instant', block: 'start' });
    });
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.join(screenshotsDir, '2_Upload.png') });

    console.log('Clicking Try On to show loading...');
    await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        const tryBtn = btns.find(b => b.textContent.includes('Try'));
        if(tryBtn) tryBtn.click();
    });
    
    // Wait for the mock 6s to finish, but capture loading state first
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(screenshotsDir, '3_Loading.png') });

    console.log('Waiting for result...');
    await new Promise(r => setTimeout(r, 4500));
    await page.evaluate(() => {
        document.getElementById('result-anchor').scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.join(screenshotsDir, '4_Result.png') });

    // Scroll down to showcase
    console.log('Taking screenshot of Transformation Showcase...');
    await page.evaluate(() => {
        window.scrollBy(0, 800);
    });
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.join(screenshotsDir, '5_Showcase.png') });

    console.log('Closing browser...');
    await browser.close();
    console.log('Screenshots saved in the "screenshots" folder!');
}

captureScreenshots().catch(console.error);
