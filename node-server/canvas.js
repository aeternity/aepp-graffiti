const fs = require('fs');
const path = require('path');
const { createCanvas, Image } = require('canvas');

const canvas = {};
const shouldRender = false;
const PATH = './rendered.png';

canvas.height = 2000;
canvas.width = 2000;
canvas.buffer = null;

canvas.shouldRender = (req, res, next) => {

    // FORCE FOR DEVELOP
    if (shouldRender) {
        return canvas.render().then(next);
    }

    // RERENDER IF THE FILE DOES NOT EXIST
    if (!fs.existsSync(PATH)) {
        return canvas.render().then(next);
    }

    if (!canvas.buffer) {
        canvas.loadImage();
        next();
    }

    // RERENDER IF A NEW BLOCK OCCURRED
    // TODO implement

    next();
};

canvas.mergeImages = async (sources) => {

    // Load sources
    const images = sources.map(source => new Promise((resolve, reject) => {
        // Resolve source and img when loaded
        const img = new Image();
        img.onerror = () => reject(new Error('Couldn\'t load image'));
        img.onload = () => resolve(Object.assign({}, source, { img }));
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
    canvas.buffer = fs.readFileSync(path.join(__dirname, PATH));
};

canvas.render = async () => {

    const imageBuffer = [];

    for (let i = 0; i < 100; i++) {
        imageBuffer.push({
            src: './molumen_audio_cassette.svg',
            x: Math.round(Math.random() * 2000),
            y: Math.round(Math.random() * 2000)
        });
    }


    canvas.buffer = await canvas.mergeImages(imageBuffer);
    fs.writeFileSync(path.join(__dirname, PATH), canvas.buffer);

};

canvas.send = (req, res, next) => {

    fs.readFileSync(path.join(__dirname, PATH));

    res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': canvas.buffer.length
    });
    res.end(canvas.buffer);
};

module.exports = canvas;