const ipfsClient = require('ipfs-http-client');
const Buffer = require('buffer').Buffer;

const ipfsWrap = {};

let node = null;

ipfsWrap.init = () => {
    node = ipfsClient({ host: process.env.IPFS_URL || 'localhost', port: '5001', protocol: 'http' });
};

ipfsWrap.checkFileExists = async (hash) => {
    if (!node) ipfsWrap.init();
    const result = await Promise.race([
        node.files.stat(`/ipfs/${hash}`),
        new Promise((resolve) => {
            setTimeout(() => {
                resolve(null);
            }, 30000);
        })
    ]);

    if(!result || result.hash !== hash) console.warn(`IPFS ${hash} stats timed out`);

    return result.hash === hash;
};

ipfsWrap.writeFile = (buffer) => {
    if(!node) ipfsWrap.init();
    return node.add({
        content: buffer,

    });
};

ipfsWrap.pinFile = (hash) => {
    if(!node) ipfsWrap.init();
    return node.pin.add(hash);
};

ipfsWrap.id = () => {
    if(!node) ipfsWrap.init();
    return new Promise((resolve, reject) => {
        node.id((err, identity) => {
            if (err) {
                return reject(err)
            }
            resolve(identity)
        });
    })
};

ipfsWrap.getFile = async (hash) => {
    if(!node) ipfsWrap.init();
    if(await ipfsWrap.checkFileExists(hash)) {
        const data = await node.cat(hash);
        if(data.length > 0) {
            return Buffer.from(data);
        }
    }

    throw Error(`IPFS: ${hash} not found`);
};

module.exports = ipfsWrap;
