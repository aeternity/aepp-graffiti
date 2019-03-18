const express = require('express');
const canvas = require('./src/canvas.js');
const fileUpload = require('express-fileupload');
const app = express();
const logic = require('./src/logic');
const cors = require('cors');
const bodyParser = require('body-parser');
const storage = require('./src/storage');
const health = require('./src/health');

// HELPER FUNCTIONS

const errorHandler = (asyncFunction) => {
    return (req, res, next) => {
        try {
            asyncFunction(req, res, next);
        } catch (e) {
            next(e);
        }
    }
};

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

app.get('/ipfs/:hash.svg', errorHandler(logic.ipfs));

// upload form-data image key
app.post('/upload', errorHandler(logic.upload));

// get slot export zip
app.get('/slots/:id', errorHandler(logic.getSlots));

// get data for teaser event
app.get('/teaser.json', errorHandler(logic.teaserJson));

app.get('/bid/:id', errorHandler(logic.getSingleBid));

app.get('/health/ipfsNode', errorHandler(health.ipfsNode));
app.get('/health/blockchainNode', errorHandler(health.blockchainNode));
app.get('/health/teaserFiles', errorHandler(health.teaserIPFSFiles));
app.get('/health/teaserContract', errorHandler(health.teaserSmartContract));
app.get('/health/testFiles', errorHandler(health.normalIPFSFiles));
app.get('/health/testContract', errorHandler(health.normalSmartContract));

app.use((err, req, res) => {
    console.error(err.stack);
    if(res.headersSent) return;
    res.status(500).send(e.message);
});

app.use((req, res) => {
    res.sendStatus(404);
});

try {
    canvas.init();
} catch (e) {
    console.warn("First canvas.init call failed, trying again in 30 seconds");
    try {
        setTimeout(() => canvas.init(), 30000);
    } catch (e) {
        console.error("Could not connect to blockchain client.");
    }
}

try {
    storage.init();
} catch (e) {
    console.error("Could not initialize to storage.");
}

app.listen(3000);
