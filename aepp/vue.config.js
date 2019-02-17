module.exports = {
  configureWebpack: {
    devtool: 'source-map',
    devServer: {
      port: 8081
    }
  },
  transpileDependencies: ['@aeternity/aepp-sdk']
}
