import Aepp from '@aeternity/aepp-sdk/es/ae/aepp'
import BlockchainUtil from '~/utils/blockchainUtil.js'

const aeternity = {
  client: null,
  address: null,
  height: null,
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
    console.warn(e)
    return false
  }
}

aeternity.getWalletWindow = async () => {
  const iframe = document.createElement('iframe')
  iframe.src = 'http://localhost:8080/'//'https://base.aepps.com/' // https://stage-identity.aepps.com/
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
    console.warn(e)
    return false
  }
}

aeternity.checkAvailableWallets = async () => {

  // Check for base aepp
  const wallets = {
    'mobileBaseAepp': null,
    'desktopBaseAepp': null
  }

  const baseAeppClient = await aeternity.initBase()
  console.log(baseAeppClient)
  if (baseAeppClient && baseAeppClient !== 'TIMEOUT') wallets['mobileBaseAepp'] = baseAeppClient

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
  await aeternity.initProvider()
}

aeternity.getClient = async () => {

  if (!aeternity.client) {
    const preferredWallet = localStorage.getItem('aeWallet')
    const wallets = await aeternity.checkAvailableWallets()
    if (preferredWallet && wallets[preferredWallet]) {
      await aeternity.setClient(preferredWallet, wallets[preferredWallet])
    } else if (wallets.length === 1) {
      await aeternity.setClient(Object.keys(wallets)[0], wallets[Object.keys(wallets)[0]])
    } else if (wallets.length > 1) {
      const otherWallets = Object.filter(wallets).map(walletName => walletName !== preferredWallet)
      await aeternity.setClient(otherWallets[0], wallets[otherWallets[0]])
    } else {
      return null
    }
  }
  return aeternity.client
}

export default aeternity
