import express from 'express';
import {archiveToMhtml} from "./webarchiver";
import {limiter} from "./ratelimit";
import {uploadToLBRY} from "./lbry";
import * as fs from "fs";

const app = express();
const port = 3100;

app.use(express.static(__dirname + '/../node_modules/bootstrap/dist'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // Serve static files from the public folder
app.set('view engine', 'ejs'); // Set the view engine to EJS

app.get('/', (req, res) => {
    res.render('index');
});

// Apply the limiter to your routes
app.use('/archive', limiter);
app.post('/archive', async (req, res) => {
    const url = req.body.url;

    try {
        const archive = await archiveToMhtml(url);
        console.log(`url:${url} downloaded to ${archive.mhtml}`)
        // Upload the archive file to LBRY
        const lbryUrl = await uploadToLBRY(archive, url);

        const claimId = lbryUrl.split('#')[1];
        const httpUrl = `http://lbry.tv/${lbryUrl.split(':')[1]}#${claimId}`;
        res.send(`<h1>Webpage Archived</h1><p>: ${httpUrl}</p><p>The Url will be ready in 10 minutes.</p>`);
    } catch (error) {
        const errorMessage = (error as Error).message;
        console.error(error)
        res.status(500).send(`<h1>Error</h1><p>Could not archive the URL: ${errorMessage}</p>`);
    }
});

app.listen(port, () => {
    console.log(`Web Archive app listening at http://localhost:${port}`);
});