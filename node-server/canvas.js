const fs = require('fs');
const path = require('path');
const {createCanvas, Image} = require('canvas');
const blockchain = require('./blockchain.js');
const ipfsWrapper = require('./ipfs.js');
const convert = require('xml-js');
const Base64 = require('js-base64').Base64;

const canvas = {};

const pathLatest = "./rendered/latest.png";

const renderInterval = 20000;

const svgScalingFactor = 2;
const canvasCentimeterWidth = 33 * 100;
const canvasCentimeterHeight = 50 * 100;
const pixelsPerCentimeter = 1;
const width = canvasCentimeterWidth * pixelsPerCentimeter;
const height = canvasCentimeterHeight * pixelsPerCentimeter;

let current_height = 0;

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

canvas.pathByHeight = () => {
    return `./rendered/height/${current_height}.png`;
};

canvas.mergeImages = async (sources) => {

    // Load sources
    const images = sources.map(source => new Promise((resolve, reject) => {
        // Resolve source and image when loaded
        const image = new Image();
        image.onerror = () => reject(new Error('Couldn\'t load image'));
        image.onload = () => resolve(Object.assign({}, source, {img: image}));
        image.src = source.src;
    }).catch(console.error));

    // create canvas context
    const tempCanvas = createCanvas(width, height);
    const canvasContext = tempCanvas.getContext('2d');

    // set background color similar to wall
    canvasContext.fillStyle = "#FFFABA";
    canvasContext.fillRect(0, 0, width, height);

    const loadedImages = await Promise.all(images);

    // draw images to canvas
    loadedImages.forEach(image => {
        if (image) {
            canvasContext.globalAlpha = image.opacity ? image.opacity : 1;
            if (image.width > 0 && image.height > 0) {
                canvasContext.drawImage(image.img, image.x || 0, image.y || 0, image.width, image.height);
            } else {
                canvasContext.drawImage(image.img, image.x || 0, image.y || 0);
            }
        }
    });

    return tempCanvas.toBuffer('image/png');
};

canvas.getSVGDimensions = (svgString) => {
    try {
        const result = convert.xml2js(svgString, {compact: true});
        let height = String(result.svg._attributes.height);
        let width = String(result.svg._attributes.width);
        const re = /([\d.]+)mm/;
        if (height.includes('mm')) {
            height = Number(height.match(re)[1]) / (pixelsPerCentimeter * 10)
        }
        if (width.includes('mm')) {
            width = Number(width.match(re)[1]) / (pixelsPerCentimeter * 10)
        }

        result.svg._attributes.height = (height / svgScalingFactor) + "mm";
        result.svg._attributes.width = (width / svgScalingFactor) + "mm";

        const svg = convert.js2xml(result, {compact: true});
        return {width, height, svg}

    } catch (e) {
        console.error('Could not get width / height from image ', svgString.substr(0, 20), e);
        return {width: 0, height: 0}
    }
};

canvas.render = async () => {

    // get all files from ipfs that were included in bids
    const auctionSlots = await blockchain.auctionSlots().catch(console.error);
    const successfulBids = auctionSlots.map(slot => slot.successfulBids).reduce((acc, val) => acc.concat(val), []).sort((a, b) => a.seqId - b.seqId);

    const ipfsSources = await Promise.all(successfulBids.map(bid => {
        return ipfsWrapper.getFile(bid.data.artworkReference).then(filebuffer => {
            return {filebuffer: filebuffer, bid: bid};
        }).catch(e => console.error(e));
    }));

    // filter files unable to be fetched, map to base64 encoding with coordinates included
    const transformedSources = ipfsSources
        .filter(data => !!data.filebuffer)
        .map(data => {
            const {width, height, svg} = canvas.getSVGDimensions(data.filebuffer.toString('utf8'));
            return {
                src: 'data:image/svg+xml;base64,' + Base64.encode(svg),
                x: data.bid.data.coordinates.x * pixelsPerCentimeter,
                y: data.bid.data.coordinates.y * pixelsPerCentimeter,
                width,
                height
            };
        });

    const buffer = await canvas.mergeImages(transformedSources);
    fs.writeFileSync(path.join(__dirname, canvas.pathByHeight()), buffer);
    fs.writeFileSync(path.join(__dirname, pathLatest), buffer);
    console.log('did merge and write', transformedSources.length);
};

module.exports = canvas;
