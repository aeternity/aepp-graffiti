const fs = require('fs');
const path = require('path');
const {createCanvas, Image} = require('canvas');
const blockchain = require('./blockchain.js');
const ipfsWrapper = require('./ipfs.js');

const canvas = {};
const renderInterval = 20000;

let current_height = 0;

canvas.buffer = null;

canvas.height = 3000;
canvas.width = 3000;

intervalJob = async () => {
    current_height = await blockchain.height();
    console.log('intervalJob', current_height);
    await canvas.render();
};

const init = async () => {
    await blockchain.init();
    await intervalJob();

    // use timeout until we have a listener function for new blocks from the sdk
    setInterval(intervalJob, renderInterval);
};

init();

canvas.pathByHeight = () => {
    return `./rendered/rendered_height_${current_height}.png`;
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
    const tempCanvas = createCanvas(canvas.width, canvas.height);
    const canvasContext = tempCanvas.getContext('2d');

    const loadedImages = await Promise.all(images);

    // draw images to canvas
    loadedImages.forEach(image => {
        canvasContext.globalAlpha = image.opacity ? image.opacity : 1;
        canvasContext.drawImage(image.img, image.x || 0, image.y || 0);
    });

    return tempCanvas.toBuffer('image/png');
};

canvas.loadImage = () => {
    canvas.buffer = fs.readFileSync(path.join(__dirname, canvas.pathByHeight()));
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
                x: data.bid.coordinates.x,
                y: data.bid.coordinates.y
            };
        });

    canvas.buffer = await canvas.mergeImages(transformedSources);
    fs.writeFileSync(path.join(__dirname, canvas.pathByHeight()), canvas.buffer);
    console.log('did write');
};

canvas.send = (req, res) => {
    if (canvas.buffer === null) {
        canvas.loadImage();
    }

    res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': canvas.buffer.length
    });
    res.end(canvas.buffer);
};

module.exports = canvas;
