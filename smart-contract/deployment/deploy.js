const Ae = require('@aeternity/aepp-sdk').Universal;
const Deployer = require('forgae').Deployer;
const gasLimit = 1000000;
//const Utils = require('../deployment/auctionUtils');

const deploy = async (network, privateKey) => {
    let deployer = new Deployer(network, privateKey);

    let result = await deployer.deploy("./contracts/DroneGraffitiAuction.aes");

    /*
    let contract = await deployer.deploy("./contracts/DroneGraffitiAuction.aes", gasLimit, '("0.000000,-0.000000", 3300, 5000)');

    await contract.call('add_auction_slot', {
        args: `(1000, 0, 2, 1, 500)`,
        options: {amount: 0}
    }).catch(console.error);


    const staticCallAuctionSlots = await contract.callStatic('all_auction_slots', {args: '()'});
    const decodedAuctionSlots = await staticCallAuctionSlots.decode(Utils.auctionSlotListType);

    const auctionSlots = Utils.auctionSlotListToObject(decodedAuctionSlots);

    console.log(contract);
    console.log(auctionSlots);
    */
};

module.exports = {
    deploy
};
