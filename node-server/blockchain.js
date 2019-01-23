const {EpochChain, EpochContract} = require('@aeternity/aepp-sdk');
const Util = require('./blockchain_util');
const blockchain = {};

// can eventually be called by name in the future
const contractAddress = 'ct_2U9MkZK9JXTUemAURfCd8BDQZcXK4Gk8Hwfqxf1ASSYNrQnhjz';

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

blockchain.auctionSlots = async () => {
    if (!client) await blockchain.init();

    const calledAuctionSlots = await client.contractEpochCall(contractAddress, 'sophia-address', 'all_auction_slots', '()').catch(console.error);
    const decodedAuctionSlots = await client.contractEpochDecodeData(Util.auctionSlotListType, calledAuctionSlots.out).catch(console.error);

    return Util.auctionSlotListToObject(decodedAuctionSlots);
};

module.exports = blockchain;
