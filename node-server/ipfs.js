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
ipfsWrap.getFile = async (hash) => {
    if(!node) ipfsWrap.init();
    try {
        const data = await node.cat(hash);
        return Buffer.from(data);
    } catch (e) {
        console.error('ipfs cat', e.message, hash);
    }
};

module.exports = ipfsWrap;
