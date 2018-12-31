const fs = require('fs');
const path = require('path');
const {createCanvas, Image} = require('canvas');
const blockchain = require('./blockchain.js');
const ipfsWrapper = require('./ipfs.js');

const canvas = {};

const shouldAlwaysRender = false;

canvas.current_heigth = 0;
canvas.buffer = null;

canvas.height = 3000;
canvas.width = 3000;

updateHeight = async () => canvas.current_heigth = await blockchain.height();

const init = async () => {
    await blockchain.init();
    await updateHeight();

    // use timeout until we have a listener function for new blocks from the sdk
    setInterval(updateHeight, 10000);
};

init();

canvas.pathByHeight = () => {
    return `./rendered/rendered_height_${canvas.current_heigth}.png`;
};

canvas.shouldRender = (req, res, next) => {

    // FORCE FOR DEVELOP
    if (shouldAlwaysRender) {
        return canvas.render().then(next);
    }

    // RERENDER IF THE FILE DOES NOT EXIST
    if (!fs.existsSync(canvas.pathByHeight())) {
        return canvas.render().then(next);
    }

    if (!canvas.buffer) {
        canvas.loadImage();
        return next();
    }

    next();
};

canvas.mergeImages = async (sources) => {

    // Load sources
    const images = sources.map(source => new Promise((resolve, reject) => {
        // Resolve source and img when loaded
        const img = new Image();
        img.onerror = () => reject(new Error('Couldn\'t load image'));
        img.onload = () => resolve(Object.assign({}, source, {img}));
        img.src = source.src;
    }));

    // Get canvas context
    const fakeCanvas = createCanvas(canvas.width, canvas.height);
    const ctx = fakeCanvas.getContext('2d');

    const loadedImages = await Promise.all(images);

    // Draw images to canvas
    loadedImages.forEach(image => {
        ctx.globalAlpha = image.opacity ? image.opacity : 1;
        ctx.drawImage(image.img, image.x || 0, image.y || 0);
    });

    return fakeCanvas.toBuffer('image/png');

};

canvas.loadImage = () => {
    canvas.buffer = fs.readFileSync(path.join(__dirname, canvas.pathByHeight()));
};

canvas.render = async () => {

    const bids = await blockchain.allBids();
    const ipfsSources = await Promise.all(bids.map(bid => {
        return ipfsWrapper.getFile(bid.hash).then(filebuffer => {
            return {filebuffer: filebuffer, bid: bid};
        });
    }));

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

};

canvas.send = (req, res) => {

    res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': canvas.buffer.length
    });
    res.end(canvas.buffer);
};

module.exports = canvas;
