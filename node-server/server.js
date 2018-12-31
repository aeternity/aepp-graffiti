const express = require('express');
const canvas = require('./canvas.js');
const fileUpload = require('express-fileupload');
const app = express();
const logic = require('./logic');
// TODO POST image --> svg

app.use(fileUpload({
    limits: {fileSize: 5 * 1024 * 1024},
    files: 1
}));

app.get('/canvas.png', canvas.shouldRender, canvas.send);

app.get('/ipfs', logic.ipfs);

/* upload form-data image key */
app.post('/upload', logic.upload);

/* upload POST endpoint */
app.post('/transform', logic.transform);

app.use((req, res) => {
    res.sendStatus(404);
});

app.listen(3000);
