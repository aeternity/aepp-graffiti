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
        nativeMode: true,
        networkId: 'ae_uat',
        compilerUrl: config.compilerUrl
    });

    let contractSource = fs.readFileSync('../contracts/GraffitiAuction.aes', 'utf-8');

    const contract = await client.getContractInstance(contractSource);
    const init = await contract.methods.init('0.000000,-0.000000', 3300, 5000);
    console.log(init);

    const startHeight = (await client.height()) + 10;
    const numberOfWeeks = 10;
    const blocksPerWeek = (60 / 3) * 24 * 7;
    const blocksOverlap = (60 / 3) * 24;

    [...Array(numberOfWeeks).keys()].reduce(async (previousPromise, week) => {
        await previousPromise;

        const start = startHeight + (week * blocksPerWeek) - (week === 0 ? 0 : blocksOverlap);
        const end = startHeight + ((week + 1) * blocksPerWeek);
        console.log(week, start, end);

        return contract.methods.add_auction_slot(500, start, end, 1, 100).catch(console.error);
    }, Promise.resolve());

    const auctionSlots = await contract.methods.all_auction_slots();
    console.log(auctionSlots);
};

deploy();
