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

health.normalIPFSFiles = async (req, res) => {
    try {
        const slots = await blockchain.auctionSlots();
        const bids = slots.map(slot => slot.successful_bids.concat(slot.failed_bids)).reduce((acc, val) => acc.concat(val), []);
        const results = await Promise.all(bids.map(bid=> {
            return ipfs.checkFileExists(bid.data.artwork_reference)
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
