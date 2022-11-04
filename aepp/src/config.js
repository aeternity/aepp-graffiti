const API_URL = 'https://backend.graffiti.aeternity.art'
//const API_URL = 'http://localhost:3000';
// const API_URL = 'http://192.168.0.157:3000';

const COMPILER_URL = 'https://v6.compiler.aepps.com/'
const TESTNET_URL = 'https://testnet.aeternity.io';
const MAINNET_URL = 'https://mainnet.aeternity.io';

export default {
  // HARDCODED SETTINGS
  imageSettings: {
    max: { width: 1000, height: 1000 },
    min: { width: 400, height: 300 }
  },
  canvas: {
    url: (network) => `${API_URL}/rendered/${network ? network + '/' : ''}latest.svg`,
    urlSmall: (network) => `${API_URL}/rendered/${network ? network + '/' : ''}latest_small.png`,
    width: 990,
    height: 1500,
    realWidth: 3300,
    realHeight: 5000,
    pixelToMM: 10, // Pixel * pixelToMM = mm
    shardURL: API_URL + '/rendered/shards/'
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
    ae_uat: 'ct_uJ5NKmuX7eX79QPerixR7Z8zEdxKCKJw1yzHjX1tsmRP17tuP', // testnet //ct_eLhLkGX2kfrqj6skdG4AxwjQk2MJy6nsWASnG8aEQFrQ2gDyp //ct_2SugvqB52guEV6fSTkuGjipzPMjeEf5urYQYnPe91cdkMmjJGy
    ae_mainnet:'ct_ftU4u1wEsiWd6YN4AAekEArJmLds4K8AB2k4UXKxn32Yrf5n5'// ct_2L8CMtgsb3cz9VbhYdtrSZPU8MbGDhH446WjTnFDm3snyMYTR'ct_2P2vEqq3WQz6kzKLJFoqBbm46EMot64WvpP1xpvvANApLWcwnt';
  },
  apiUrl: API_URL,
  compilerUrl: COMPILER_URL,
  testnetUrl: TESTNET_URL,
  mainnetUrl: MAINNET_URL,
}
