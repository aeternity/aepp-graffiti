const ipfsWrapper = require('./ipfs.js');
const blockchain = require('./blockchain.js');
const JSZip = require('jszip');
const logic = {};
const storage = require('./storage.js');
const svgUtil = require('./svg_util.js');
const fs = require('fs');
const path = require('path');

logic.upload = async (req, res) => {
    if (Object.keys(req.files).length === 0) {
        return res.status(422).json({
            error: 'File needs to be provided.',
        });
    }

    const file = req.files.image;
    const mime = file.mimetype;
    if (mime.split('/')[0] !== 'image') {
        return res.status(422).json({
            error: 'File needs to be an image.',
        });
    }

    try {
        const result = await ipfsWrapper.writeFile(file.data);

        //BACKUP SVG TO S3
        await storage.backupSVG(result[0].hash, file.data);

        return res.json({
            hash: result[0].hash,
        });
    } catch (e) {
        return res.status(500).json({error: e});
    }
};

logic.ipfs = async (req, res) => {
    if (!req.params.hash) return res.sendStatus(400);
    const hash = req.params.hash;

    // FIRST GET LOCAL
    if (fs.existsSync(path.join(__dirname, `../data/backup/${hash}.svg`))) {
        try {
            const buffer = fs.readFileSync(path.join(__dirname, `../data/backup/${hash}.svg`));
            res.writeHead(200, {
                'Content-Type': 'image/svg+xml',
                'Content-Length': buffer.length
            });
            return res.end(buffer);
        } catch (e) {
            console.warn(e.message)
        }
    }

    // THEN GET S3
    try {
        const buffer = await storage.retrieveSVG(hash);
        res.writeHead(200, {
            'Content-Type': 'image/svg+xml',
            'Content-Length': buffer.length
        });
        return res.end(buffer);
    } catch (e) {
        console.warn(e.message);
    }

    // THEN GET IPFS
    try {
        const buffer = await ipfsWrapper.getFile(req.params.hash);
        res.writeHead(200, {
            'Content-Type': 'image/svg+xml',
            'Content-Length': buffer.length
        });
        return res.end(buffer);
    } catch (e) {
        console.warn(e.message)
    }

    // THEN FAIL
    res.sendStatus(404);

};

logic.getSlots = async (req, res) => {

    if (!req.params.id) return res.sendStatus(400);

    try {
        // GET SELECTED SLOT
        const slots = await blockchain.auctionSlots();

        const selectedSlot = slots.find(slot => Number(slot.id) === Number(req.params.id));

        if (!selectedSlot) {
            return res.sendStatus(404);
        }

        // GET ALL IMAGES
        const ipfsSources = await Promise.all(selectedSlot.successfulBids.map(bid => {
            return ipfsWrapper.getFile(bid.data.artworkReference).then(filebuffer => {
                return {filebuffer: filebuffer, bid: bid};
            }).catch(e => console.error(e));
        }));

        let sanityFails = {};

        // filter files unable to be fetched, map to base64 encoding with coordinates included
        const sanityCheckedDataSources = ipfsSources.map(data => {
            const sanityChecked = svgUtil.sanityCheck(data);
            sanityFails = Object.assign(sanityChecked.dataFails, sanityFails);
            return sanityChecked
        });

        const filteredSources = sanityCheckedDataSources
            .filter(sanityChecked => sanityChecked.checkPassed)
            .map(sanityChecked => sanityChecked.data);

        const sanityFailedSources = sanityCheckedDataSources
            .filter(sanityChecked => !sanityChecked.checkPassed)
            .map(sanityChecked => sanityChecked.data);


        const zip = new JSZip();
        filteredSources.map(data => {
            zip.file(`${data.bid.seqId}.svg`, data.base64, {base64: true}); //'data:image/svg+xml;base64,'
            zip.file(`${data.bid.seqId}.json`, JSON.stringify(data.bid));
        });

        const sanityFailedFolder = zip.folder("sanity_fails");
        sanityFailedSources.map(data => {
            sanityFailedFolder.file(`${data.bid.seqId}.svg`, data.base64, {base64: true}); //'data:image/svg+xml;base64,'
            sanityFailedFolder.file(`${data.bid.seqId}.json`, JSON.stringify(data.bid));
        });

        if (Object.keys(sanityFails).length > 0) {
            zip.file(`sanity_fails.json`, JSON.stringify(sanityFails))
        }

        const buffer = await zip.generateAsync({type: "nodebuffer"});
        res.writeHead(200, {
            'Content-Disposition': `attachment;filename=slot_${selectedSlot.id}_at_${Date.now()}.zip`,
            'Content-Type': 'application/zip',
            'Content-Length': buffer.length
        });
        res.end(buffer);
    } catch (e) {
        res.status(500).send(e.message);
    }

};

logic.teaserJson = async (req, res) => {
    const artworks = await blockchain.teaserArtworks();
    const geolocation = await blockchain.teaserGeolocation();
    res.json({
        contractAddress: blockchain.teaserContractAddress,
        contractData: {
            geolocation: geolocation,
            artworks: artworks
        }
    });
};

module.exports = logic;
