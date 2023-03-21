import puppeteer from 'puppeteer';
import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import os from 'os';
import path from 'path';
export async function archiveToMhtml(url: string): Promise<{ mhtml: string; image: string }> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle0' });

    const cdpSession = await page.target().createCDPSession();
    await cdpSession.send('Page.enable');

    // @ts-nocheck
    const { data } = await cdpSession.send('Page.captureSnapshot', { format: 'mhtml' });

    const uuid = uuidv4();
    const archiveFolder = path.join(os.tmpdir(), 'lbryarchive', uuid);
    await fs.mkdir(archiveFolder, { recursive: true });

    const timestamp = new Date().toISOString().substring(0, 10);
    const filename = `${url.replace(/[^a-zA-Z0-9]/g, '_')}__${timestamp}`;
    const mhtmlFile = `${filename}.mhtml`;
    const imageFile = `${filename}.png`;

    const mhtmlPath = path.join(archiveFolder, mhtmlFile);
    await fs.writeFile(mhtmlPath, data);

    const imagePath = path.join(archiveFolder, imageFile);
    await page.screenshot({ path: imagePath, fullPage: true });

    await cdpSession.detach();
    await browser.close();

    return { mhtml: mhtmlPath, image: imagePath };
}