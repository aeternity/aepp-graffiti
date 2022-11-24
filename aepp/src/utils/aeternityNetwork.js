import {Node, Universal} from '@aeternity/aepp-sdk/es';
import {EventBus} from './eventBus';
import BlockchainUtil from '../utils/blockchainUtil'
import config from '../config'
import contractSource from '../assets/GraffitiAuction.aes'

const tempCallOptions = { gas: 100000000000 };

const aeternity = {
  client: null,
  address: null,
  height: null,
  networkId: null,
  static: false,
  tempCallOptions: tempCallOptions,
}

aeternity.updateHeight = async () => {
  aeternity.height = await aeternity.client.height()
  return aeternity.height
}

aeternity.initProvider = async () => {
  try {
    aeternity.height = await aeternity.client.height()

    const networkId = (await aeternity.client.getNodeInfo()).nodeNetworkId;
    const changedNetwork = aeternity.networkId !== networkId && aeternity.networkId !== null;
    aeternity.networkId = networkId
    if (changedNetwork) EventBus.$emit('networkChange');

    aeternity.address = await aeternity.client.address()
    aeternity.balance = await aeternity.client.balance(aeternity.address)
      .then(balance => `${BlockchainUtil.atomsToAe(balance)}`.replace(',', ''))
      .catch(() => '0')
    aeternity.contract = await aeternity.client.getContractInstance(contractSource, {contractAddress: config.blockchainSettings[aeternity.networkId]})
    aeternity.client.api.protectedDryRunTxs = aeternity.client.api.dryRunTxs;

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

  // MAINNET
  return Universal({
    compilerUrl: config.compilerUrl,
    nodes: [
      {
        name: 'node',
        instance: await Node({
          url: config.nodeUrl.ae_mainnet,
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
          url: config.nodeUrl.ae_uat,
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
 * Initializes the aeternity sdk to be imported in other occasions
 * @returns {Promise<boolean>}
 */
aeternity.initClient = async () => {
  if (!aeternity.client) aeternity.client = await aeternity.initStaticClient();
  return aeternity.initProvider();
};

export default aeternity
