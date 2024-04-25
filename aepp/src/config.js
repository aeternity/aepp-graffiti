const TESTNET_URL = 'https://testnet.aeternity.io'
const MAINNET_URL = 'https://mainnet.aeternity.io'

const apiUrl = {
  ae_uat: process.env.TESTNET_SERVER_URL,
  ae_mainnet: process.env.MAINNET_SERVER_URL
}

export default {
  // HARDCODED SETTINGS
  imageSettings: {
    max: { width: 1000, height: 1000 },
    min: { width: 400, height: 300 }
  },
  canvas: {
    urlSvg: (network) => `${apiUrl[network]}/rendered/latest.svg`,
    urlSmall: (network) => `${apiUrl[network]}/rendered/latest_small.png`,
    width: 990,
    height: 1500,
    realWidth: 3300,
    realHeight: 5000,
    pixelToMM: 10, // Pixel * pixelToMM = mm
  },
  droneSettings: {
    wallId: 'MX19-001',
    gpsLocation: [0, 0],
    wallSize: [33000, 50000],   // in mm
    canvasSize: [33000, 50000], // mm
    canvasPosition: [0, 0], // mm (origin = [bottom left])
    colors: ['#f7296e'], // default [#f7296e]
    droneResolution: 200,       // min distance drone can move, in mm
    dronePrecisionError: 150,   // error margin, mm
    droneFlyingSpeed: 0.3,  // average drone flying speed [m/s],
    minimumImageSize: [10, 10]
  },
  blockchainSettings: {
    ae_uat: 'ct_N4ijuS5Nwg1txyqqkgUBruJgCXrT8G7ZRKWi9N5KjGUhTS3cE', // testnet ct_uJ5NKmuX7eX79QPerixR7Z8zEdxKCKJw1yzHjX1tsmRP17tuP ct_eLhLkGX2kfrqj6skdG4AxwjQk2MJy6nsWASnG8aEQFrQ2gDyp ct_2SugvqB52guEV6fSTkuGjipzPMjeEf5urYQYnPe91cdkMmjJGy
    ae_mainnet: 'ct_2Lj41hzQ7xtYqEQGiBwwrW8yDCuz4VRaAcYS28uc9Jq39QTJUQ' // ct_rR1BHya4jLXR1d4FpTRfgB5YZmALELwm6kf7f64sVRSjmWtrj ct_ftU4u1wEsiWd6YN4AAekEArJmLds4K8AB2k4UXKxn32Yrf5n5 ct_2L8CMtgsb3cz9VbhYdtrSZPU8MbGDhH446WjTnFDm3snyMYTR ct_2P2vEqq3WQz6kzKLJFoqBbm46EMot64WvpP1xpvvANApLWcwnt
  },
  apiUrl,
  nodeUrl: {
    ae_uat: TESTNET_URL,
    ae_mainnet: MAINNET_URL
  },
  defaultNetworkId: 'ae_mainnet'
}
