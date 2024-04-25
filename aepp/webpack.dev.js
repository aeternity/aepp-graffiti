const merge = require('webpack-merge')
const common = require('./webpack.common.js')

const path = require('path')
const webpack = require('webpack')

module.exports = merge(common, {
  plugins: [
    new webpack.DefinePlugin({
      'process.env.MAINNET_SERVER_URL': JSON.stringify(process.env.MAINNET_SERVER_URL || 'https://graffiti-server-mainnet.prd.aepps.com'),
      'process.env.TESTNET_SERVER_URL': JSON.stringify(process.env.TESTNET_SERVER_URL ||'https://graffiti-server-testnet.prd.aepps.com')
    })
  ],
  mode: 'development',
  devtool: 'eval-source-map',
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    port: 8081,
    historyApiFallback: true,
    disableHostCheck: true,
    host: 'localhost'
  },
  output: {
    filename: 'bundle.js?[hash]',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: [
                require('postcss-import'),
                require('tailwindcss'),
                require('autoprefixer'),
              ]
            }
          }
        ]
      }
    ]
  }
})
