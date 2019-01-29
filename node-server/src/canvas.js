const fs = require('fs');
const path = require('path');
const svg2png = require('svg2png');
const blockchain = require('./blockchain.js');
const ipfsWrapper = require('./ipfs.js');
const storage = require('./storage.js');
const svgUtil = require('./svg_util.js');
const svgstore = require('svgstore');

const canvas = {};


const renderInterval = 10000;

const canvasCentimeterWidth = 33 * 100;
const canvasCentimeterHeight = 50 * 100;
const pixelsPerCentimeter = 1;
const width = canvasCentimeterWidth * pixelsPerCentimeter;
const height = canvasCentimeterHeight * pixelsPerCentimeter;

let current_height = 0;

canvas.latestSeqId = 0;

intervalJob = async () => {
    current_height = await blockchain.height().catch(console.error);
    console.log('intervalJob', current_height);
    await canvas.render();
};

canvas.init = async () => {
    await blockchain.init();
    await intervalJob();

    // use timeout until we have a listener function for new blocks from the sdk
    setInterval(intervalJob, renderInterval);
};

canvas.pathLatest = "../rendered/latest";
canvas.pathByHeight = () => {
    return `../rendered/height/${current_height}`;
};

canvas.mergePNG = async (svg) => {
    const start = new Date().getTime();
    const buffer = await svg2png(Buffer.from(svg));
    fs.writeFileSync(path.join(__dirname, canvas.pathByHeight() + ".png"), buffer);
    fs.writeFileSync(path.join(__dirname, canvas.pathLatest) + ".png", buffer);
    console.log('saved png', 'timing', new Date().getTime() - start, 'ms');
};

canvas.mergeSVG = (sources) => {
    const start = new Date().getTime();
    const svg = svgstore({
        svgAttrs: {
            width: width,
            height: height,
            viewBox: `0 0 ${width} ${height}`
        }
    });
    const sprites = sources.reduce((acc, cur) => acc.add(cur.id, cur.svg), svg);

    const useStrings = sources.reduce((acc, cur) => acc + `<use xlink:href="#${cur.id}" width="${cur.width}" height="${cur.height}" x="${cur.x}" y="${cur.y}" />`, "");
    const spritesString = sprites.toString();

    const mergedString = spritesString.substr(0, spritesString.length - 6) + useStrings + "</svg>";

    fs.writeFileSync(path.join(__dirname, canvas.pathByHeight() + ".svg"), mergedString);
    fs.writeFileSync(path.join(__dirname, canvas.pathLatest) + ".svg", mergedString);
    console.log('saved svg', 'timing', new Date().getTime() - start, 'ms');
    return mergedString;
};


canvas.render = async () => {

    const start = new Date().getTime();

    // get all files from ipfs that were included in bids
    const auctionSlots = await blockchain.auctionSlots().catch(console.error);
    const successfulBids = auctionSlots
        .sort((a, b) => a.endBlockHeight - b.endBlockHeight) // sort slots ascending by end block height
        .map(slot => slot.successfulBids.sort((a, b) => a.seqId - b.seqId)) // sort bids in slot ascending
        .reduce((acc, val) => acc.concat(val), []); // flatten inner arrays

    const latestSeqId = Math.max(...successfulBids.map(x => x.seqId));
    console.log(latestSeqId);

    if (canvas.latestSeqId === latestSeqId) {
        console.log('will not rerender, latest seqId', latestSeqId, 'timing', new Date().getTime() - start, 'ms');
        return;
    } else {
        console.log('will rerender to seqId', latestSeqId);
        canvas.latestSeqId = latestSeqId;
    }

    // backup data
    Promise.all(successfulBids
        .map(async bid => await storage.backupBid(bid.data.artworkReference, bid)))
        .catch((e) => console.warn('bid upload failed', e.message));

    const startIpfs = new Date().getTime();
    // fetching files from ipfs
    const ipfsSources = await Promise.all(successfulBids.map(bid => {
        return ipfsWrapper.getFile(bid.data.artworkReference).then(filebuffer => {
            return {filebuffer: filebuffer, bid: bid};
        }).catch(console.error);
    }));
    console.log('did fetch ipfs', 'timing', new Date().getTime() - startIpfs, 'ms');


    // filter files unable to be fetched and failing sanity checks, map to base64 encoding with coordinates included
    const transformedSources = await Promise.all(ipfsSources
        .filter(data => !!data.filebuffer)
        .filter(data => svgUtil.sanityCheck(data).checkPassed)
        .map(async data => {
            const {width, height, svg} = svgUtil.getSVGDimensions(data.filebuffer.toString('utf8'));
            if (!svg) return console.error('Could not get width and height from svg ' + data.bid.data.artworkReference);

            storage.backupSVG(data.bid.data.artworkReference, svg).catch((e) => {
                console.warn('svg upload failed');
                console.warn(e.message);
            });

            return {
                svg: svg,
                id: data.bid.seqId,
                x: data.bid.data.coordinates.x * pixelsPerCentimeter,
                y: data.bid.data.coordinates.y * pixelsPerCentimeter,
                width,
                height
            };
        }));

    const svg = canvas.mergeSVG(transformedSources);
    await canvas.mergePNG(svg);
    console.log('did merge and write', transformedSources.length, 'timing', new Date().getTime() - start, 'ms');
};

module.exports = canvas;
