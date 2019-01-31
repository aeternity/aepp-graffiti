const {EpochChain, EpochContract} = require('@aeternity/aepp-sdk');
const Util = require('./util/blockchain_util');
const TeaserUtil = require('./util/blockchain_teaser_utils');
const blockchain = {};

// can eventually be called by name in the future
const contractAddress = 'ct_2U9MkZK9JXTUemAURfCd8BDQZcXK4Gk8Hwfqxf1ASSYNrQnhjz';
const teaserContractAddress = 'ct_Fk3wWdC7t6Fv5eypLWThND19CGn1cBuScnGBZx6r6tG9q1DbU';

let client = null;

const aeternityUrl = process.env.AETERNITY_URL || 'http://localhost:3013';
const aeternityInternalUrl = process.env.AETERNITY_URL || 'http://localhost:3113';

blockchain.init = async () => {
    client = await EpochChain.compose(EpochContract)({
        url: aeternityUrl,
        internalUrl: aeternityInternalUrl,
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

    const called = await client.contractEpochCall(contractAddress, 'sophia-address', 'all_auction_slots', '()').catch(console.error);
    const decoded = await client.contractEpochDecodeData(Util.auctionSlotListType, called.out).catch(console.error);

    return Util.auctionSlotListToObject(decoded);
};

blockchain.teaserArtworks = async () => {
    if (!client) await blockchain.init();

    const called = await client.contractEpochCall(teaserContractAddress, 'sophia-address', 'all_artworks', '()').catch(console.error);
    const decoded = await client.contractEpochDecodeData(TeaserUtil.artworkListType, called.out).catch(console.error);

    return TeaserUtil.artworkListToObject(decoded);
};

blockchain.teaserGeolocation = async () => {
    if (!client) await blockchain.init();

    const called = await client.contractEpochCall(teaserContractAddress, 'sophia-address', 'get_geolocation', '()').catch(console.error);
    const decoded = await client.contractEpochDecodeData(TeaserUtil.geolocationType, called.out).catch(console.error);

    return TeaserUtil.geolocationToObject(decoded);
};

blockchain.teaserContractAddress = teaserContractAddress;

module.exports = blockchain;
