const fs = require('fs');

const {Universal, Node} = require('@aeternity/aepp-sdk');
const blockchain = {};

const contractSource = fs.readFileSync('./src/GraffitiAuction.aes', 'utf-8');

let client = null;
let contract = null;
let tempCallOptions = { gas: 100000000000 };

blockchain.init = async () => {

    if (!process.env.AETERNITY_URL) throw "AETERNITY_URL is not set";
    if (!process.env.CONTRACT_ADDRESS) throw "CONTRACT_ADDRESS is not set";
    if (!process.env.COMPILER_URL) throw "COMPILER_URL is not set";

    client = await Universal({
        nodes: [
            {
                name: 'node',
                instance: await Node({
                    url: process.env.AETERNITY_URL,
                }),
            }],
        compilerUrl: process.env.COMPILER_URL,
    }).catch(console.error);

    contract = await client.getContractInstance(contractSource, {contractAddress: process.env.CONTRACT_ADDRESS});
    client.api.protectedDryRunTxs = client.api.dryRunTxs;

    console.log('initialized aeternity sdk');
    return client;
};

blockchain.height = async () => {
    if (!client) await blockchain.init();
    return await client.height().catch(console.error);
};

blockchain.getMetaData = async () => {
    if (!client) await blockchain.init();

    const response = await contract.methods.get_auction_metadata(tempCallOptions).catch(console.error);
    return response.decodedResult
};

blockchain.auctionSlots = async () => {
    if (!client) await blockchain.init();

    const response = await contract.methods.all_auction_slots(tempCallOptions).catch(console.error);
    return response.decodedResult;
};

module.exports = blockchain;
