const {utils, wallets} = require("@aeternity/aeproject");
const {generateKeyPair} = require("@aeternity/aepp-sdk");
const chaiAsPromised = require("chai-as-promised");
const { assert } = require("chai");
const chai = require("chai");

chai.use(chaiAsPromised);

describe('GraffitiAuction', () => {

    let owner, contract, openHeight, closeHeight;

    before(async () => {
        owner = utils.getSdk()
    });

    it('Deploying GraffitiAuction Contract; initialize', async () => {
        let contractSource = utils.getContractContent('./contracts/GraffitiAuction.aes');

        contract = await owner.initializeContract({sourceCode: contractSource});
        const deploy = await contract.init('0.000000,-0.000000', 3300, 5000);
        assert.equal(deploy.result.returnType, 'ok');
    });

    it('Static Call and Decode GraffitiAuction Contract; get_auction_metadata', async () => {
        const auctionSlot = await contract.get_auction_metadata();

        assert.equal(auctionSlot.decodedResult.geolocation, "0.000000,-0.000000");
        assert.equal(auctionSlot.decodedResult.canvas_width, 3300n);
        assert.equal(auctionSlot.decodedResult.canvas_height, 5000n);
    });

    it('Call GraffitiAuction Contract; add_auction_slot', async () => {
        openHeight = (await owner.getHeight()) + 10;
        closeHeight = openHeight + 50

        const addAuction = await contract.add_auction_slot(100, openHeight, closeHeight + 200, 1, 100);
        const addSecondAuction = await contract.add_auction_slot(100, openHeight, closeHeight, 1, 100);

        assert.equal(addAuction.result.returnType, 'ok');
        assert.equal(addSecondAuction.result.returnType, 'ok');
    });

    it('Static Call and Decode GraffitiAuction Contract; get_auction_slot', async () => {
        const auctionSlot = await contract.get_auction_slot(1);

        assert.equal(auctionSlot.decodedResult.id, 1n);
        assert.equal(auctionSlot.decodedResult.time_capacity, 100n);
        assert.equal(auctionSlot.decodedResult.minimum_time_per_bid, 1n);
        assert.equal(auctionSlot.decodedResult.maximum_time_per_bid, 100n);
        assert.isEmpty(auctionSlot.decodedResult.successful_bids);
        assert.isEmpty(auctionSlot.decodedResult.failed_bids);
        assert.exists(auctionSlot.decodedResult.start_block_height);
        assert.exists(auctionSlot.decodedResult.end_block_height);
    });

    it('Static Call and Decode GraffitiAuction Contract; all_auction_slots', async () => {
        const auctionSlots = await contract.all_auction_slots();

        assert.equal(auctionSlots.decodedResult[0].id, 1n);
        assert.equal(auctionSlots.decodedResult[0].time_capacity, 100n);
        assert.equal(auctionSlots.decodedResult[0].minimum_time_per_bid, 1n);
        assert.equal(auctionSlots.decodedResult[0].maximum_time_per_bid, 100n);
        assert.isEmpty(auctionSlots.decodedResult[0].successful_bids);
        assert.isEmpty(auctionSlots.decodedResult[0].failed_bids);
        assert.exists(auctionSlots.decodedResult[0].start_block_height);
        assert.exists(auctionSlots.decodedResult[0].end_block_height);
    });

    it('Call GraffitiAuction Contract; place_bid', async () => {
        await utils.awaitKeyBlocks(owner, 10);
        const amount = 10000;
        const auctionSlot = await contract.place_bid(1, 20, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40, {amount: amount});

        assert.equal(auctionSlot.decodedResult.successful_bids.length, 1);
        assert.equal(auctionSlot.decodedResult.successful_bids[0].seq_id, 1n);
        assert.equal(auctionSlot.decodedResult.successful_bids[0].user, wallets[0].publicKey);
        assert.equal(auctionSlot.decodedResult.successful_bids[0].amount, amount);
        assert.equal(auctionSlot.decodedResult.successful_bids[0].time, 20n);
        assert.equal(auctionSlot.decodedResult.successful_bids[0].data.artwork_reference, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd");
        assert.equal(auctionSlot.decodedResult.successful_bids[0].data.coordinates.x, 30n);
        assert.equal(auctionSlot.decodedResult.successful_bids[0].data.coordinates.y, 40n);
        assert.isEmpty(auctionSlot.decodedResult.failed_bids);
    });

    it('Call GraffitiAuction Contract; admin_withdraw_to_admin', async () => {
        const withdraw = await contract.admin_withdraw_to_admin();
        assert.equal(withdraw.decodedResult, 0);
    });

    it('Call GraffitiAuction Contract; place multiple bid', async () => {
        await contract.place_bid(1, 30, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40, {amount: 5000});
        await contract.place_bid(1, 20, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40, {amount: 20000});

        const auctionSlot = await contract.place_bid(1, 50, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40, {amount: 12000});

        assert.equal(auctionSlot.decodedResult.successful_bids.length, 3);
        assert.equal(auctionSlot.decodedResult.failed_bids.length, 1);
        assert.equal(auctionSlot.decodedResult.failed_bids[0].seq_id, 2n);
        assert.equal(auctionSlot.decodedResult.failed_bids[0].amount, 5000n);
        assert.equal(auctionSlot.decodedResult.failed_bids[0].time, 30n);

        await contract.place_bid(1, 10, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40, {amount: 5000});
        const auctionSlot2 = await contract.place_bid(1, 10, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40, {amount: 4000});

        assert.equal(auctionSlot2.decodedResult.successful_bids.length, 4);
        assert.equal(auctionSlot2.decodedResult.failed_bids.length, 2);

        const contractBalance = await owner.getBalance(contract.$options.address);
        const successfulAmount = auctionSlot2.decodedResult.successful_bids.map(bid => parseInt(bid.amount)).reduce((x, y) => x + y, 0);
        assert.equal(successfulAmount, contractBalance);
    });

    it('Call GraffitiAuction Contract; place lots of bid', async () => {
        await contract.place_bid(2, 30, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40, {amount: 5000});
        await contract.place_bid(2, 30, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40, {amount: 5000});
        await contract.place_bid(1, 20, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40, {amount: 20000});
        await contract.place_bid(1, 50, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40, {amount: 12000});
        await contract.place_bid(1, 20, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40, {amount: 20000});
        await contract.place_bid(1, 50, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40, {amount: 12000});
        await contract.place_bid(1, 30, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40, {amount: 5000});
        await contract.place_bid(1, 20, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40, {amount: 20000});
        await contract.place_bid(1, 50, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40, {amount: 12000});
        await contract.place_bid(1, 30, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40, {amount: 5000});
        await contract.place_bid(1, 20, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40, {amount: 20000});
        await contract.place_bid(1, 50, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40, {amount: 12000});

        const auctionSlots = await contract.all_auction_slots();
        const bidsCount = auctionSlots.decodedResult.map(slot => slot.failed_bids.length + slot.successful_bids.length).reduce((x, y) => x + y, 0);
        assert.equal(bidsCount, 18);
    });

    it('Call GraffitiAuction Contract; admin_withdraw_to_address closed slot', async () => {
        const height =await owner.getHeight();
        await utils.awaitKeyBlocks(owner, closeHeight - height);

        const toAddress = generateKeyPair().publicKey;

        const withdraw = await contract.admin_withdraw_to_address(toAddress);

        assert.equal(withdraw.decodedResult, 5000 + 5000);
        assert.equal(await owner.getBalance(toAddress), 5000 + 5000);
    });
});
