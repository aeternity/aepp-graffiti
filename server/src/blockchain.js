const {ChainNode, ContractNodeAPI} = require('@aeternity/aepp-sdk');
const Util = require('./util/blockchain_util');
const TeaserUtil = require('./util/blockchain_teaser_utils');
const blockchain = {};

// can eventually be called by name in the future
const contractAddress = 'ct_2P2vEqq3WQz6kzKLJFoqBbm46EMot64WvpP1xpvvANApLWcwnt';
const teaserContractAddress = 'ct_2ccJZsoN5D4iWuueX7k4HSTt3QxBGATqzRo1GfeGj2A5GHCTHr';

let client = null;
let mainnetClient = null;

const aeternityUrl = process.env.AETERNITY_URL || 'http://localhost:3013';
const aeternityInternalUrl = process.env.AETERNITY_URL || 'http://localhost:3113';

blockchain.init = async () => {
    client = await ChainNode.compose(ContractNodeAPI)({
        url: aeternityUrl,
        internalUrl: aeternityInternalUrl,
    }).catch(console.error);

    mainnetClient = await ChainNode.compose(ContractNodeAPI)({
        url: "https://ae.piwo.app",
        internalUrl:  "https://ae.piwo.app",
    }).catch(console.error);

    console.log('initialized aeternity sdk');
    return client;
};

blockchain.height = async () => {
    if (!client) await blockchain.init();
    return await client.height().catch(console.error);
};

blockchain.getMetaData = async () => {
    if (!client) await blockchain.init();

    const called = await client.contractNodeCall(contractAddress, 'sophia-address', 'get_auction_metadata', '()').catch(console.error);
    const decoded = await client.contractNodeDecodeData(Util.auctionMetaDataType, called.out).catch(console.error);

    return Util.auctionMetaDataToObject(decoded);
};

blockchain.auctionSlots = async () => {
    if (!client) await blockchain.init();

    const called = await client.contractNodeCall(contractAddress, 'sophia-address', 'all_auction_slots', '()').catch(console.error);
    const decoded = await client.contractNodeDecodeData(Util.auctionSlotListType, called.out).catch(console.error);

    return Util.auctionSlotListToObject(decoded);
};

blockchain.teaserArtworks = async () => {
    if (!mainnetClient) await blockchain.init();

    const called = await mainnetClient.contractNodeCall(teaserContractAddress, 'sophia-address', 'all_artworks', '()').catch(console.error);
    const decoded = await mainnetClient.contractNodeDecodeData(TeaserUtil.artworkListType, called.out).catch(console.error);

    return TeaserUtil.artworkListToObject(decoded);
};

blockchain.teaserGeolocation = async () => {
    if (!mainnetClient) await blockchain.init();

    const called = await mainnetClient.contractNodeCall(teaserContractAddress, 'sophia-address', 'get_geolocation', '()').catch(console.error);
    const decoded = await mainnetClient.contractNodeDecodeData(TeaserUtil.geolocationType, called.out).catch(console.error);

    return TeaserUtil.geolocationToObject(decoded);
};

blockchain.teaserContractAddress = teaserContractAddress;

module.exports = blockchain;
