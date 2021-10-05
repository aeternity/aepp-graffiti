const fs = require('fs');
const S3 = require('aws-sdk/clients/s3');
const path = require('path');
const ipfsWrapper = require('./ipfs.js');

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

        fs.readdir(path.join(__dirname, `../data/backup`), (_, localFiles) => {
            localFiles.forEach(localFile => {
                const [ipfsHash, ext] = localFile.split('.');
                if (shouldUpload(ipfsHash, ext)){
                    alreadyStored[ipfsHash] = Object.assign({}, alreadyStored[ipfsHash], {[ext]: true});
                    fs.readFile(path.join(__dirname, `../data/backup`, localFile), 'utf8', (_, file) => {
                        console.log("uploading not backed up local file", localFile)
                        backupRemote(localFile, file)
                    })
                }
            });
        });
    });

    storage.uploadAllToIPFS()
};

storage.uploadAllToIPFS = () => {
    const params = {
        Bucket: process.env.S3_BUCKET
    };
    client.listObjects(params, function (err, data) {
        if (err) return console.error("unable to list dir:", err.stack);
        data.Contents.reduce(async (promiseAcc, remoteFile) => {
            await promiseAcc;

            const [ipfsHash, ext] = remoteFile.Key.split('.');
            if(await ipfsWrapper.checkFileExists(ipfsHash)) return Promise.resolve()

            alreadyStored[ipfsHash] = Object.assign({}, alreadyStored[ipfsHash], {[ext]: true});

            try {
                console.log("downloading s3", ipfsHash)
                const file = await storage.retrieveSVG(ipfsHash);
                const ipfsUpload = await ipfsWrapper.addFile(file);
                ipfsWrapper.pinFile(ipfsHash);
                console.log("uploaded ipfs", ipfsUpload.path);
                return ipfsUpload;
            } catch (e) {
                console.warn(e);
                return Promise.resolve();
            }
        }, Promise.resolve());
        console.log("alreadyStored", alreadyStored)
    });
}

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

storage.retrieveSVG = (ipfsHash) => {
    return new Promise((resolve, reject) => {
        const params = {
            Bucket: process.env.S3_BUCKET,
            Key: `${ipfsHash}.svg`
        };
        client.getObject(params, function (err, data) {
            if (err) return reject(`S3: file ${ipfsHash}.svg not found`);
            return resolve(data.Body);
        });
    })
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
