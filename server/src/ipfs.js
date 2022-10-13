const { create } = require('ipfs-http-client');
const isIPFS = require('is-ipfs');

class IPFS {

    node;

    constructor() {
        if (!process.env.IPFS_URL) throw "IPFS_URL is not set";
        this.node = create(process.env.IPFS_URL);
    }

    id = async () => {
        return this.node.id();
    }

    asyncGeneratorToArray = async (generator) => {
        const all = [];
        for await (const result of generator) {
            all.push(result);
        }
        return all;
    };

    checkFileExists = async (hash) => {
        if (!isIPFS.multihash(hash)) return false;
        const result = await Promise.race([
            this.node.files.stat(`/ipfs/${hash}`),
            new Promise((resolve) => {
                setTimeout(() => {
                    resolve(null);
                }, 1000);
            })
        ]);
        if(!result) return false;
        return result.cid.toString() === hash;
    };

    addFile = async (buffer) => {
        return this.node.add({
            content: buffer,
        });
    };

    pinFile = (hash) => {
        return Promise.race([
            this.node.pin.add(hash),
            new Promise((resolve) => {
                setTimeout(() => {
                    resolve(null);
                }, 1000);
            })
        ]);
    };

    pinList = async () => {
        const pins = await this.asyncGeneratorToArray(this.node.pin.ls());
        return pins.map(pin => pin.cid.toString());
    }

    getFile = async (hash) => {
        if (await ipfs.checkFileExists(hash)) {
            const data = await this.asyncGeneratorToArray(this.node.cat(hash));
            return Buffer.concat(data);
        }

        throw Error(`IPFS: ${hash} not found`);
    };
}

const ipfs = new IPFS();
module.exports = ipfs;
