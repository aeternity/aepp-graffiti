const path = require('path')
module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        // use this if you are installing the SDK as dependency
        AE_SDK_MODULES: path.resolve(__dirname, 'node_modules/@aeternity/aepp-sdk/es/')
        // use this, if you are running this app from inside the Aepp-SDK repo/folder
        // AE_SDK_MODULES: '../../../../../es/'
      }
    },
    devtool: 'source-map'
  }
}
