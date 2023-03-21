import fetch from 'node-fetch';
import {default as fs, promises} from 'fs';
import path from 'path'
import FormData from 'form-data';

export async function uploadToLBRY(archive: {mhtml: string, image: string}, url: string): Promise<string> {
    const title = await getTitleFromMhtmlFile(archive.mhtml);
    const timestamp = new Date().toISOString();
    const name = `${url}__${timestamp}.mhtml`
        .replace("https?://", "")
        .replace(/[^a-zA-Z0-9]/g, '_');

    //const thumbnail = await uploadThumbnail(archive.image)

    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            method: 'publish',
            params: {
                name,
                title,
                bid: "0.01",
                file_name: archive.image,
                description: `archive of ${url}\ntimestamp: ${timestamp}`,
                channel_name: '@lbryarchive',
                tags: ['archive', 'lbryarchive'],
            },
        }),
    };

    console.log(`Uploading ${name} to LBRY...`);
    const response = await fetch('http://localhost:5279', requestOptions);
    const responseJson = await response.json();
    console.trace("response", JSON.stringify(responseJson))

    if (responseJson.error) {
        throw new Error(JSON.stringify(responseJson.error));
    }

    const permanentUrl = responseJson.result.outputs[0].permanent_url;
    console.log(`Uploaded ${name} to LBRY ${permanentUrl}`);

    return permanentUrl;
}

async function getTitleFromMhtmlFile(mhtmlFile: string): Promise<string> {
    const mhtmlContent = await promises.readFile(mhtmlFile, 'utf-8');
    const regex = /<title>(.*?)<\/title>/;
    const match = regex.exec(mhtmlContent);
    return match ? match[1] : '';
}

async function uploadThumbnail(filePath: string): Promise<string> {
    const url = 'https://spee.ch/api/claim/publish';
    const formData = new FormData();
    const name = path.basename(filePath)
    formData.append('name', name);
    formData.append('file', fs.createReadStream(filePath));
    formData.append('description', `archive of ${url}`)
    const response = await fetch(url, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`Failed to publish file: ${response.statusText}`);
    }

    const responseJson = await response.json();

    if (responseJson.success) {
        console.log(JSON.stringify(responseJson))
        return responseJson.data.url;
    } else {
        throw new Error(`Failed to publish file: ${responseJson.message}`);
    }
}