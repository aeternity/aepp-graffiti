require('dotenv').config()
const express = require('express');
const canvas = require('./src/canvas.js');
const fileUpload = require('express-fileupload');
const app = express();
const logic = require('./src/logic');
const cors = require('cors');
const bodyParser = require('body-parser');
const storage = require('./src/storage');
const health = require('./src/health');
const sanity = require('./src/sanity');
const path = require('path');


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

app.use('/rendered', express.static(path.join(__dirname, "/data/rendered")));

// get image from ipfs / local cache
app.get('/ipfs/:hash.svg', errorHandler(logic.ipfs));

// upload form-data image key
app.post('/upload', errorHandler(logic.upload));

// get slot export zip
app.get('/slots/:id', errorHandler(logic.getSlots));

// get data for teaser event
app.get('/teaser.json', errorHandler(logic.teaserJson));

// retreive single bid data
app.get('/bid/:id', errorHandler(logic.getSingleBid));

// Health checks
app.get('/health', (req, res) => {
    res.sendStatus(200);
});
app.get('/health/ipfsNode', errorHandler(health.ipfsNode));
app.get('/health/blockchainNode', errorHandler(health.blockchainNode));
app.get('/health/testFiles', errorHandler(health.normalIPFSFiles));
app.get('/health/testContract', errorHandler(health.normalSmartContract));

// expose sanity checks
app.post('/sanity/:check', errorHandler(sanity.runCheck));


// general helpers for all routes
app.use((err, req, res, next) => {
    console.error(err.stack);
    if (res.headersSent) return;
    res.status(500).send(err.message);
});


app.use((req, res) => {
    res.sendStatus(404);
});

const start = async () => {
    try {
        await storage.init();
    } catch (e) {
        console.error("Could not initialize to storage.", e);
    }

    try {
        await canvas.init();
    } catch (e) {
        console.warn("First canvas.init call failed, trying again in 30 seconds", e);
        try {
            setTimeout(() => canvas.init(), 30000);
        } catch (e) {
            console.error("Could not connect to blockchain client.", e);
        }
    }

    app.listen(3000);
}

void start();
