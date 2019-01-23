const ipfsWrapper = require('./ipfs.js');
const blockchain = require('./blockchain.js');
const JSZip = require('jszip');
const logic = {};
const convert = require('xml-js');
const Base64 = require('js-base64').Base64;

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
        return res.json({
            hash: result[0].hash,
        });
    } catch (e) {
        return res.status(500).json({error: e});
    }
};

logic.ipfs = (req, res) => {

    if (!req.query.hash) return res.sendStatus(400);

    ipfsWrapper.getFile(req.query.hash).then((buffer) => {
        res.writeHead(200, {
            'Content-Type': 'image/svg',
            'Content-Length': buffer.length
        });
        res.end(buffer);

    }).catch(e => res.send(e.message));
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
        const successfulBids = selectedSlot.successfulBids;


        const ipfsSources = await Promise.all(successfulBids.map(bid => {
            return ipfsWrapper.getFile(bid.data.artworkReference).then(filebuffer => {
                return {filebuffer: filebuffer, bid: bid};
            }).catch(e => console.error(e));
        }));


        const sanityFails = {};
        // filter files unable to be fetched, map to base64 encoding with coordinates included
        const transformedSources = ipfsSources
            .filter(data => {

                try {
                    // SANITY CHECK

                    if (!data.filebuffer) {
                        sanityFails[data.bid.seqId] = 'Could not fetch file';
                        console.error(data.bid.seqId + ': Could not fetch file');
                        return false
                    }

                    const svgString = data.filebuffer.toString('utf8');

                    const result = convert.xml2js(svgString, {compact: true});

                    let height = String(result.svg._attributes.height);
                    let width = String(result.svg._attributes.width);

                    const re = /([\d.]+)mm/;

                    if (!height.includes('mm') || !height.match(re)[1]) {
                        sanityFails[data.bid.seqId] = 'Height not recognized';
                        console.error(data.bid.seqId + ': Height not recognized');
                        return false
                    }
                    if (!width.includes('mm') || !width.match(re)[1]) {
                        sanityFails[data.bid.seqId] = 'Width not recognized';
                        console.error(data.bid.seqId + ': Width not recognized');
                        return false
                    }

                    let origin = String(result.svg._attributes['wallCanvas:origin']);
                    if (!origin) {
                        result.svg._attributes['wallCanvas:origin'] = `${data.bid.data.coordinates.x * 10} ${data.bid.data.coordinates.y * 10}`
                    }

                    const x = Number(origin.split(" ")[0]);
                    const y = Number(origin.split(" ")[1]);

                    if (x !== data.bid.data.coordinates.x * 10 || y !== data.bid.data.coordinates.y * 10) {
                        sanityFails[data.bid.seqId] = 'Contract coordinates is not equal to svg data';
                        console.error(data.bid.seqId + ': Contract coordinates is not equal to svg data');
                        console.error(data.bid.seqId + `: Contract: x:${data.bid.data.coordinates.x * 10} y:${data.bid.data.coordinates.y * 10}`);
                        console.error(data.bid.seqId + `: SVG-Data: x:${x} y:${y}`);
                        return false
                    }

                    data.base64 = Base64.encode(convert.js2xml(result, {compact: true}));
                    return true
                } catch (e) {
                    console.error(data.bid.data.artworkReference + ': Sanity Check failed');
                }
            });

        const zip = new JSZip();

        transformedSources.map(data => {
            zip.file(`${data.bid.seqId}.svg`, data.base64, {base64: true}); //'data:image/svg+xml;base64,'
            zip.file(`${data.bid.seqId}.json`, JSON.stringify(data.bid));
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

module.exports = logic;
