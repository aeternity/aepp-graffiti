const {EpochChain, EpochContract} = require('@aeternity/aepp-sdk');

const blockchain = {};

// can eventually be called by name in the future
const contractAddress = 'ct_UPBs1P3YZfmhjcvHbKeanPLEgVpQrXVty6RCGN8MvaaU8KwSb';

let client = null;

// serialized contract decoded data to readable js object
function bidListToObject(bidList) {
    return bidList.value.map(bid => {
        return {
            userHash: bid.value[0].value,
            hash: bid.value[1].value,
            coordinates: {
                x: bid.value[2].value[0].value,
                y: bid.value[2].value[1].value
            },
            droneTime: bid.value[3].value,
            amount: bid.value[4].value
        }
    })
}

// Key-Pair should not be necessary in the future
blockchain.init = async () => {
    client = await EpochChain.compose(EpochContract)({
        url: 'https://sdk-testnet.aepps.com',
        internalUrl: 'https://sdk-testnet.aepps.com',
    });

    return client;
};

blockchain.height = async () => {
    if (!client) await blockchain.init();
    return await client.height();
};

blockchain.allBids = async () => {
    if (!client) await blockchain.init();

    const calledAllBids = await client.contractEpochCall(contractAddress, 'sophia-address', 'all_bids', '()').catch(e => console.error(e));
    const decodedAllBids = await client.contractEpochDecodeData('list((address, string, (int, int), int, int))', calledAllBids.out).catch(e => console.error(e));

    return bidListToObject(decodedAllBids);
};


module.exports = blockchain;
