const ipfsWrapper = require('./ipfs.js');
const blockchain = require('./blockchain.js');
const JSZip = require('jszip');
const logic = {};
const storage = require('./storage.js');
const svgUtil = require('./util/svg');
const fs = require('fs');
const path = require('path');

logic.upload = async (req, res, next) => {
    if (Object.keys(req.files).length === 0) {
        return res.status(422).json({
            error: 'File needs to be provided.',
        });
    }

    const file = req.files.image;
    const mime = file.mimetype;
    console.log(mime);
    if (mime !== 'image/svg+xml') {
        return res.status(422).json({
            error: 'File needs to be image/svg+xml.',
        });
    }

    const sanityCheck = await svgUtil.sanityCheckFileOnly({filebuffer: file.data}, 'upload');
    if (!sanityCheck.checkPassed) {
        return res.status(422).json({
            error: sanityCheck.dataFails.upload,
        });
    }

    try {
        const result = await ipfsWrapper.addFile(file.data);
        await ipfsWrapper.pinFile(result[0].path);

        //BACKUP SVG TO S3
        await storage.backupSVG(result[0].path, file.data);

        return res.json({
            hash: result[0].path,
        });
    } catch (e) {
        return next(e);
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

logic.getSlots = async (req, res, next) => {

    if (!req.params.id) return res.sendStatus(400);

    try {
        // GET SELECTED SLOT
        const slots = await blockchain.auctionSlots();

        const selectedSlot = slots.find(slot => Number(slot.id) === Number(req.params.id));

        if (!selectedSlot) {
            return res.sendStatus(404);
        }

        // GET ALL IMAGES
        const ipfsSources = await Promise.all(selectedSlot.successful_bids.map(bid => {
            return ipfsWrapper.getFile(bid.data.artwork_reference).then(filebuffer => {
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
            zip.file(`${data.bid.seq_id}.svg`, data.base64, {base64: true}); //'data:image/svg+xml;base64,'
            zip.file(`${data.bid.seq_id}.json`, JSON.stringify(data.bid));
        });

        const sanityFailedFolder = zip.folder("sanity_fails");
        sanityFailedSources.map(data => {
            sanityFailedFolder.file(`${data.bid.seq_id}.svg`, data.base64, {base64: true}); //'data:image/svg+xml;base64,'
            sanityFailedFolder.file(`${data.bid.seq_id}.json`, JSON.stringify(data.bid));
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
        return next(e);
    }

};

logic.getSingleBid = async (req, res, next) => {
    try {
        const searchId = req.params.id;
        const slots = await blockchain.auctionSlots();
        const currentHeight = await blockchain.height();


        const allBids = slots
            .reduce((acc, slot) => acc.concat(
                slot.successful_bids.map(b => Object.assign(b, {
                    slot: Object.assign({}, slot, {
                        successful_bids: null,
                        failed_bids: null,
                        active: currentHeight > slot.start_block_height && currentHeight <= slot.end_block_height
                    }),
                    success: true
                }))
            ).concat(
                slot.failed_bids.map(b => Object.assign(b, {
                    slot: Object.assign({}, slot, {
                        successful_bids: null,
                        failed_bids: null,
                        active: currentHeight > slot.start_block_height && currentHeight <= slot.end_block_height
                    }),
                    success: false
                }))
            ), []);

        const bid = allBids.find(bid => Number(bid.seq_id) === Number(searchId));

        if (!bid) return res.sendStatus(404);
        return res.json(bid);
    } catch (e) {
        return next(e);
    }
};

module.exports = logic;
