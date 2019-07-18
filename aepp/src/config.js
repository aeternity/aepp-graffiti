 const API_URL = 'https://backend.graffiti.aeternity.com'
// const API_URL = 'http://localhost:3000';
// const API_URL = 'http://192.168.0.157:3000';

export default {
  // HARDCODED SETTINGS
  imageSettings: {
    max: { width: 1000, height: 1000 },
    min: { width: 400, height: 300 }
  },
  canvas: {
    url: API_URL + '/rendered/latest.svg',
    urlSmall: API_URL + '/rendered/latest_small.png',
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
    colors: ['#000000', '#eb340f', '#0f71eb'], // default [#000]
    droneResolution: 200,       // min distance drone can move, in mm
    dronePrecisionError: 150,   // error margin, mm
    droneFlyingSpeed: 0.3,  // average drone flying speed [m/s],
    minimumImageSize: [10, 10]
  },
  blockchainSettings: {
    ae_uat: 'ct_ycM9PMNRCg6tvaZTvtrYBpVrsahtCgLoNhiZL9UVUBxJ3wWiQ', // testnet //ct_2SugvqB52guEV6fSTkuGjipzPMjeEf5urYQYnPe91cdkMmjJGy
    ae_mainnet: 'ct_ycM9PMNRCg6tvaZTvtrYBpVrsahtCgLoNhiZL9UVUBxJ3wWiQ' // 'ct_2P2vEqq3WQz6kzKLJFoqBbm46EMot64WvpP1xpvvANApLWcwnt';
  },
  apiUrl: API_URL
}
