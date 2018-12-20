const ipfsClient = require('ipfs-http-client');
const Buffer = require('buffer').Buffer;

const ipfsWrap = {};

ipfsWrap.node = null;

ipfsWrap.init = () => {

    ipfsWrap.node = ipfsClient({
        host: 'ipfs.infura.io',
        protocol: 'https',
    });

    return ipfsWrap;
};


ipfsWrap.writeFile = (buffer) => {

    return ipfsWrap.node.add({
        content: buffer
    });
};

// DEBUG WITH QmQjqVu5qsd4PPqJnTcLXmvznMw7X2UEjtLP9NKCtwWMx3
ipfsWrap.getFile = async (hash) => {

    return Buffer.from(await ipfsWrap.node.cat(hash));

};

module.exports = ipfsWrap.init();