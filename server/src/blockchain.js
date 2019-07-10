const fs = require('fs');

const { Universal: Ae, Crypto } = require('@aeternity/aepp-sdk')
const blockchain = {};

// can eventually be called by name in the future
const contractAddress = 'ct_ycM9PMNRCg6tvaZTvtrYBpVrsahtCgLoNhiZL9UVUBxJ3wWiQ' // 'ct_2P2vEqq3WQz6kzKLJFoqBbm46EMot64WvpP1xpvvANApLWcwnt';
const teaserContractAddress = 'ct_2ccJZsoN5D4iWuueX7k4HSTt3QxBGATqzRo1GfeGj2A5GHCTHr';
const contractSource = fs.readFileSync('./src/DroneGraffitiAuction.aes', 'utf-8');
const teaserContractSource = fs.readFileSync('./src/DroneGraffitiAuction.aes', 'utf-8');


let client = null;
let testnetContract = null;
let mainnetClient = null;
let mainnetContract = null;

const aeternityUrl = process.env.AETERNITY_URL || 'http://localhost:3013';
const aeternityInternalUrl = process.env.AETERNITY_URL || 'http://localhost:3113';

blockchain.init = async () => {

    const keypair = Crypto.generateKeyPair()

    client = await Ae({
        url: aeternityUrl,
        internalUrl: aeternityInternalUrl,
        compilerUrl: 'https://compiler.aepps.com',
        networkId: 'ae_uat',
        keypair: keypair
    }).catch(console.error);

    testnetContract = await client.getContractInstance(contractSource, {contractAddress})

    mainnetClient = await Ae({
        url: "https://ae.piwo.app",
        internalUrl:  "https://ae.piwo.app",
        compilerUrl: 'https://compiler.aepps.com',
        keypair: keypair
    }).catch(console.error);

    mainnetContract = await mainnetClient.getContractInstance(teaserContractSource, {contractAddress: teaserContractAddress})

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

blockchain.teaserArtworks = async () => {
    if (!mainnetClient) await blockchain.init();

    const response = await mainnetContract.methods.all_artworks().catch(console.error);

    return response.decodedResult
};

blockchain.teaserGeolocation = async () => {
    if (!mainnetClient) await blockchain.init();

    const response = await mainnetContract.methods.get_geolocation().catch(console.error);

    return response.decodedResult;
};

blockchain.teaserContractAddress = teaserContractAddress;

module.exports = blockchain;
