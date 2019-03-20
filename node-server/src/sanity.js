// IMPORTS
const ipfs = require('./ipfs');
const svgUtil = require('./util/svg');
const blockchain = require('./blockchain');
const sanity = {};
// HELPERS
const reject = (reason) => {
    return {
        passed: false,
        reason: reason
    }
};

const accept = () => {
    return {
        passed: true,
        reason: ''
    }
};

const runSingleCheck = async (checkFunction, paramObject) => {
    let result = {
        passed: false,
        reason: ''
    };
    try {
        result = await checkFunction(paramObject)
    } catch (e) {
        result.passed = false;
        result.reason = e.message;
    }
    return result;
};

const validateIPFSHash = (hash) => {
    if (typeof hash !== 'string') return reject('ipfsHash is not of type string');
    if (hash.length !== 46) return reject(`ipfsHash should be 46 chars long, your string has ${hash.length} chars`);
    return accept();
};


// CHECKERS
sanity.checkIfFileIsInIPFS = async (bid) => {
    if (!bid.ipfsHash) return reject('ipfsHash is not specified');
    const checkedHash = validateIPFSHash(bid.ipfsHash);
    if (!checkedHash.passed) return checkedHash;

    try {
        if (await ipfs.checkFileExists(bid.ipfsHash)) {
            return accept();
        }
    } catch (e) {
        console.error();
        return reject(e.message);
    }
};


sanity.checkIfSVGIsOk = async (req) => {
    if (req.files && Object.keys(req.files).length !== 0) {

        if(!req.files.image)
            return reject("Found a file but not under the from field 'image'.");

        const file = req.files.image;
        const mime = file.mimetype;

        if (mime !== 'image/svg+xml') {
            return reject('File needs to be image/svg+xml.');
        }

        const sanityCheck = await svgUtil.sanityCheckFileOnly({filebuffer: file.data}, 'upload');
        if (!sanityCheck.checkPassed) {
            return reject(sanityCheck.dataFails['upload'])
        }

    } else if (req.body.ipfsHash) {
        const checkedHash = await sanity.checkIfFileIsInIPFS(req.body);
        if (!checkedHash.passed) return checkedHash;

        const filebuffer = await ipfs.getFile(req.body.ipfsHash);
        const sanityCheck = await svgUtil.sanityCheckFileOnly({filebuffer}, 'upload');
        if (!sanityCheck.checkPassed) {
            return reject(sanityCheck.dataFails['upload'])
        }
    } else {
        return reject('please supply either an svg-file or ipfsHash the request body')
    }

    return accept();
};

sanity.checkIfBidIsOkay = async (bid) => {

    const types = {
        amount: 'number',
        x: 'number',
        y: 'number',
        ipfsHash: 'string',
        droneTime: 'number',
        slotId: 'number'
    };

    for (let key in types) {
        if (bid.hasOwnProperty(key)) {
            let value = bid[key];
            if (value === null || value === '' || typeof value === 'undefined') return reject(`Property ${key} is null or undefined`);

            if (typeof value !== types[key]) {
                return reject(`Data type for property ${key} is ${typeof key} but ${types[key]} is expected`);
            }
        } else {
            return reject(`Could not find required property in bid: ${key}`);
        }
    }

    // check if x and y lie in the canvas

    const auctionMetaData = await blockchain.getMetaData();
    if (bid.x < 0 || auctionMetaData.canvasWidth < bid.x)
        return reject(`The x-coordinate should be between 0 and ${auctionMetaData.canvasWidth}. Received: ${bid.x}`);
    if (bid.y < 0 || auctionMetaData.canvasHeight < bid.y)
        return reject(`The y-coordinate should be between 0 and ${auctionMetaData.canvasHeight}. Received: ${bid.y}`);

    // check if slot is open
    const slots = await blockchain.auctionSlots();
    const selectedSlot = slots.find(slot => slot.id === bid.slotId);
    if (!selectedSlot)
        return reject(`${bid.slotId} is not a valid slot id.`);

    const height = await blockchain.height();
    if (selectedSlot.startBlockHeight > height)
        return reject(`Slot ${selectedSlot.id} is not open yet. The chain is at ${height} and the slot starts at ${selectedSlot.startBlockHeight}`);
    if (selectedSlot.endBlockHeight <= height)
        return reject(`Slot ${selectedSlot.id} is already closed. The chain is at ${height} and the slot ends at ${selectedSlot.endBlockHeight}`);

    //check if dronetime fits minimum / maximum time of slot
    if (selectedSlot.minimumTimePerBid > bid.droneTime)
        return reject(`Slot ${selectedSlot.id} requires the dronetime to be larger than ${selectedSlot.minimumTimePerBid} Received: ${bid.droneTime}`);
    if (selectedSlot.maximumTimePerBid < bid.droneTime)
        return reject(`Slot ${selectedSlot.id} requires the dronetime to be smaller than ${selectedSlot.minimumTimePerBid} Received: ${bid.droneTime}`);

    // check if ipfs hash is technically valid
    const checkedHash = validateIPFSHash(bid.ipfsHash);
    if (!checkedHash.passed) return checkedHash;

    return accept();
};


// ROUTER HANDLER

sanity.runCheck = async (req, res) => {

    if (!req.params.check) return res.status(400).send('Please provide a check you want to run.');

    switch (req.params.check) {
        case 'all':
            return res.send({
                bidDataValid: await runSingleCheck(sanity.checkIfBidIsOkay, req.body),
                couldRetrieveFileFromIPFS: await runSingleCheck(sanity.checkIfFileIsInIPFS, req.body),
                fileIsValidSVG: await runSingleCheck(sanity.checkIfSVGIsOk, req)
            });
        case 'bidDataValid':
            return res.send({
                bidDataValid: await runSingleCheck(sanity.checkIfBidIsOkay, req.body)
            });
        case 'couldRetrieveFileFromIPFS':
            return res.send({
                couldRetrieveFileFromIPFS: await runSingleCheck(sanity.checkIfFileIsInIPFS, req.body),
            });
        case 'fileIsValidSVG':
            return res.send({
                fileIsValidSVG: await runSingleCheck(sanity.checkIfSVGIsOk, req)
            });
        default:
            return res.status(400).send(`We could not find a check titled ${req.params.check}`);
    }
};

module.exports = sanity;
