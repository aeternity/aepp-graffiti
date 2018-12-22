const fs = require('fs');
const path = require('path');
const {createCanvas, Image} = require('canvas');
const blockchain = require('./blockchain.js');
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

    const imageBuffer = [];

    for (let i = 0; i < 100; i++) {
        imageBuffer.push({
            src: './molumen_audio_cassette.svg',
            x: Math.round(Math.random() * canvas.width),
            y: Math.round(Math.random() * canvas.height)
        });
    }


    canvas.buffer = await canvas.mergeImages(imageBuffer);
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
