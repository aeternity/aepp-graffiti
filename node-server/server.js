const express = require('express');
const canvas = require('./canvas.js');
const fileUpload = require('express-fileupload');
const app = express();
const logic = require('./logic');

app.use(fileUpload({
    limits: {fileSize: 5 * 1024 * 1024},
    files: 1
}));

app.use('/rendered', express.static(__dirname + '/rendered'));

app.get('/ipfs', logic.ipfs);

/* upload form-data image key */
app.post('/upload', logic.upload);

app.use((req, res) => {
    res.sendStatus(404);
});

canvas.init();
app.listen(3000);
