const ipfsClient = require('ipfs-http-client');
const Buffer = require('buffer').Buffer;

const ipfsWrap = {};

let node = null;

ipfsWrap.init = () => {
    node = ipfsClient({ host: process.env.IPFS_URL || 'localhost', port: '5001', protocol: 'http' });
};

ipfsWrap.writeFile = (buffer) => {
    if(!node) ipfsWrap.init();
    return node.add({
        content: buffer
    });
};

// DEBUG WITH QmQjqVu5qsd4PPqJnTcLXmvznMw7X2UEjtLP9NKCtwWMx3
// TODO abort if file can't be found
ipfsWrap.getFile = async (hash) => {
    if(!node) ipfsWrap.init();
    const data = await node.cat(hash);
    if(data.length > 0) {
        return Buffer.from(data);
    } else {
        throw Error(`IPFS: ${hash} not found`);
    }
};

module.exports = ipfsWrap;
