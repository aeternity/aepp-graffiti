const fs = require('fs');
const Universal = require('@aeternity/aepp-sdk').Universal;

const deploy = async () => {

    const config = {
        host: 'https://sdk-testnet.aepps.com/',
        internalHost: 'https://sdk-testnet.aepps.com/',
        compilerUrl: 'https://compiler.aepps.com'
    };

    const keypair = {
        secretKey: '',
        publicKey: ''
    };

    const client = await Universal({
        url: config.host,
        internalUrl: config.internalHost,
        keypair: keypair,
        compilerUrl: config.compilerUrl
    });

    let contractSource = fs.readFileSync('../contracts/GraffitiAuction.aes', 'utf-8');

    const contractOld = await client.getContractInstance(contractSource, {contractAddress: ''});
    await contractOld.methods.admin_withdraw_to_admin();

    const contract = await client.getContractInstance(contractSource);
    const init = await contract.methods.init('0.000000,-0.000000', 3300, 5000);
    console.log(init);

    const startHeight = (await client.height()) + 1;
    const numberOfUnits = 8;
    const blocksPerUnit = (60 / 3) * 24 * 7;
    const blocksOverlap = (60 / 3) * 24;

    await [...Array(numberOfUnits).keys()].reduce(async (previousPromise, unit) => {
        await previousPromise;

        const start = startHeight + (unit * blocksPerUnit) - (unit === 0 ? 0 : blocksOverlap);
        const end = startHeight + ((unit + 1) * blocksPerUnit);
        console.log(unit, start, end);

        return contract.methods.add_auction_slot(1000, start, end, 1, 100).catch(console.error);
    }, Promise.resolve());

    const auctionSlots = await contract.methods.all_auction_slots();
    console.log(auctionSlots);
};

deploy();
