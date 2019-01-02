const ipfsWrapper = require('./ipfs.js');

const logic = {};

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
    ipfsWrapper.getFile('QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd').then((buffer) => {
        res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': buffer.length
        });
        res.end(buffer);

    }).catch(e =>  res.send(e.message));
};

module.exports = logic;
