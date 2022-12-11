const fs = require('fs');
const S3 = require('aws-sdk/clients/s3');
const path = require('path');
const ipfsWrapper = require('./ipfs.js');
const blockchain = require("./blockchain");
const isIPFS = require('is-ipfs');

const client = new S3({
    accessKeyId: process.env.S3_KEY,
    secretAccessKey: process.env.S3_SECRET,
    region: process.env.S3_REGION
});

const storage = {};

storage.init = async () => {
    if (process.env.SYNC_STORAGE) {
        console.log('starting storage sync, can be disabled by removing SYNC_STORAGE=')
        const fileLocations = await storage.compileFileList();
        await storage.synchronizeStorage(fileLocations);

        console.log("missing files:", Object.entries(await storage.compileFileList())
            .filter(([ipfsHash, storages]) => isIPFS.multihash(ipfsHash) && (!storages.s3 || !storages.local || !storages.ipfs))
            .map(([ipfsHash]) => ipfsHash));
        console.log('finished storage sync')
    } else {
        console.log('optional storage sync can be enabled by setting SYNC_STORAGE=true')
    }
};

storage.synchronizeStorage = async (fileLocations) => {
    const downloadToLocal = async (ipfsHash, storages) => {
        if (storages.local) return true;
        if (storages.s3) {
            const content = await storage.retrieveSVG(ipfsHash).catch(console.error)
            if (content) {
                await backupLocal(`${ipfsHash}.svg`, content);
                process.stdout.write('-')
                fileLocations[ipfsHash].local = true
                return true
            }
        }
        if (storages.ipfs) {
            const content = await ipfsWrapper.getFile(ipfsHash).catch(console.error)
            if (content) {
                await backupLocal(`${ipfsHash}.svg`, content);
                process.stdout.write('-')
                fileLocations[ipfsHash].local = true
                return true
            }
        }
    }

    const uploadToRemote = async (ipfsHash, storages) => {
        if (!storages.s3) {
            await storage.backupSVG(ipfsHash, readLocal(`${ipfsHash}.svg`))
            process.stdout.write('+')
            fileLocations[ipfsHash].s3 = true
        }
        if (!storages.ipfs) {
            const uploaded = await ipfsWrapper.addFile(readLocal(`${ipfsHash}.svg`))
            await ipfsWrapper.pinFile(uploaded.path)
            if (uploaded.path !== ipfsHash) console.log(uploaded.path, ipfsHash)
            process.stdout.write('*')
            fileLocations[ipfsHash].ipfs = true
        }
        if (!storages.ipfsPin) {
            process.stdout.write('p')
            await ipfsWrapper.pinFile(ipfsHash)
        }
    };

    for (const [ipfsHash, storages] of Object.entries(fileLocations)) {
        if (isIPFS.multihash(ipfsHash)) {
            const hasLocal = await downloadToLocal(ipfsHash, storages);
            if (hasLocal) await uploadToRemote(ipfsHash, storages);
        }
    }
};

storage.compileFileList = async () => {
    const fileLocations = {};

    let isTruncated = true;
    let marker;
    while (isTruncated) {
        let params = {Bucket: process.env.S3_BUCKET};
        if (marker) params.Marker = marker;
        const response = await client.listObjects(params).promise();
        response.Contents.forEach(remoteFile => {
            const [ipfsHash] = remoteFile.Key.split('.');
            fileLocations[ipfsHash] = {s3: true}
        });
        isTruncated = response.IsTruncated
        if (isTruncated) marker = response.Contents.slice(-1)[0].Key;
    }

    const localFiles = fs.readdirSync(path.join(__dirname, `../data/backup`));
    localFiles.forEach(localFile => {
        const [ipfsHash] = localFile.split('.');
        if (fileLocations[ipfsHash] !== undefined) fileLocations[ipfsHash].local = true
        else fileLocations[ipfsHash] = {local: true}
    });

    await blockchain.init();
    await blockchain.auctionSlots().then(slots => {
        slots.forEach(slot => {
            slot.successful_bids.forEach(bid => {
                if (fileLocations[bid.data.artwork_reference] !== undefined) fileLocations[bid.data.artwork_reference].contract = true
                else fileLocations[bid.data.artwork_reference] = {contract: true}
            })
        })
    })

    const fileLocationsOnlyContract = Object.fromEntries(Object.entries(fileLocations).filter(([_, value]) => value.contract));

    const ipfsPins = await ipfsWrapper.pinList();
    console.log('downloaded ipfs pin list', ipfsPins.length);
    for (const ipfsHash of Object.keys(fileLocationsOnlyContract)) {
        fileLocationsOnlyContract[ipfsHash].ipfs = await ipfsWrapper.checkFileExists(ipfsHash);
        fileLocationsOnlyContract[ipfsHash].ipfsPin = ipfsPins.includes(ipfsHash);
        if (!fileLocationsOnlyContract[ipfsHash].ipfs) console.log('missing in ipfs:', ipfsHash)
    }

    return fileLocationsOnlyContract
};

storage.backupSVG = async (ipfsHash, svgFileBuffer) => {
    try {
        backupLocal(`${ipfsHash}.svg`, svgFileBuffer);
        await backupRemote(`${ipfsHash}.svg`, svgFileBuffer);
    } catch (e) {
        console.error(`${ipfsHash}.svg upload failed with:`, e);
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
    return client.putObject({
        Body: file,
        Bucket: process.env.S3_BUCKET,
        Key: remoteName
    }).promise();
};

const backupLocal = (fileName, file) => {
    fs.writeFileSync(path.join(__dirname, `../data/backup/${fileName}`), file);
};

const readLocal = (fileName) => {
    return fs.readFileSync(path.join(__dirname, `../data/backup/${fileName}`), 'utf-8');
};

module.exports = storage;
