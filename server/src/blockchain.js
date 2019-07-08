const fs = require('fs');

const { Universal: Ae, Crypto } = require('@aeternity/aepp-sdk')
const TeaserUtil = require('./util/blockchain_teaser_utils');
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

    const keypair = {
        publicKey: 'ak_bBMiVbnLqtjSv9zvTm2gjCKMd3Y8aejfP2568ji4MyuZe2t8K',
        secretKey: 'd9ea0caece7cf75a8d125b6e72e889e241156573848d5318435c2b9c7daab6014d9b4bfed393c9f27c01d71963f5e0a7893e8be0a80e5ac8b0806dd01795d23b'
    }

    client = await Ae({
        url: aeternityUrl,
        internalUrl: aeternityInternalUrl,
        compilerUrl: 'https://compiler.aepps.com',
        networkId: 'ae_uat',
        keypair: keypair
    }).catch(console.error);

    testnetContract = await client.getContractInstance(contractSource, {contractAddress})
    //await testnetContract.methods.init('yomama', 3300, 5000)

    //await testnetContract.methods.add_auction_slot(1000, 106523, 108517, 5, 500)

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

    //const response = await testnetContract.call('all_auction_slots').catch(console.error);
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
