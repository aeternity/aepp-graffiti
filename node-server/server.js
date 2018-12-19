const express = require('express');
const canvas = require('./canvas.js');

const app = express();

// TODO GET rendered canvas
// TODO POST svg --> IPFS
// TODO POST image --> svg
// TODO Rerender canvas

app.get('/canvas', canvas.shouldRender,  canvas.send);

app.listen(3000);