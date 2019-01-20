const {EpochChain, EpochContract} = require('@aeternity/aepp-sdk');
const Util = require('./blockchain_util');
const blockchain = {};

// can eventually be called by name in the future
const contractAddress = 'ct_2uts19NsCspRABkuXZEAxxqqJzj7q43KJu2iRa8AcMHwPQUCGY';

let client = null;

const aeternityUrl = process.env.AETERNITY_URL || 'localhost';

blockchain.init = async () => {
    client = await EpochChain.compose(EpochContract)({
        url: `http://${aeternityUrl}:3013`,
        internalUrl: `http://${aeternityUrl}:3113`,
    }).catch(console.error);

    console.log('initialized aeternity sdk');
    return client;
};

blockchain.height = async () => {
    if (!client) await blockchain.init();
    return await client.height().catch(console.error);
};

blockchain.auctionSlot = async () => {
    if (!client) await blockchain.init();

    const calledAuctionSlot = await client.contractEpochCall(contractAddress, 'sophia-address', 'get_auction_slot', '(1)').catch(console.error);
    const decodedAuctionSlot = await client.contractEpochDecodeData(Util.auctionSlotType, calledAuctionSlot.out).catch(console.error);

    return Util.auctionSlotToObject(decodedAuctionSlot);
};

module.exports = blockchain;
