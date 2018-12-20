const express = require('express');
const canvas = require('./canvas.js');
const ipfsWrapper = require('./ipfs.js');
const fileUpload = require('express-fileupload');
const app = express();

// TODO GET rendered canvas
// TODO POST svg --> IPFS
// TODO POST image --> svg
// TODO Rerender canvas

app.use(fileUpload());

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


const MAX_SIZE = 5000000; // 5 MB


/*  upload POST endpoint */
app.post('/upload', async (req, res) => {
    if (Object.keys(req.files).length === 0) {
        return res.status(422).json({
            error: 'File needs to be provided.',
        });
    }

    if (Object.keys(req.files).length > 1) {
        return res.status(422).json({
            error: 'Only a single file is accepted.',
        });
    }

    const file = req.files.image;

    const mime = file.mimetype;
    if (mime.split('/')[0] !== 'image') {
        return res.status(422).json({
            error: 'File needs to be an image.',
        });
    }

    const fileSize = file.size;
    if (fileSize > MAX_SIZE) {
        return res.status(422).json({
            error: `Image needs to be smaller than ${MAX_SIZE} bytes.`,
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