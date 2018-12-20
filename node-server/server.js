const express = require('express');
const canvas = require('./canvas.js');
const ipfsWrapper = require('./ipfs.js');
const fileUpload = require('express-fileupload');
const app = express();

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

app.listen(3000);