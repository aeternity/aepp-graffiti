const forgeutils = require('forgae/cli-commands/utils');
const Ae = require('@aeternity/aepp-sdk').Universal;
const Utils = require('../deployment/teaserUtils');
const keypair = require('../keypair.json');

const config = {
    host: "https://sdk-mainnet.aepps.com/",
    internalHost: "https://sdk-mainnet.aepps.com/"
};

const init = async () => {
    const client = await Ae({
        url: config.host,
        internalUrl: config.internalHost,
        keypair: keypair,
        nativeMode: true,
        networkId: 'ae_mainnet'
    });

    const contract = await deploy(client);
    const contractAddress = contract.address;
    //const contractAddress = "ct_2ccJZsoN5D4iWuueX7k4HSTt3QxBGATqzRo1GfeGj2A5GHCTHr";

    //await addArtwork(contractAddress, client, 1, 200, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd");
    //await addArtwork(contractAddress, client, 2, 200, "QmUG21B7wEfCCABvcZpWKF31Aqc8H2fdGBZ4VSAP6vGvQd");
};

const deploy = async (client) => {


    let contractSource = await forgeutils.readFile('./contracts/DroneGraffitiTeaser.aes', "utf-8");
    const compiledContract = await client.contractCompile(contractSource, {gas: config.gas}).catch(console.error);

    const deployPromise = compiledContract.deploy({
        initState: '("19.421802,-99.158284")',
        //initState: '("0.000000,-0.000000")',
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

const addArtwork = async (contractAddress, client, artworkId, dronetime, artworkReference) => {
    await client.contractCall(contractAddress, 'sophia-address', contractAddress, 'add_artwork', {
        args: `(${artworkId}, ${dronetime}, "${artworkReference}")`,
        options: {amount: 0}
    });
    const staticCall = await client.contractCallStatic(contractAddress, 'sophia-address', 'all_artworks', {args: '()'});
    const decoded = await client.contractDecodeData(Utils.artworkListType, staticCall.result);

    const artworks = Utils.artworkListToObject(decoded);

    console.log(`\n\n====== DroneGraffitiTeaser Contract Artworks on ${config.host} ======`);
    console.log(artworks);
};

init();
