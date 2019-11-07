import Aepp from '@aeternity/aepp-sdk/es/ae/aepp'
import BlockchainUtil from '../utils/blockchainUtil'
import config from '../config'
import contractSource from '../assets/GraffitiAuction.aes'

const aeternity = {
  client: null,
  address: null,
  height: null,
  networkId: null
}

const timeout = async (promise) => {
  return Promise.race([
    promise,
    new Promise(resolve => {
      setTimeout(() => {
        resolve('TIMEOUT')
      }, 30000)
    })
  ])
}

aeternity.updateHeight = async () => {
  aeternity.height = await aeternity.client.height()
  return aeternity.height
}


aeternity.initProvider = async () => {
  try {
    aeternity.address = await aeternity.client.address()
    aeternity.height = await aeternity.client.height()
    aeternity.balance = await aeternity.client.balance(aeternity.address)
      .then(balance => `${BlockchainUtil.atomsToAe(balance)}`.replace(',', ''))
      .catch(() => '0')
    aeternity.networkId = (await aeternity.client.getNodeInfo()).nodeNetworkId
    aeternity.network = aeternity.isTestnet() ? '' : 'mainnet'
    aeternity.contract = await aeternity.client.getContractInstance(contractSource, {contractAddress: config.blockchainSettings[aeternity.networkId]})
    return true
  } catch (e) {
    console.warn(e)
    return false
  }
}

aeternity.initBase = async () => {
  try {
    if (window.parent === window) return false
    return await timeout(Aepp())
  } catch (e) {
    console.warn('Base Aepp init failed')
    return false
  }
}

aeternity.hasActiveWallet = () => {
  return !!aeternity.client && !!aeternity.contract
}

aeternity.isTestnet = () => {
  return aeternity.networkId === 'ae_uat'
}

aeternity.initClient = async () => {
  aeternity.client = await aeternity.initBase();
  return aeternity.initProvider()
}

export default aeternity
