const Ae = require('@aeternity/aepp-sdk').Universal;
const Utils = require('../deployment/auctionUtils');

const config = {
    host: "http://localhost:3001/",
    internalHost: "http://localhost:3001/internal/",
    gas: 200000,
    ttl: 55
};

describe('DroneGraffitiAuction', () => {

    let owner;
    let contract;
    let publicKey;

    const decodeError = async (e) => {
        console.error(e);
        if(e.rawTx) console.error('decodeError', await owner.unpackAndVerify(e.rawTx));
        if(e.returnValue) console.error('decodedError', await owner.contractDecodeData('string', e.returnValue).catch(e => console.error(e)));
    };

    before(async () => {
        const ownerKeyPair = wallets[0];
        owner = await Ae({
            url: config.host,
            internalUrl: config.internalHost,
            keypair: ownerKeyPair,
            nativeMode: true,
            networkId: 'ae_devnet'
        });

        publicKey = wallets[0].publicKey;
    });

    it('Deploying DroneGraffitiAuction Contract; initialize', async () => {
        let contractSource = utils.readFileRelative('./contracts/DroneGraffitiAuction.aes', "utf-8"); // Read the aes file

        const compiledContract = await owner.contractCompile(contractSource, { // Compile it
            gas: config.gas
        }).catch(console.error);

        const deployPromise = compiledContract.deploy({ // Deploy it
            initState: '("0.000000,-0.000000", 3300, 5000)',
            options: {
                ttl: config.ttl,
                amount: 0,
                verify: true
            }
        }).catch(console.error);

        assert.isFulfilled(deployPromise, 'Could not deploy the DroneGraffitiAuction Contract'); // Check it is deployed
        contract = await deployPromise;
    });

    it('Static Call and Decode DroneGraffitiAuction Contract; get_auction_metadata', async () => {
        const staticCallAuctionSlot = await contract.callStatic('get_auction_metadata', {args: '()'});
        const decodedAuctionSlot = await staticCallAuctionSlot.decode(Utils.auctionMetaDataType);

        const auctionSlot = Utils.auctionMetaDataToObject(decodedAuctionSlot);
        assert.equal(auctionSlot.geolocation, "0.000000,-0.000000");
        assert.equal(auctionSlot.canvasWidth, 3300);
        assert.equal(auctionSlot.canvasHeight, 5000);
    });

    it('Call DroneGraffitiAuction Contract; add auction slot', async () => {
        const callAddAuction = await contract.call('add_auction_slot', {
            args: `(100, ${(await owner.height()) + 2}, 200, 1, 100)`,
            options: {amount: 0}
        }).catch(decodeError);
        assert.isTrue(!!callAddAuction, 'Could not call the DroneGraffitiAuction add auction slot');
    });

    it('Static Call and Decode DroneGraffitiAuction Contract; get_auction_slot', async () => {
        const staticCallAuctionSlot = await contract.callStatic('get_auction_slot', {args: '(1)'});
        const decodedAuctionSlot = await staticCallAuctionSlot.decode(Utils.auctionSlotType);

        const auctionSlot = Utils.auctionSlotToObject(decodedAuctionSlot);
        assert.equal(auctionSlot.id, 1);
        assert.equal(auctionSlot.timeCapacity, 100);
        assert.equal(auctionSlot.minimumTimePerBid, 1);
        assert.equal(auctionSlot.maximumTimePerBid, 100);
        assert.isEmpty(auctionSlot.successfulBids);
        assert.isEmpty(auctionSlot.failedBids);
        assert.isNumber(auctionSlot.startBlockHeight);
        assert.isNumber(auctionSlot.endBlockHeight);
    });

    it('Static Call and Decode DroneGraffitiAuction Contract; all_auction_slots', async () => {
        const staticCallAuctionSlot = await contract.callStatic('all_auction_slots', {args: '()'});
        const decodedAuctionSlot = await staticCallAuctionSlot.decode(Utils.auctionSlotListType);

        const [auctionSlot] = Utils.auctionSlotListToObject(decodedAuctionSlot);
        assert.equal(auctionSlot.id, 1);
        assert.equal(auctionSlot.timeCapacity, 100);
        assert.equal(auctionSlot.minimumTimePerBid, 1);
        assert.equal(auctionSlot.maximumTimePerBid, 100);
        assert.isEmpty(auctionSlot.successfulBids);
        assert.isEmpty(auctionSlot.failedBids);
        assert.isNumber(auctionSlot.startBlockHeight);
        assert.isNumber(auctionSlot.endBlockHeight);
    });

    it('Call DroneGraffitiAuction Contract; admin_withdraw', async () => {
        const callWithdraw = await contract.call('admin_withdraw', {args: `()`, options: {amount: 0}});
        const decodedWithdraw = await callWithdraw.decode('int');
        assert.equal(decodedWithdraw.value, 0);
    });

    it('Call DroneGraffitiAuction Contract; place bid', async () => {
        await owner.awaitHeight(await owner.height() + 3);
        const amount = 10000;
        const called = await contract.call('place_bid', {
            args: `(1, 20, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40)`,
            options: {amount: amount}
        }).catch(decodeError);
        assert.isTrue(!!called, 'Could not call the DroneGraffitiAuction place bid');
        const decoded = await called.decode(Utils.auctionSlotType);
        const auctionSlot = Utils.auctionSlotToObject(decoded);
        assert.equal(auctionSlot.successfulBids.length, 1);
        assert.equal(auctionSlot.successfulBids[0].seqId, 1);
        assert.equal(auctionSlot.successfulBids[0].user, publicKey);
        assert.equal(auctionSlot.successfulBids[0].amount, amount);
        assert.equal(auctionSlot.successfulBids[0].time, 20);
        assert.equal(auctionSlot.successfulBids[0].data.artworkReference, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd");
        assert.equal(auctionSlot.successfulBids[0].data.coordinates.x, 30);
        assert.equal(auctionSlot.successfulBids[0].data.coordinates.y, 40);
        assert.isEmpty(auctionSlot.failedBids);
    });

    it('Call DroneGraffitiAuction Contract; place multiple bid', async () => {
        await contract.call('place_bid', {
            args: `(1, 30, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40)`,
            options: {amount: 5000}
        }).catch(decodeError);
        await contract.call('place_bid', {
            args: `(1, 20, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40)`,
            options: {amount: 20000}
        }).catch(decodeError);

        const called = await contract.call('place_bid', {
            args: `(1, 50, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40)`,
            options: {amount: 12000}
        }).catch(decodeError);

        const decoded = await called.decode(Utils.auctionSlotType);
        const auctionSlot = Utils.auctionSlotToObject(decoded);
        assert.equal(auctionSlot.successfulBids.length, 3);
        assert.equal(auctionSlot.failedBids.length, 1);
        assert.equal(auctionSlot.failedBids[0].seqId, 2);
        assert.equal(auctionSlot.failedBids[0].amount, 5000);
        assert.equal(auctionSlot.failedBids[0].time, 30);

        await contract.call('place_bid', {
            args: `(1, 10, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40)`,
            options: {amount: 5000}
        }).catch(decodeError);
        const called2 = await contract.call('place_bid', {
            args: `(1, 10, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40)`,
            options: {amount: 4000}
        }).catch(decodeError);

        const decoded2 = await called2.decode(Utils.auctionSlotType);
        const auctionSlot2 = Utils.auctionSlotToObject(decoded2);
        assert.equal(auctionSlot2.successfulBids.length, 4);
        assert.equal(auctionSlot2.failedBids.length, 2);
        const contractBalance = await owner.balance(contract.address);
        const successfulAmount = auctionSlot2.successfulBids.map(bid => parseInt(bid.amount)).reduce((x, y) => x + y, 0);
        assert.equal(successfulAmount, contractBalance);
    });

    it('Call DroneGraffitiAuction Contract; place lots of bid', async () => {
        await contract.call('place_bid', {
            args: `(1, 30, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40)`,
            options: {amount: 5000}
        }).catch(decodeError);
        await contract.call('place_bid', {
            args: `(1, 20, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40)`,
            options: {amount: 20000}
        }).catch(decodeError);
        await contract.call('place_bid', {
            args: `(1, 50, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40)`,
            options: {amount: 12000}
        }).catch(decodeError);
        await contract.call('place_bid', {
            args: `(1, 30, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40)`,
            options: {amount: 5000}
        }).catch(decodeError);
        await contract.call('place_bid', {
            args: `(1, 20, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40)`,
            options: {amount: 20000}
        }).catch(decodeError);
        await contract.call('place_bid', {
            args: `(1, 50, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40)`,
            options: {amount: 12000}
        }).catch(decodeError);
        await contract.call('place_bid', {
            args: `(1, 30, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40)`,
            options: {amount: 5000}
        }).catch(decodeError);
        await contract.call('place_bid', {
            args: `(1, 20, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40)`,
            options: {amount: 20000}
        }).catch(decodeError);
        await contract.call('place_bid', {
            args: `(1, 50, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40)`,
            options: {amount: 12000}
        }).catch(decodeError);
        await contract.call('place_bid', {
            args: `(1, 30, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40)`,
            options: {amount: 5000}
        }).catch(decodeError);
        await contract.call('place_bid', {
            args: `(1, 20, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40)`,
            options: {amount: 20000}
        }).catch(decodeError);
        await contract.call('place_bid', {
            args: `(1, 50, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40)`,
            options: {amount: 12000}
        }).catch(decodeError);
    });

});
