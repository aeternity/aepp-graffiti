const Ae = require('@aeternity/aepp-sdk').Universal;
const Crypto = require('@aeternity/aepp-sdk').Crypto;

const config = {
    host: 'http://localhost:3001/',
    internalHost: 'http://localhost:3001/internal/',
    compilerUrl: 'http://localhost:3081'
};

describe('DroneGraffitiAuction', () => {

    let owner, contract, publicKey, openHeight;


    before(async () => {
        const ownerKeyPair = wallets[0];
        owner = await Ae({
            url: config.host,
            internalUrl: config.internalHost,
            keypair: ownerKeyPair,
            nativeMode: true,
            networkId: 'ae_devnet',
            compilerUrl: config.compilerUrl
        });

        publicKey = wallets[0].publicKey;
    });

    it('Deploying DroneGraffitiAuction Contract; initialize', async () => {
        let contractSource = utils.readFileRelative('./contracts/DroneGraffitiAuction.aes', "utf-8"); // Read the aes file

        contract = await owner.getContractInstance(contractSource);
        const deploy = await contract.deploy(['0.000000,-0.000000', 3300, 5000]);
        assert.equal(deploy.result.returnType, 'ok');
    });

    it('Static Call and Decode DroneGraffitiAuction Contract; get_auction_metadata', async () => {
        const auctionSlot = await contract.methods.get_auction_metadata();

        assert.equal(auctionSlot.decodedResult.geolocation, "0.000000,-0.000000");
        assert.equal(auctionSlot.decodedResult.canvas_width, 3300);
        assert.equal(auctionSlot.decodedResult.canvas_height, 5000);
    });

    it('Call DroneGraffitiAuction Contract; add_auction_slot', async () => {
        openHeight = (await owner.height()) + 5;

        const callAddAuction = await contract.methods.add_auction_slot(100, openHeight, openHeight + 200, 1, 100);
        const callAddSecondAuction = await contract.methods.add_auction_slot(100, openHeight, openHeight + 25, 1, 100);

        assert.isTrue(!!callAddAuction, 'Could not call the DroneGraffitiAuction add auction slot');
        assert.isTrue(!!callAddSecondAuction, 'Could not call the DroneGraffitiAuction add auction slot');
    });

    it('Static Call and Decode DroneGraffitiAuction Contract; get_auction_slot', async () => {
        const auctionSlot = await contract.methods.get_auction_slot(1);

        assert.equal(auctionSlot.decodedResult.id, 1);
        assert.equal(auctionSlot.decodedResult.time_capacity, 100);
        assert.equal(auctionSlot.decodedResult.minimum_time_per_bid, 1);
        assert.equal(auctionSlot.decodedResult.maximum_time_per_bid, 100);
        assert.isEmpty(auctionSlot.decodedResult.successful_bids);
        assert.isEmpty(auctionSlot.decodedResult.failed_bids);
        assert.isNumber(auctionSlot.decodedResult.start_block_height);
        assert.isNumber(auctionSlot.decodedResult.end_block_height);
    });

    it('Static Call and Decode DroneGraffitiAuction Contract; all_auction_slots', async () => {
        const auctionSlot = await contract.methods.all_auction_slots();

        assert.equal(auctionSlot.decodedResult[0].id, 1);
        assert.equal(auctionSlot.decodedResult[0].time_capacity, 100);
        assert.equal(auctionSlot.decodedResult[0].minimum_time_per_bid, 1);
        assert.equal(auctionSlot.decodedResult[0].maximum_time_per_bid, 100);
        assert.isEmpty(auctionSlot.decodedResult[0].successful_bids);
        assert.isEmpty(auctionSlot.decodedResult[0].failed_bids);
        assert.isNumber(auctionSlot.decodedResult[0].start_block_height);
        assert.isNumber(auctionSlot.decodedResult[0].end_block_height);
    });

    it('Call DroneGraffitiAuction Contract; place_bid', async () => {
        await owner.awaitHeight(await owner.height() + 5);
        const amount = 10000;
        const auctionSlot = await contract.methods.place_bid(1, 20, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40, {amount: amount});

        assert.equal(auctionSlot.decodedResult.successful_bids.length, 1);
        assert.equal(auctionSlot.decodedResult.successful_bids[0].seq_id, 1);
        assert.equal(auctionSlot.decodedResult.successful_bids[0].user, publicKey);
        assert.equal(auctionSlot.decodedResult.successful_bids[0].amount, amount);
        assert.equal(auctionSlot.decodedResult.successful_bids[0].time, 20);
        assert.equal(auctionSlot.decodedResult.successful_bids[0].data.artwork_reference, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd");
        assert.equal(auctionSlot.decodedResult.successful_bids[0].data.coordinates.x, 30);
        assert.equal(auctionSlot.decodedResult.successful_bids[0].data.coordinates.y, 40);
        assert.isEmpty(auctionSlot.decodedResult.failed_bids);
    });

    it('Call DroneGraffitiAuction Contract; admin_withdraw_to_admin', async () => {
        const withdraw = await contract.methods.admin_withdraw_to_admin();
        assert.equal(withdraw.decodedResult, 0);
    });

    it('Call DroneGraffitiAuction Contract; place multiple bid', async () => {
        await contract.methods.place_bid(1, 30, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40,{amount: 5000});
        await contract.methods.place_bid(1, 20, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40, {amount: 20000});

        const auctionSlot = await contract.methods.place_bid(1, 50, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40, {amount: 12000});

        assert.equal(auctionSlot.decodedResult.successful_bids.length, 3);
        assert.equal(auctionSlot.decodedResult.failed_bids.length, 1);
        assert.equal(auctionSlot.decodedResult.failed_bids[0].seq_id, 2);
        assert.equal(auctionSlot.decodedResult.failed_bids[0].amount, 5000);
        assert.equal(auctionSlot.decodedResult.failed_bids[0].time, 30);

        await contract.methods.place_bid(1, 10, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40,{amount: 5000});
        const auctionSlot2 = await contract.methods.place_bid(1, 10, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40, {amount: 4000});

        assert.equal(auctionSlot2.decodedResult.successful_bids.length, 4);
        assert.equal(auctionSlot2.decodedResult.failed_bids.length, 2);

        const contractBalance = await owner.balance(contract.deployInfo.address);
        const successfulAmount = auctionSlot2.decodedResult.successful_bids.map(bid => parseInt(bid.amount)).reduce((x, y) => x + y, 0);
        assert.equal(successfulAmount, contractBalance);
    });

    it('Call DroneGraffitiAuction Contract; place lots of bid', async () => {
        await contract.methods.place_bid(2, 30, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40, {amount: 5000});
        await contract.methods.place_bid(2, 30, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40, {amount: 5000});
        await contract.methods.place_bid(1, 20, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40, {amount: 20000});
        await contract.methods.place_bid(1, 50, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40, {amount: 12000});
        await contract.methods.place_bid(1, 20, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40, {amount: 20000});
        await contract.methods.place_bid(1, 50, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40, {amount: 12000});
        await contract.methods.place_bid(1, 30, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40, {amount: 5000});
        await contract.methods.place_bid(1, 20, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40, {amount: 20000});
        await contract.methods.place_bid(1, 50, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40, {amount: 12000});
        await contract.methods.place_bid(1, 30, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40, {amount: 5000});
        await contract.methods.place_bid(1, 20, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40, {amount: 20000});
        await contract.methods.place_bid(1, 50, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40, {amount: 12000});
    });

    it('Call DroneGraffitiAuction Contract; admin_withdraw_to_address closed slot', async () => {
        await owner.awaitHeight(openHeight + 25);
        const toAddress = Crypto.generateKeyPair().publicKey;

        const withdraw = await contract.methods.admin_withdraw_to_address(toAddress, {amount: 0});

        assert.equal(withdraw.decodedResult, 5000 + 5000);
        assert.equal(await owner.balance(toAddress), 5000 + 5000);
    });
});
