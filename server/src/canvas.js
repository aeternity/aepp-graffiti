const fs = require('fs');
const path = require('path');
const svg2png = require('svg2png');
const blockchain = require('./blockchain.js');
const ipfsWrapper = require('./ipfs.js');
const svgUtil = require('./util/svg');
const svgstore = require('svgstore');
const {optimize} = require('svgo');

const canvas = {};


const renderInterval = 10000;

const canvasCentimeterWidth = 33 * 100;
const canvasCentimeterHeight = 50 * 100;
const pixelsPerCentimeter = 1;
const smallerScale = 0.3;
const width = canvasCentimeterWidth * pixelsPerCentimeter;
const height = canvasCentimeterHeight * pixelsPerCentimeter;

let current_height = 0;
canvas.latestSeqId = -1;

intervalJob = async () => {
    current_height = await blockchain.height().catch(console.error);
    console.log('intervalJob', current_height);
    await canvas.render();
};

canvas.fullPathWithIdentifier = '../data/rendered';

canvas.pathLatest = `${canvas.fullPathWithIdentifier}/latest`;
canvas.pathByHeightDir = `${canvas.fullPathWithIdentifier}/height`;
canvas.pathByHeight = () => {
    return `${canvas.pathByHeightDir}/${current_height}`;
};

createDirs = () => {
    const dirs = [canvas.fullPathWithIdentifier, canvas.pathByHeightDir];
    dirs.forEach((dir) => {
        if (!fs.existsSync(path.join(__dirname, dir))) {
            fs.mkdirSync(path.join(__dirname, dir));
        }
    })
};

canvas.init = async () => {
    createDirs();
    await blockchain.init();
    await intervalJob();

    // use timeout until we have a listener function for new blocks from the sdk
    setInterval(intervalJob, renderInterval);
};

canvas.svgToPNGBuffer = (svg, pixelWidth, pixelHeight) => {
    return svg2png(Buffer.from(svg), {
        width: pixelWidth,
        height: pixelHeight
    });
};

canvas.mergePNG = async (svg) => {
    const startSmall = new Date().getTime();
    const bufferSmall = await canvas.svgToPNGBuffer(svg,
        canvasCentimeterWidth * smallerScale,
        canvasCentimeterHeight * smallerScale);
    fs.writeFileSync(path.join(__dirname, canvas.pathByHeight() + "_small.png"), bufferSmall);
    fs.writeFileSync(path.join(__dirname, canvas.pathLatest) + "_small.png", bufferSmall);
    console.log('saved smaller png', 'timing', new Date().getTime() - startSmall, 'ms');

    const start = new Date().getTime();
    const buffer = await canvas.svgToPNGBuffer(svg,
        canvasCentimeterWidth * pixelsPerCentimeter,
        canvasCentimeterHeight * pixelsPerCentimeter);

    fs.writeFileSync(path.join(__dirname, canvas.pathByHeight() + ".png"), buffer);
    fs.writeFileSync(path.join(__dirname, canvas.pathLatest) + ".png", buffer);
    console.log('saved png', 'timing', new Date().getTime() - start, 'ms');
};


canvas.mergeSVG = async (sources) => {
    const start = new Date().getTime();

    const svg = svgstore({
        svgAttrs: {
            width: width,
            height: height,
            viewBox: `0 0 ${width} ${height}`
        }
    });

    const rect = {
        id: 0,
        width: width,
        height: height,
        x: 0,
        y: 0,
        svg: `<svg><rect width="${width}" height="${height}" style="fill:black;stroke-width:20;stroke:#777777" /></svg>`
    };

    const sourcesWithBorder = [rect].concat(sources);

    const sprites = sourcesWithBorder.reduce((acc, cur) => acc.add(cur.id, cur.svg), svg);

    const useStrings = sourcesWithBorder.reduce((acc, cur) => acc + `<use xlink:href="#${cur.id}" width="${cur.width}" height="${cur.height}" x="${cur.x}" y="${cur.y}" />`, "");
    const spritesString = sprites.toString();

    // REMOVES </svg> at the end to allow for insertion of use-strings
    const mergedString = spritesString.substr(0, spritesString.length - 6) + useStrings + "</svg>";

    const optimizedString = (await optimize(mergedString, {
        full: true,
        floatPrecision: 0,
    })).data;

    fs.writeFileSync(path.join(__dirname, canvas.pathByHeight() + ".svg"), optimizedString);
    fs.writeFileSync(path.join(__dirname, canvas.pathLatest) + ".svg", optimizedString);
    console.log('saved svg', 'timing', new Date().getTime() - start, 'ms');
    return mergedString;
};

canvas.render = async () => {

    const start = new Date().getTime();

    // get all files from ipfs that were included in bids
    const auctionSlots = await blockchain.auctionSlots().catch(console.error);

    // using Number to convert bigint here is save as those are not expected to grow over bounds
    const successful_bids = auctionSlots
        .sort((a, b) => Number(a.end_block_height) - Number(b.end_block_height)) // sort slots ascending by end block height
        .map(slot => slot.successful_bids.sort((a, b) => Number(a.seq_id) - Number(b.seq_id))) // sort bids in slot ascending
        .reduce((acc, val) => acc.concat(val), []); // flatten inner arrays

    const latestSeqId = Math.max(...successful_bids.map(x => Number(x.seq_id)).concat([0]));


    if (canvas.latestSeqId === latestSeqId) {
        console.log('will not rerender, latest seq_id', latestSeqId, 'timing', new Date().getTime() - start, 'ms');
        return;
    } else {
        console.log('will rerender to seq_id', latestSeqId);
        canvas.latestSeqId = latestSeqId;
    }

    const startIpfs = new Date().getTime();
    // fetching files from ipfs
    const ipfsSources = await Promise.all(successful_bids.map(bid => {
        return ipfsWrapper.getFile(bid.data.artwork_reference).then(filebuffer => {
            return {filebuffer: filebuffer, bid: bid};
        }).catch(console.error);
    }));
    console.log('did fetch ipfs', 'timing', new Date().getTime() - startIpfs, 'ms');


    // filter files unable to be fetched and failing sanity checks, map to base64 encoding with coordinates included
    const transformedSources = await Promise.all(ipfsSources
        .filter(data => !!data && !!data.filebuffer)
        .filter(data => svgUtil.sanityCheck(data).checkPassed)
        .map(async data => {
            const {width, height, svg} = svgUtil.getSVGDimensions(data.filebuffer.toString('utf8'));
            if (!svg) return console.error('Could not get width and height from svg ' + data.bid.data.artwork_reference);

            return {
                svg: svg,
                id: data.bid.seq_id,
                x: Number(data.bid.data.coordinates.x) * pixelsPerCentimeter,
                y: Number(data.bid.data.coordinates.y) * pixelsPerCentimeter,
                width,
                height
            };
        }));

    const svg = await canvas.mergeSVG(transformedSources);

    await canvas.mergePNG(svg);
    console.log('did merge and write', transformedSources.length, 'timing', new Date().getTime() - start, 'ms');
};

module.exports = canvas;
