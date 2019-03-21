const ipfs = require('./ipfs');
const blockchain = require('./blockchain');

const health = {};


health.ipfsNode = async (req, res) => {
    try {
        await ipfs.id();
        res.sendStatus(200)
    } catch (e) {
        console.error(e.message);
        res.sendStatus(500)
    }
};

health.blockchainNode = async (req, res) => {
    try {
        await blockchain.height();
        res.sendStatus(200)
    } catch (e) {
        console.error(e.message);
        res.sendStatus(500)
    }
};

health.teaserIPFSFiles = async (req, res) => {
    try {
        const artworks = await blockchain.teaserArtworks();
        const results = await Promise.all(artworks.map(artwork => {
            return ipfs.checkFileExists(artwork.artworkReference)
        }));
        if(results.reduce((acc, curr) => acc || curr, true)) {
            res.sendStatus(200)
        } else {
            res.sendStatus(500)
        }
    } catch (e) {
        console.error(e.message);
        res.sendStatus(500)
    }
};

health.teaserSmartContract = async (req, res) => {
    try {
        await blockchain.teaserGeolocation();
        res.sendStatus(200)
    } catch (e) {
        console.error(e.message);
        res.sendStatus(500)
    }
};

health.normalIPFSFiles = async (req, res) => {
    try {
        const slots = await blockchain.auctionSlots();
        const bids = slots.map(slot => slot.successfulBids.concat(slot.failedBids)).reduce((acc, val) => acc.concat(val), []);
        const results = await Promise.all(bids.map(bid=> {
            return ipfs.checkFileExists(bid.data.artworkReference)
        }));
        if(results.reduce((acc, curr) => acc || curr, true)) {
            res.sendStatus(200)
        } else {
            res.sendStatus(500)
        }
    } catch (e) {
        console.error(e.message);
        res.sendStatus(500)
    }
};

health.normalSmartContract = async (req, res) => {
    try {
        await blockchain.auctionSlots();
        res.sendStatus(200)
    } catch (e) {
        console.error(e.message);
        res.sendStatus(500)
    }
};


module.exports = health;
