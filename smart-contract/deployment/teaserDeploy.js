const forgeutils = require('forgae/cli-commands/utils');
const Ae = require('@aeternity/aepp-sdk').Universal;
const Utils = require('../deployment/teaserUtils');
const keypair = require('../keypair.json');

const config = {
    host: "https://sdk-testnet.aepps.com/",
    internalHost: "https://sdk-testnet.aepps.com/"
};

const init = async () => {
    const {contract, client} = await deploy();
    await addArtwork(contract, 1, 200, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd");
    await addArtwork(contract, 2, 200, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd");
};

const deploy = async () => {
    const client = await Ae({
        url: config.host,
        internalUrl: config.internalHost,
        keypair: keypair,
        nativeMode: true,
        networkId: 'ae_uat'
    });

    let contractSource = await forgeutils.readFile('./contracts/DroneGraffitiTeaser.aes', "utf-8");
    const compiledContract = await client.contractCompile(contractSource, {gas: config.gas}).catch(console.error);

    const deployPromise = compiledContract.deploy({
        initState: '("0.000000,-0.000000")',
        options: {
            ttl: config.ttl,
            amount: 0
        }
    });

    const contract = await deployPromise;

    console.log(`\n\n====== DroneGraffitiTeaser Contract has been deployed to ${config.host} ======`);
    console.log(contract);

    return {contract, client};
};

const addArtwork = async (contract, artworkId, dronetime, artworkReference) => {
    await contract.call('add_artwork', {args: `(${artworkId}, ${dronetime}, "${artworkReference}")`, options: {amount: 0}});
    const staticCall = await contract.callStatic('all_artworks', {args: '()'});
    const decoded = await staticCall.decode(Utils.artworkListType);

    const artworks = Utils.artworkListToObject(decoded);

    console.log(`\n\n====== DroneGraffitiTeaser Contract Artworks on ${config.host} ======`);
    console.log(artworks);
};

init();
