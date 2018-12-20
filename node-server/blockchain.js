const {Universal} = require('@aeternity/aepp-sdk');

const blockchain = {};
const contractAddress = 'ct_UPBs1P3YZfmhjcvHbKeanPLEgVpQrXVty6RCGN8MvaaU8KwSb';

let client = null;

function bidListToObject(bidList) {
  return bidList.value.map(bid => {
    return {
      userHash: bid.value[0].value,
      hash: bid.value[1].value,
      coordinates: {
        x: bid.value[2].value[0].value,
        y: bid.value[2].value[1].value
      },
      droneTime: bid.value[3].value,
      amount: bid.value[4].value
    }
  })
}

blockchain.init = async () => {
  client = await Universal({
    url: 'https://sdk-testnet.aepps.com',
    internalUrl: 'https://sdk-testnet.aepps.com',
    keypair: {
      secretKey: '79816bbf860b95600ddfabf9d81fee81bdb30be823b17d80b9e48be0a7015adf75ee9825ad630963482bb1939a212a0e535883c6b4d7804e40287e1f556da272',
      publicKey: 'ak_twR4h7dEcUtc2iSEDv8kB7UFJJDGiEDQCXr85C3fYF8FdVdyo'
    },

    networkId: 'ae_uat',
    nativeMode: true
  });

  return client;
};

blockchain.height = async () => {
  if (!client) await blockchain.init();
  return await client.height();
};

blockchain.allBids = async () => {
  if (!client) await blockchain.init();

  const calledAllBids = await client.contractCallStatic(contractAddress, 'sophia-address', 'all_bids', {args: '()'}).catch(e => console.error(e));
  const decodedAllBids = await client.contractDecodeData('list((address, string, (int, int), int, int))', calledAllBids.result).catch(e => console.error(e));

  return bidListToObject(decodedAllBids);
};


module.exports = blockchain;
