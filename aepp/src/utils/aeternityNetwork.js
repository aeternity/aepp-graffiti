import {Node} from '@aeternity/aepp-sdk';
import {EventBus} from './eventBus';
import BlockchainUtil from '../utils/blockchainUtil'
import config from '../config'
import GraffitiAuctionACI from '../utils/GraffitiAuctionACI'

const tempCallOptions = {gas: 100000000000};

export const nodes = [
  {name: 'ae_mainnet', instance: new Node(config.nodeUrl.ae_mainnet)},
  {name: 'ae_uat', instance: new Node(config.nodeUrl.ae_uat)}
]

const aeternity = {
  client: null,
  address: null,
  height: null,
  networkId: null,
  static: false,
  tempCallOptions: tempCallOptions,
}

aeternity.updateHeight = async () => {
  aeternity.height = await aeternity.client.getHeight()
  return aeternity.height
}

aeternity.initProvider = async () => {
  try {
    aeternity.height = await aeternity.client.getHeight()

    const networkId = (await aeternity.client.getNodeInfo()).nodeNetworkId;
    const changedNetwork = aeternity.networkId !== networkId && aeternity.networkId !== null;
    aeternity.networkId = networkId
    if (changedNetwork) EventBus.$emit('networkChange');


    aeternity.address = aeternity.client.address
    aeternity.balance = await aeternity.client.getBalance(aeternity.address)
      .then(balance => `${BlockchainUtil.atomsToAe(balance)}`.replace(',', ''))
      .catch(() => '0')
    aeternity.contract = await aeternity.client.initializeContract({
      aci: GraffitiAuctionACI,
      address: config.blockchainSettings[aeternity.networkId]
    })

    //debugger;
    //aeternity.client.api.protectedDryRunTxs = aeternity.client.api.dryRunTxs;

    return true
  } catch (e) {
    console.warn(e)
    return false
  }
}

aeternity.hasActiveWallet = () => {
  return !!aeternity.client;
};

export default aeternity
