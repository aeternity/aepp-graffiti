const fs = require('fs');
const {Universal, MemoryAccount, Node} = require('@aeternity/aepp-sdk');

const deploy = async () => {

    const config = {
        host: 'https://testnet.aeternity.io/',
        compilerUrl: 'https://v6.compiler.aepps.com'
    };

    const keypair = {
        secretKey: '',
        publicKey: ''
    };

    const client = await Universal({
        nodes: [{name: 'node', instance: await Node({url: config.host})}],
        compilerUrl: config.compilerUrl,
        accounts: [
            MemoryAccount({keypair: keypair}),
        ],
    });

    let contractSource = fs.readFileSync('../contracts/GraffitiAuction.aes', 'utf-8');

    const contractOld = await client.getContractInstance(contractSource, {contractAddress: ''});
    await contractOld.methods.admin_withdraw_to_admin();

    const contract = await client.getContractInstance(contractSource);
    const init = await contract.methods.init('0.000000,-0.000000', 3300, 5000);
    console.log(init);

    const startHeight = (await client.height()) + 1;
    const numberOfUnits = 6;
    const blocksPerUnit = (60 / 3) * 24;
    const blocksOverlap = (60 / 3) * 8;

    await [...Array(numberOfUnits).keys()].reduce(async (previousPromise, unit) => {
        await previousPromise;

        const start = startHeight + (unit * blocksPerUnit) - (unit === 0 ? 0 : blocksOverlap);
        const end = startHeight + ((unit + 1) * blocksPerUnit);
        console.log(unit, start, end);

        return contract.methods.add_auction_slot(10000, start, end, 1, 100).catch(console.error);
    }, Promise.resolve());

    const auctionSlots = await contract.methods.all_auction_slots();
    console.log(auctionSlots);
};

deploy();
