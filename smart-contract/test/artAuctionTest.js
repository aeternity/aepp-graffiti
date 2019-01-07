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

    /*
    it('Static Call and Decode ArtAuction Contract; initialized available_time correctly', async () => {
        const staticCallAvailableTime = await contract.callStatic('available_time', {args: '()'});
        const decodedAvailableTime = await staticCallAvailableTime.decode('int');
        assert.equal(decodedAvailableTime.value, 10000)
    });*/

    it('Call ArtAuction Contract; start auction', async () => {
        const callBid = contract.call('add_auction_slot', {args: `(100, ${(await owner.height()) + 1}, 10, 1, 100)`});
        assert.isFulfilled(callBid, 'Could not call the ArtAuction start');
        await callBid;
    });

    /*
    it('Static Call and Decode ArtAuction Contract; all bids include placed bid, util converts correctly', async () => {
        const staticCallAllBids = await contract.callStatic('all_bids', {args: '()'});
        const decodedAllBids = await staticCallAllBids.decode('list((address, string, (int, int), int, int))');

        const bids = Utils.bidListToObject(decodedAllBids);
        assert.lengthOf(bids, 1);
        assert.equal(bids[0].hash, 'QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd');
        assert.deepEqual(bids[0].coordinates, {x: 30, y: 40});
        assert.equal(bids[0].droneTime, 100);
        assert.equal(bids[0].amount, 1337);
        assert.equal(bids[0].user, publicKey);
    });*/
});
