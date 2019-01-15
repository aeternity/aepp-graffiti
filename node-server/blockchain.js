const {EpochChain, EpochContract} = require('@aeternity/aepp-sdk');
const Util = require('./blockchain_util');
const blockchain = {};

// can eventually be called by name in the future
const contractAddress = 'ct_2aLiBbVqAgdzVEhpmjqW33cCmJkkQAWDayEQsFkrkt6AyY2HPG';

let client = null;

blockchain.init = async () => {
    try {
        client = await EpochChain.compose(EpochContract)({
            url: 'http://localhost:3013',
            internalUrl: 'http://localhost:3113',
        });
    } catch (e) {
        console.log(e);
    }

    console.log('initialized aeternity sdk');
    return client;
};

blockchain.height = async () => {
    if (!client) await blockchain.init();
    return await client.height();
};

blockchain.auctionSlot = async () => {
    if (!client) await blockchain.init();

    const calledAuctionSlot = await client.contractEpochCall(contractAddress, 'sophia-address', 'get_auction_slot', '(1)').catch(e => console.error(e));
    const decodedAuctionSlot = await client.contractEpochDecodeData(Util.auctionSlotType, calledAuctionSlot.out).catch(e => console.error(e));

    return Util.auctionSlotToObject(decodedAuctionSlot);
};

module.exports = blockchain;
