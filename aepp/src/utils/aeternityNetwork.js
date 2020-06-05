import {Node, Universal, MemoryAccount} from '@aeternity/aepp-sdk/es';
import {EventBus} from './eventBus';
import BlockchainUtil from '../utils/blockchainUtil'
import config from '../config'
import contractSource from '../assets/GraffitiAuction.aes'

const TESTNET_URL = 'https://testnet.aeternity.io';
const MAINNET_URL = 'https://mainnet.aeternity.io';
const COMPILER_URL = 'https://compiler.aepps.com';

const aeternity = {
  client: null,
  address: null,
  height: null,
  networkId: null,
  static: false
}

aeternity.updateHeight = async () => {
  aeternity.height = await aeternity.client.height()
  return aeternity.height
}

aeternity.initProvider = async () => {
  try {
    aeternity.address = await aeternity.client.address()
    aeternity.height = await aeternity.client.height()

    const networkId = (await aeternity.client.getNodeInfo()).nodeNetworkId;
    const changedNetwork = aeternity.networkId !== networkId && aeternity.networkId !== null;
    console.log(aeternity.networkId, networkId)
    aeternity.networkId = networkId
    if (changedNetwork) EventBus.$emit('networkChange');

    aeternity.balance = await aeternity.client.balance(aeternity.address)
      .then(balance => `${BlockchainUtil.atomsToAe(balance)}`.replace(',', ''))
      .catch(() => '0')
    aeternity.network = aeternity.isMainnet() ? 'mainnet' : ''
    aeternity.contract = await aeternity.client.getContractInstance(contractSource, {contractAddress: config.blockchainSettings[aeternity.networkId]})
    return true
  } catch (e) {
    console.warn(e)
    return false
  }
}
/**
 * Initialize a static client, mainnet or testnet
 * This client can not sign transactions that require funds (everything except static contract calls)
 * @returns {Promise<*>}
 */
aeternity.initStaticClient = async () => {
  aeternity.static = true;

  // TESTNET
  return Universal({
    compilerUrl: COMPILER_URL,
    nodes: [
      {
        name: 'testnet',
        instance: await Node({
          url: TESTNET_URL,
        }),
      }],
  });
  // MAINNET
  /*
  return Universal({
    compilerUrl: COMPILER_URL,
    nodes: [
      {
        name: 'mainnet',
        instance: await Node({
          url: MAINNET_URL,
        }),
      }],
  });
  */

};

/**
 * Returns true if a client has been initialized.
 * Used to check after switching pages if the initialization was already done.
 * @returns {boolean}
 */
aeternity.hasActiveWallet = () => {
  return !!aeternity.client;
};

/**
 * Checks if the initialized client is connected to the ae-mainnet
 * @returns {boolean}
 */
aeternity.isMainnet = () => {
  return aeternity.networkId === 'ae_mainnet';
};


/**
 * Initializes the aeternity sdk to be imported in other occasions
 * @returns {Promise<boolean>}
 */
aeternity.initClient = async () => {
  if (process && process.env && process.env.PRIVATE_KEY && process.env.PUBLIC_KEY) {
    aeternity.client = await Universal({
      nodes: [{name: 'testnet', instance: await Node({url: TESTNET_URL})}],
      compilerUrl: COMPILER_URL,
      accounts: [
        MemoryAccount({keypair: {secretKey: process.env.PRIVATE_KEY, publicKey: process.env.PUBLIC_KEY}}),
      ],
    });
    return aeternity.initProvider();
  }

  if (!aeternity.client) aeternity.client = await aeternity.initStaticClient();
  return aeternity.initProvider();
};

export default aeternity
