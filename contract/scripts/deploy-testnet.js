const fs = require('fs');
const {MemoryAccount, Node, AeSdk, CompilerHttp} = require('@aeternity/aepp-sdk');

const deploy = async () => {

    const config = {
        host: 'https://testnet.aeternity.io/',
        compilerUrl: 'https://compiler.aepps.com'
    };

    const secretKey = '';

    const client = new AeSdk({
        nodes: [{name: 'node', instance: new Node(config.host)}],
        onCompiler: new CompilerHttp(config.compilerUrl),
        accounts: [
            new MemoryAccount(secretKey),
        ],
    });

    let contractSource = fs.readFileSync('../contracts/GraffitiAuction.aes', 'utf-8');

    const contractOld = await client.initializeContract({sourceCode: contractSource, address: ''});
    await contractOld.admin_withdraw_to_admin();

    const contract = await client.initializeContract({sourceCode: contractSource});
    const init = await contract.init('0.000000,-0.000000', 3300, 5000);
    console.log(init);

    const startHeight = (await client.getHeight()) + 1;
    const numberOfUnits = 6; // 6 days/units of slots
    const blocksPerUnit = (60 / 3) * 24; // 1 day slots *7 for 1 week slots
    const blocksOverlap = (60 / 3) * 8; // 8 h overlap

    for (const unit of [...Array(numberOfUnits).keys()]) {
        const start = startHeight + (unit * blocksPerUnit) - (unit === 0 ? 0 : blocksOverlap);
        const end = startHeight + ((unit + 1) * blocksPerUnit);
        console.log(unit, start, end);

        await contract.add_auction_slot(1000, start, end, 1, 100).catch(console.error);
    }

    const auctionSlots = await contract.all_auction_slots();
    console.log(auctionSlots.decodedResult);
};

deploy();
