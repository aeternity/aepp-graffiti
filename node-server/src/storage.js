const fs = require('fs');
const S3 = require('aws-sdk/clients/s3');
const path = require('path');

const client = new S3({
    accessKeyId: process.env.S3_KEY,
    secretAccessKey: process.env.S3_SECRET,
    region: process.env.S3_REGION
});

const storage = {};
const alreadyStored = {};

storage.init = () => {
    const params = {
        Bucket: process.env.S3_BUCKET
    };
    client.listObjects(params, function (err, data) {
        if (err) return console.error("unable to list dir:", err.stack);
        data.Contents.map(remoteFile => {
            const [ipfsHash, ext] = remoteFile.Key.split('.');
            alreadyStored[ipfsHash] = Object.assign({}, alreadyStored[ipfsHash], {[ext]: true});
        });
        console.log(alreadyStored)
    });
};

const shouldUpload = (ipfsHash, ext) => {
    return !alreadyStored[ipfsHash] || !alreadyStored[ipfsHash][ext];
};

storage.backupSVG = async (ipfsHash, svgFileBuffer) => {
    try {
        if (!shouldUpload(ipfsHash, 'svg')) return;
        backupLocal(`${ipfsHash}.svg`, svgFileBuffer);
        await backupRemote(`${ipfsHash}.svg`, svgFileBuffer);
        alreadyStored[ipfsHash] = Object.assign({}, alreadyStored[ipfsHash], {svg: true});
    } catch (e) {
        console.error(`${ipfsHash}.svg upload failed with:`, e);
    }
};

storage.backupBid = async (ipfsHash, bid) => {
    try {
        if (!shouldUpload(ipfsHash, 'json')) return;
        backupLocal(`${ipfsHash}.json`, JSON.stringify(bid));
        await backupRemote(`${ipfsHash}.json`, JSON.stringify(bid));
        alreadyStored[ipfsHash] = Object.assign({}, alreadyStored[ipfsHash], {json: true});
    } catch (e) {
        console.error(`${ipfsHash}.json upload failed with:`, e);
    }
};

const backupRemote = (remoteName, file) => {
    return new Promise(function (resolve, reject) {

        const params = {
            Body: file,
            Bucket: process.env.S3_BUCKET,
            Key: remoteName
        };

        client.putObject(params, (err) => {
            if (err) {
                console.error("unable to upload:", err.stack);
                return reject();
            }
            resolve();
        });
    });
};


const backupLocal = (fileName, file) => {
    fs.writeFileSync(path.join(__dirname, `../data/backup/${fileName}`), file);
};

module.exports = storage;
