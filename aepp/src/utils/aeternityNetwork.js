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
  return await Promise.race([
    promise,
    new Promise(resolve => {
      setTimeout(() => {
        resolve('TIMEOUT')
      }, 30000)
    })
  ])
}

aeternity.initProvider = async () => {
  try {
    aeternity.address = await aeternity.client.address()
    aeternity.height = await aeternity.client.height()
    aeternity.balance = await aeternity.client.balance(aeternity.address)
      .then(balance => `${BlockchainUtil.atomsToAe(balance)}`.replace(',', ''))
      .catch(() => '0')
    aeternity.networkId = (await aeternity.client.getNodeInfo()).nodeNetworkId
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

aeternity.getWalletWindow = async () => {
  const iframe = document.createElement('iframe')
  iframe.src = 'https://base.aepps.com/' //'https://base.aepps.com/' // https://stage-identity.aepps.com/ http://localhost:8080/
  iframe.style.display = 'none'
  document.body.appendChild(iframe)
  await new Promise(resolve => {
    const handler = ({ data }) => {
      if (data.method !== 'ready') return
      window.removeEventListener('message', handler)
      resolve()
    }
    window.addEventListener('message', handler)
  })
  return iframe.contentWindow
}

aeternity.initLedger = async () => {
  try {
    return await timeout(Aepp({
      parent: await aeternity.getWalletWindow()
    }))
  } catch (e) {
    console.warn('Reverse iFrame init failed')
    return false
  }
}

aeternity.checkAvailableWallets = async () => {

  // Check for base aepp
  const wallets = {}

  const baseAeppClient = await aeternity.initBase()
  if (baseAeppClient && baseAeppClient !== 'TIMEOUT') wallets['mobileBaseAepp'] = baseAeppClient

  // Dont even check for iframe / extension if aepp is run inside a base-aepp
  if(baseAeppClient && window.parent !== window) return wallets

  // Check for iframe
  const iframeClient = await aeternity.initLedger()
  if (iframeClient && iframeClient !== 'TIMEOUT') wallets['desktopBaseAepp'] = iframeClient

  // Check for window.Aepp
  if (window.hasOwnProperty('Aepp')) {
    // TODO maybe implement extension
  }

  return wallets
}

aeternity.setClient = async (clientName, client) => {
  aeternity.client = client
  localStorage.setItem('aeWallet', clientName)
  return await aeternity.initProvider()
}

aeternity.hasActiveWallet = () => {
  return !!aeternity.client && !!aeternity.contract
}

aeternity.isTestnet = () => {
  return aeternity.networkId === 'ae_uat'
}

aeternity.initClient = async () => {

  let result = true
  if (!aeternity.client) {
    try {
      const preferredWallet = localStorage.getItem('aeWallet')
      const wallets = await aeternity.checkAvailableWallets()
      if (preferredWallet && wallets[preferredWallet]) {
        result = await aeternity.setClient(preferredWallet, wallets[preferredWallet])
      } else if (Object.keys(wallets).length === 1) {
        result = await aeternity.setClient(Object.keys(wallets)[0], wallets[Object.keys(wallets)[0]])
      } else if (Object.keys(wallets).length > 1) {
        const otherWallets = Object.filter(wallets).map(walletName => walletName !== preferredWallet)
        result = await aeternity.setClient(otherWallets[0], wallets[otherWallets[0]])
      } else {
        result = false
      }
    } catch (e) {
      console.error(e)
      result = false
    }
  } else {
    result = await aeternity.initProvider()
  }
  return result
}

export default aeternity
