const express = require('express');
const canvas = require('./canvas.js');
const fileUpload = require('express-fileupload');
const app = express();
const logic = require('./logic');
const cors = require('cors');
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(cors({
    origin: '*',
    optionsSuccessStatus: 200,
    methods: ['POST', 'GET', 'OPTIONS']
}));

app.use(fileUpload({
    limits: {fileSize: 5 * 1024 * 1024},
    files: 1
}));

app.use('/rendered', express.static(__dirname + '/rendered'));

app.get('/ipfs', logic.ipfs);

/* upload form-data image key */
app.post('/upload', logic.upload);

app.get('/slots', logic.getSlots);
app.post('/slots', logic.setSlots);

app.use((req, res) => {
    res.sendStatus(404);
});

setTimeout(() => canvas.init(), 30000);
app.listen(3000);
