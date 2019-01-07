const Ae = require('@aeternity/aepp-sdk').Universal;
const Utils = require('../deployment/utils');

const config = {
    host: "http://localhost:3001/",
    internalHost: "http://localhost:3001/internal/",
    gas: 200000,
    ttl: 55
};

describe('ArtAuction', () => {

    let owner;
    let contract;
    let publicKey;

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

    it('Deploying ArtAuction Contract; initialize', async () => {
        let contractSource = utils.readFileRelative('./contracts/ArtAuction.aes', "utf-8"); // Read the aes file

        const compiledContract = await owner.contractCompile(contractSource, { // Compile it
            gas: config.gas
        });

        const deployPromise = compiledContract.deploy({ // Deploy it
            initState: '()',
            options: {
                ttl: config.ttl,
            }
        });

        assert.isFulfilled(deployPromise, 'Could not deploy the ArtAuction Contract'); // Check it is deployed
        contract = await deployPromise;
    });

    it('Call ArtAuction Contract; start auction', async () => {
        const callBid = contract.call('add_auction_slot', {args: `(100, ${(await owner.height()) + 5}, 10, 1, 100)`});
        assert.isFulfilled(callBid, 'Could not call the ArtAuction start');
        await callBid;
    });

    it('Static Call and Decode ArtAuction Contract; get_auction_slot', async () => {
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

    it('Static Call and Decode ArtAuction Contract; all_auction_slots', async () => {
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
});
