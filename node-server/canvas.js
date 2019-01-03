const fs = require('fs');
const path = require('path');
const {createCanvas, Image} = require('canvas');
const blockchain = require('./blockchain.js');
const ipfsWrapper = require('./ipfs.js');

const canvas = {};

const pathLatest = "./rendered/latest.png";

const renderInterval = 20000;

const canvasCentimeterWidth = 33 * 100;
const canvasCentimeterHeight = 50 * 100;
const pixelsPerCentimeter = 1;
const width = canvasCentimeterWidth * pixelsPerCentimeter;
const height = canvasCentimeterHeight * pixelsPerCentimeter;

let current_height = 0;

intervalJob = async () => {
    current_height = await blockchain.height();
    console.log('intervalJob', current_height);
    await canvas.render();
};

canvas.init = async () => {
    await blockchain.init();
    await intervalJob();

    // use timeout until we have a listener function for new blocks from the sdk
    setInterval(intervalJob, renderInterval);
};

canvas.init();

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
    }));

    // create canvas context
    const tempCanvas = createCanvas(width, height);
    const canvasContext = tempCanvas.getContext('2d');

    // set background color similar to wall
    canvasContext.fillStyle = "#FFFABA";
    canvasContext.fillRect(0, 0, width, height);

    const loadedImages = await Promise.all(images);

    // draw images to canvas
    loadedImages.forEach(image => {
        canvasContext.globalAlpha = image.opacity ? image.opacity : 1;
        canvasContext.drawImage(image.img, image.x || 0, image.y || 0);
    });

    return tempCanvas.toBuffer('image/png');
};

canvas.render = async () => {

    // get all files from ipfs that were included in bids
    const bids = await blockchain.allBids();
    const ipfsSources = await Promise.all(bids.map(bid => {
        return ipfsWrapper.getFile(bid.hash).then(filebuffer => {
            return {filebuffer: filebuffer, bid: bid};
        });
    }));

    // filter files unable to be fetched, map to base64 encoding with coordinates included
    const transformedSources = ipfsSources
        .filter(data => !!data.filebuffer)
        .map(data => {
            const base64buffer = data.filebuffer.toString('base64');
            return {
                src: 'data:image/svg+xml;base64,' + base64buffer,
                x: data.bid.coordinates.x * pixelsPerCentimeter,
                y: data.bid.coordinates.y * pixelsPerCentimeter
            };
        });

    const buffer = await canvas.mergeImages(transformedSources);
    fs.writeFileSync(path.join(__dirname, canvas.pathByHeight()), buffer);
    fs.writeFileSync(path.join(__dirname, pathLatest), buffer);
    console.log('did merge and write', transformedSources.length);
};

module.exports = canvas;
