const Ae = require('@aeternity/aepp-sdk').Universal;

const config = {
    host: "http://localhost:3001/",
    internalHost: "http://localhost:3001/internal/",
    gas: 200000,
    ttl: 55
};

describe('Example Contract', () => {

    let owner;

    before(async () => {
        const ownerKeyPair = wallets[0];
        owner = await Ae({
            url: config.host,
            internalUrl: config.internalHost,
            keypair: ownerKeyPair,
            nativeMode: true,
            networkId: 'ae_devnet'
        });

    });

    it('Deploying FirstComeAuction Contract', async () => {
        let contractSource = utils.readFileRelative('./contracts/FirstComeAuction.aes', "utf-8"); // Read the aes file

        const compiledContract = await owner.contractCompile(contractSource, { // Compile it
            gas: config.gas
        });

        const deployPromise = compiledContract.deploy({ // Deploy it
            options: {
                ttl: config.ttl,
            }
        });

        assert.isFulfilled(deployPromise, 'Could not deploy the FirstComeAuction Contract'); // Check it is deployed
    });

});
