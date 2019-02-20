const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin')
// Cleans dist folder before building for fresh build
const CleanWebpackPlugin = require('clean-webpack-plugin')
const { VueLoaderPlugin } = require('vue-loader')
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const PurgecssPlugin = require('purgecss-webpack-plugin')
let glob = require('glob-all')

const distFolder = path.resolve(__dirname, 'dist')

// Custom PurgeCSS extractor for Tailwind that allows special characters in
// class names.
//
// https://github.com/FullHuman/purgecss#extractor
class TailwindExtractor {
  static extract (content) {
    return content.match(/[A-z0-9-:\/]+/g) || []
  }
}

module.exports = {
  mode: process.env.NODE_ENV === 'prod' ? 'production' : 'development',
  resolve: {
    extensions: ['.vue', '.css', '.js'],
    alias: {
      '~': path.resolve(__dirname, './src/')
    }
  },
  node: {
    fs: 'empty'
  },
  entry: {
    'main': './src/main.js'
  },
  output: {
    filename: 'bundle.js?[hash]',
    publicPath: '/'
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    port: 8081,
    historyApiFallback: true,
    allowedHosts: [
      '192.168.1.16',
      'localhost'
    ]
  },
  devtool: process.env.NODE_ENV === 'prod' ? '' : 'eval-source-map',
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      // chunks: ['main'],
      title: 'Æpp Drone Aepp',
      template: './src/index.html',
      filename: distFolder + '/index.html',
      // Avoids building twice for dev
      alwaysWriteToDisk: true
    }),
    new PurgecssPlugin({
      // Specify the locations of any files you want to scan for class names.
      paths: glob.sync([
        path.join(__dirname, './src/**/*.vue'),
        path.join(__dirname, './src/index.html')
      ]),
      extractors: [
        {
          extractor: TailwindExtractor,
          // Specify the file extensions to include when scanning for
          // class names.
          extensions: ['html', 'js', 'vue']
        }
      ]
    }),
    new HtmlWebpackHarddiskPlugin(),
    new CleanWebpackPlugin([distFolder]),
    new VueLoaderPlugin()
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: [/node_modules/],
        include: [/node_modules\/@aeternity/, /node_modules\/rlp/],
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: [
          'vue-style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              config: {
                path: 'postcss.config.js'
              }
            }
          }
        ]
      },
      // allows vue compoents in '<template><html><script><style>' syntax
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: {
            js: 'babel-loader!standard-loader?error=true'
          }
          // extractCSS: true
          // other vue-loader options go here
        }
      },
      {
        test: /\.scss$/,
        use: [
          'vue-style-loader',
          'css-loader', // translates CSS into CommonJS
          'sass-loader' // compiles Sass to CSS, using Node Sass by default
        ]
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'assets/'
          }
        }]
      }
    ]
  }
}
