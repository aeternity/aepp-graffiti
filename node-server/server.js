const express = require('express');
const canvas = require('./canvas.js');
const ipfs = require('./ipfs.js');
const app = express();

// TODO GET rendered canvas
// TODO POST svg --> IPFS
// TODO POST image --> svg
// TODO Rerender canvas

app.get('/canvas', canvas.shouldRender, canvas.send);

app.get('/ipfs', (req, res) => {
    ipfs.getFile('QmQjqVu5qsd4PPqJnTcLXmvznMw7X2UEjtLP9NKCtwWMx3').then((buffer) => {

        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': buffer.length
        });
        res.end(buffer);

    }).catch(e => {

        res.send(e.message);

    });

});

app.listen(3000);