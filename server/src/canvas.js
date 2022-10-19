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

canvas.pathIdentifier = process.env.PATH_IDENTIFIER;
canvas.fullPathWithIdentifier = `../data/rendered/${canvas.pathIdentifier}`;

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
    if (!process.env.PATH_IDENTIFIER) throw "PATH_IDENTIFIER is not set";

    createDirs();
    await blockchain.init();
    await intervalJob();

    // use timeout until we have a listener function for new blocks from the sdk
    setInterval(intervalJob, renderInterval);
};

canvas.svgToPNGBuffer = (svg, pixelWidth, pixelHeight) => {
    return svg2png.sync(Buffer.from(svg), {
        width: pixelWidth,
        height: pixelHeight
    });
};

canvas.mergePNG = (svg) => {

    const startSmall = new Date().getTime();
    const bufferSmall = canvas.svgToPNGBuffer(svg,
        canvasCentimeterWidth * smallerScale,
        canvasCentimeterHeight * smallerScale);
    fs.writeFileSync(path.join(__dirname, canvas.pathByHeight() + "_small.png"), bufferSmall);
    fs.writeFileSync(path.join(__dirname, canvas.pathLatest) + "_small.png", bufferSmall);
    console.log('saved smaller png', 'timing', new Date().getTime() - startSmall, 'ms');

    const start = new Date().getTime();
    const buffer = canvas.svgToPNGBuffer(svg,
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

canvas.shardSVG = (svgString, settings) => {
    const currentViewbox = `viewBox="0 0 ${canvasCentimeterWidth * pixelsPerCentimeter} ${canvasCentimeterHeight * pixelsPerCentimeter}"`;
    let horizontalIndex = 0;
    let verticalIndex = 0;
    const shardWidth = canvasCentimeterWidth * pixelsPerCentimeter / settings.horizontalShards;
    const shardHeight = canvasCentimeterHeight * pixelsPerCentimeter / settings.verticalShards;


    for (let i = 0; i < settings.horizontalShards * settings.verticalShards; i++) {
        horizontalIndex = i % settings.horizontalShards;
        verticalIndex = Math.floor(i / settings.verticalShards);

        const xOffset = shardWidth * horizontalIndex;
        const yOffset = shardHeight * verticalIndex;

        let updatedSVGStrig = svgString.replace(currentViewbox, `viewBox="${xOffset} ${yOffset} ${shardWidth} ${shardHeight}"`);
        updatedSVGStrig = updatedSVGStrig.replace(`width="${canvasCentimeterWidth * pixelsPerCentimeter}"`, `width="${shardWidth * settings.scaleFactor}"`);
        updatedSVGStrig = updatedSVGStrig.replace(`height="${canvasCentimeterHeight * pixelsPerCentimeter}"`, `height="${shardHeight * settings.scaleFactor}"`);

        const png = canvas.svgToPNGBuffer(updatedSVGStrig);
        fs.writeFileSync(path.join(__dirname, `../data/rendered/shards`, `${settings.horizontalShards}${settings.verticalShards}_${horizontalIndex}_${verticalIndex}.png`), png);
    }
};


canvas.render = async () => {

    const start = new Date().getTime();

    // get all files from ipfs that were included in bids
    const auctionSlots = await blockchain.auctionSlots().catch(console.error);
    const successful_bids = auctionSlots
        .sort((a, b) => a.end_block_height - b.end_block_height) // sort slots ascending by end block height
        .map(slot => slot.successful_bids.sort((a, b) => a.seq_id - b.seq_id)) // sort bids in slot ascending
        .reduce((acc, val) => acc.concat(val), []); // flatten inner arrays

    const latestSeqId = Math.max(...successful_bids.map(x => x.seq_id).concat([0]));


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
                x: data.bid.data.coordinates.x * pixelsPerCentimeter,
                y: data.bid.data.coordinates.y * pixelsPerCentimeter,
                width,
                height
            };
        }));

    const svg = await canvas.mergeSVG(transformedSources);

    canvas.mergePNG(svg);
    console.log('did merge and write', transformedSources.length, 'timing', new Date().getTime() - start, 'ms');
};

module.exports = canvas;
