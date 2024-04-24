const {Node, AeSdk} = require('@aeternity/aepp-sdk');
const blockchain = {};

const contractAci = require('./GraffitiAuctionACI.json');

let client = null;
let contract = null;
let tempCallOptions = {gas: 100000000000};

blockchain.init = async () => {
    if (!contract || !client) {
        if (!process.env.CONTRACT_ADDRESS) throw "CONTRACT_ADDRESS is not set";
        if (!process.env.NODE_URL) throw "NODE_URL is not set";

        client = new AeSdk({
            nodes: [{
                name: 'node', instance: new Node(process.env.NODE_URL),
            }],
        });

        contract = await client.initializeContract({
            aci: contractAci, address: process.env.CONTRACT_ADDRESS
        });

        console.log('initialized aeternity sdk');
    }
    return client;
};

blockchain.height = async () => {
    if (!client) await blockchain.init();
    return await client.getHeight().catch(console.error);
};

blockchain.getMetaData = async () => {
    if (!client) await blockchain.init();

    const response = await contract.get_auction_metadata(tempCallOptions).catch(console.error);
    return response.decodedResult
};

blockchain.auctionSlots = async () => {
    if (!client) await blockchain.init();

    const response = await contract.all_auction_slots(tempCallOptions).catch(console.error);
    return response.decodedResult;
};

module.exports = blockchain;
