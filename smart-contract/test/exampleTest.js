const Ae = require('@aeternity/aepp-sdk').Universal;
const Utils = require('../deployment/utils');

const config = {
    host: "http://localhost:3001/",
    internalHost: "http://localhost:3001/internal/",
    gas: 200000,
    ttl: 55
};

describe('FirstComeAuction', () => {

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

    it('Deploying FirstComeAuction Contract; initialize', async () => {
        let contractSource = utils.readFileRelative('./contracts/FirstComeAuction.aes', "utf-8"); // Read the aes file

        const compiledContract = await owner.contractCompile(contractSource, { // Compile it
            gas: config.gas
        });

        const deployPromise = compiledContract.deploy({ // Deploy it
            initState: '(10000)',
            options: {
                ttl: config.ttl,
            }
        });

        assert.isFulfilled(deployPromise, 'Could not deploy the FirstComeAuction Contract'); // Check it is deployed
        contract = await deployPromise;
    });

    it('Static Call and Decode FirstComeAuction Contract; initialized available_time correctly', async () => {
        const staticCallAvailableTime = await contract.callStatic('available_time', {args: '()'});
        const decodedAvailableTime = await staticCallAvailableTime.decode('int');
        assert.equal(decodedAvailableTime.value, 10000)
    });

    it('Call FirstComeAuction Contract; place bid, available time is reduced', async () => {
        const callBid = contract.call('bid', {
            args: '("QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd", 30, 40, 100)',
            options: {amount: 1337}
        });
        assert.isFulfilled(callBid, 'Could not call the FirstComeAuction bid');
        await callBid;

        const staticCallAvailableTime = await contract.callStatic('available_time', {args: '()'});
        const decodedAvailableTime = await staticCallAvailableTime.decode('int');
        assert.equal(decodedAvailableTime.value, 9900)
    });


    it('Static Call and Decode FirstComeAuction Contract; all bids include placed bid, util converts correctly', async () => {
        const staticCallAllBids = await contract.callStatic('all_bids', {args: '()'});
        const decodedAllBids = await staticCallAllBids.decode('list((address, string, (int, int), int, int))');

        const bids = Utils.bidListToObject(decodedAllBids);
        assert.lengthOf(bids, 1);
        assert.equal(bids[0].hash, 'QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd');
        assert.deepEqual(bids[0].coordinates, {x: 30, y: 40});
        assert.equal(bids[0].droneTime, 100);
        assert.equal(bids[0].amount, 1337);
        assert.equal(bids[0].user, publicKey);
    });
});
