const fs = require('fs');

const {Universal: Ae} = require('@aeternity/aepp-sdk');
const blockchain = {};

const contractSource = fs.readFileSync('./src/GraffitiAuction.aes', 'utf-8');

let client = null;
let contract = null;

blockchain.init = async () => {

    if (!process.env.AETERNITY_URL) throw "AETERNITY_URL is not set";
    if (!process.env.CONTRACT_ADDRESS) throw "CONTRACT_ADDRESS is not set";

    client = await Ae({
        url: process.env.AETERNITY_URL,
        internalUrl: process.env.AETERNITY_URL,
        compilerUrl: "https://compiler.aepps.com",
    }).catch(console.error);

    contract = await client.getContractInstance(contractSource, {contractAddress: process.env.CONTRACT_ADDRESS});

    console.log('initialized aeternity sdk');
    return client;
};

blockchain.height = async () => {
    if (!client) await blockchain.init();
    return await client.height().catch(console.error);
};

blockchain.getMetaData = async () => {
    if (!client) await blockchain.init();

    const response = await contract.methods.get_auction_metadata().catch(console.error);
    return response.decodedResult
};

blockchain.auctionSlots = async () => {
    if (!client) await blockchain.init();

    const response = await contract.methods.all_auction_slots().catch(console.error);
    return response.decodedResult;
};

module.exports = blockchain;
