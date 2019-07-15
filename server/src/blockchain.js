const fs = require('fs');

const {Universal: Ae, Crypto} = require('@aeternity/aepp-sdk');
const blockchain = {};

// can eventually be called by name in the future
const contractAddress = 'ct_ycM9PMNRCg6tvaZTvtrYBpVrsahtCgLoNhiZL9UVUBxJ3wWiQ'; // 'ct_2P2vEqq3WQz6kzKLJFoqBbm46EMot64WvpP1xpvvANApLWcwnt';
const contractSource = fs.readFileSync('./src/DroneGraffitiAuction.aes', 'utf-8');


let client = null;
let testnetContract = null;

const aeternityUrl = process.env.AETERNITY_URL || 'http://localhost:3013';
const aeternityInternalUrl = process.env.AETERNITY_URL || 'http://localhost:3113';

blockchain.init = async () => {

    const keypair = {
        publicKey: "ak_11111111111111111111111111111111273Yts",
        secretKey: ""
    };

    client = await Ae({
        url: aeternityUrl,
        internalUrl: aeternityInternalUrl,
        compilerUrl: "https://compiler.aepps.com",
        networkId: 'ae_uat',
        keypair: keypair
    }).catch(console.error);

    testnetContract = await client.getContractInstance(contractSource, {contractAddress})

    console.log('initialized aeternity sdk');
    return client;
};

blockchain.height = async () => {
    if (!client) await blockchain.init();
    return await client.height().catch(console.error);
};

blockchain.getMetaData = async () => {
    if (!client) await blockchain.init();

    const response = await testnetContract.methods.get_auction_metadata().catch(console.error);
    return response.decodedResult
};

blockchain.auctionSlots = async () => {
    if (!client) await blockchain.init();

    const response = await testnetContract.methods.all_auction_slots().catch(console.error);

    return response.decodedResult;
};

module.exports = blockchain;
