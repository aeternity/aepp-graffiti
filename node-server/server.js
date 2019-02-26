const express = require('express');
const canvas = require('./src/canvas.js');
const fileUpload = require('express-fileupload');
const app = express();
const logic = require('./src/logic');
const cors = require('cors');
const bodyParser = require('body-parser');
const storage = require('./src/storage');
const health = require('./src/health');

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

app.use('/rendered', express.static(__dirname + '/data/rendered'));

app.get('/ipfs/:hash.svg', logic.ipfs);

// upload form-data image key
app.post('/upload', logic.upload);

// get slot export zip
app.get('/slots/:id', logic.getSlots);

// get data for teaser event
app.get('/teaser.json', logic.teaserJson);

app.get('/health/ipfsNode', health.ipfsNode);
app.get('/health/blockchainNode', health.blockchainNode);
app.get('/health/teaserFiles', health.teaserIPFSFiles);
app.get('/health/teaserContract', health.teaserSmartContract);
app.get('/health/testFiles', health.normalIPFSFiles);
app.get('/health/testContract', health.normalSmartContract);

app.use((req, res) => {
    res.sendStatus(404);
});

try {
    canvas.init()
} catch (e) {
    console.warn("First canvas.init call failed, trying again in 30 seconds");
    setTimeout(() => canvas.init(), 30000);
}


storage.init();
app.listen(3000);
