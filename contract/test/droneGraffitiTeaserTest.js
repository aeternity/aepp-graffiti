const Ae = require('@aeternity/aepp-sdk').Universal;
const Utils = require('../deployment/teaserUtils');

const config = {
    host: "http://localhost:3001/",
    internalHost: "http://localhost:3001/internal/",
    gas: 200000,
    ttl: 55
};


describe('DroneGraffitiTeaser', () => {

    let owner;
    let contract;
    let publicKey;

    const decodeError = async (e) => {
        const decodedError = await owner.contractDecodeData('string', e.returnValue).catch(e => console.error(e));
        console.error('decodedError', decodedError);
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

    it('Deploying DroneGraffitiTeaser Contract; initialize', async () => {
        let contractSource = utils.readFileRelative('./contracts/DroneGraffitiTeaser.aes', "utf-8"); // Read the aes file

        const compiledContract = await owner.contractCompile(contractSource, { // Compile it
            gas: config.gas
        }).catch(console.error);

        const deployPromise = compiledContract.deploy({ // Deploy it
            initState: '("0.000000,-0.000000")',
            options: {
                ttl: config.ttl,
                amount: 0
            }
        });

        assert.isFulfilled(deployPromise, 'Could not deploy the DroneGraffitiTeaser Contract'); // Check it is deployed
        contract = await deployPromise;
    });

    it('Call DroneGraffitiTeaser Contract; add_artwork', async () => {
        const call = await contract.call('add_artwork', {args: `(1, 200, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd")`, options: {amount: 0}});
        const decoded = await call.decode(Utils.artworkType);
        const artwork = Utils.artworkToObject(decoded);
        assert.equal(artwork.user, publicKey);
        assert.equal(artwork.dronetime, 200);
        assert.equal(artwork.artworkReference, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd");
    });

    it('Static Call and Decode DroneGraffitiTeaser Contract; all_artworks', async () => {
        const staticCall = await contract.callStatic('all_artworks', {args: '()'});
        const decoded = await staticCall.decode(Utils.artworkListType);

        const artworks = Utils.artworkListToObject(decoded);
        assert.equal(artworks.length, 1);
        assert.equal(artworks[0].user, publicKey);
        assert.equal(artworks[0].dronetime, 200);
        assert.equal(artworks[0].artworkReference, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd");
    });

});
