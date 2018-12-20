const express = require('express');
const canvas = require('./canvas.js');
const ipfsWrapper = require('./ipfs.js');
const fileUpload = require('express-fileupload');
const app = express();
const ImageTracer = require( './imagetracer.js' );
const { createCanvas, Image } = require('canvas');

// TODO POST image --> svg

app.use(fileUpload({
    limits: {fileSize: 5 * 1024 * 1024},
    files: 1
}));

app.get('/canvas', canvas.shouldRender, canvas.send);

app.get('/ipfs', (req, res) => {
    ipfsWrapper.getFile('QmQjqVu5qsd4PPqJnTcLXmvznMw7X2UEjtLP9NKCtwWMx3').then((buffer) => {

        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': buffer.length
        });
        res.end(buffer);

    }).catch(e => {

        res.send(e.message);

    });
});

/*  upload POST endpoint */
app.post('/upload', async (req, res) => {
    if (Object.keys(req.files).length === 0) {
        return res.status(422).json({
            error: 'File needs to be provided.',
        });
    }

    const file = req.files.image;

    const mime = file.mimetype;
    if (mime.split('/')[0] !== 'image') {
        return res.status(422).json({
            error: 'File needs to be an image.',
        });
    }

    try {
        const result = await ipfsWrapper.writeFile(file.data);
        return res.json({
            hash: result[0].hash,
        });
    } catch (e) {
        return res.status(500).json({
            error: e,
        });
    }
});


/*  upload POST endpoint */
app.post('/transform', async (req, res) => {
    if (Object.keys(req.files).length === 0) {
        return res.status(422).json({
            error: 'File needs to be provided.',
        });
    }

    const file = req.files.image;

    const mime = file.mimetype;
    if (mime.split('/')[0] !== 'image') {
        return res.status(422).json({
            error: 'File needs to be an image.',
        });
    }

    try {
        file.type = file.mimetype;

        const loadedImage = await new Promise((resolve, reject) => {
            // Resolve source and img when loaded
            const img = new Image();
            img.onerror = () => reject(new Error('Couldn\'t load image'));
            img.onload = () => resolve(img);
            img.src = 'data:image/png;base64,' + file.data.toString('base64');
        });

        const fakeCanvas = createCanvas(canvas.width, canvas.height);
        const ctx = fakeCanvas.getContext('2d');
        ctx.drawImage(loadedImage, 0, 0);
        const imageData = ctx.getImageData(0,0, loadedImage.width, loadedImage.height);

        console.log(loadedImage.width, loadedImage.height);

        const myImageData = { width:loadedImage.width, height:loadedImage.height, data:imageData };

        // tracing to SVG string
        const options = { scale: 1 }; // options object; option preset string can be used also

        const svgstring = ImageTracer.imagedataToSVG( imageData, options );

        res.send(svgstring);
    } catch (e) {
        console.error(e);
        return res.status(500).json({
            error: e,
        });
    }
});

app.use((req, res) => {
    res.sendStatus(404);
});

app.listen(3000);
