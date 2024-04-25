const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
// Cleans dist folder before building for fresh build
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const {VueLoaderPlugin} = require('vue-loader');

const FaviconsWebpackPlugin = require('favicons-webpack-plugin');

const distFolder = path.resolve(__dirname, 'dist');

module.exports = {
  resolve: {
    extensions: ['.vue', '.css', '.js'],
    alias: {
      '~': path.resolve(__dirname, 'src')
    }
  },
  node: {
    fs: 'empty'
  },
  entry: {
    'main': path.resolve(__dirname, 'src/main.js')
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: './src/index.html',
      domain: 'https://graffiti.aeternity.com',
      // Avoids building twice for dev
      alwaysWriteToDisk: true
    }),
    new HtmlWebpackHarddiskPlugin(),
    new CleanWebpackPlugin(),
    new VueLoaderPlugin(),
    new FaviconsWebpackPlugin({
      logo: path.resolve(__dirname, 'src/assets/0_DGP_Logo_rainbow_black.svg'),
      mode: 'webapp', // optional can be 'webapp' or 'light' - 'webapp' by default
      devMode: 'webapp', // optional can be 'webapp' or 'light' - 'light' by default
      publicPath: '/',
      favicons: {
        start_url: '/',
        appName: 'Graffiti',
        appDescription: 'Draw your own graffiti on the blockchain.',
        developerName: 'Aeternity Developers',
        developerURL: 'https://github.com/aeternity/aepp-graffiti',
        background: '#ff0d6a',
        theme_color: '#ff0d6a',
        icons: {
          coast: false,
          yandex: false,
          windows: false
        }
      }
    })
  ],
  module: {
    rules: [
      // this will apply to both plain `.js` files
      // AND `<script>` blocks in `.vue` files
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, "src"),
          path.resolve(__dirname, "node_modules/@aeternity"),
          path.resolve(__dirname, "node_modules/rlp"),
          // Contains "const" or "let"
          path.resolve(__dirname, "node_modules/base-x"),
          path.resolve(__dirname, "node_modules/@jimp/core"),
          path.resolve(__dirname, "node_modules/dronetracer"),
          path.resolve(__dirname, "node_modules/vuex-persist"),
          path.resolve(__dirname, "node_modules/file-type"),
        ],
        loader: 'babel-loader'
      },
      {
        type: 'javascript/auto',
        test: /\.mjs$/,
        include: [
          path.resolve(__dirname, "node_modules/@download/blockies"),
          path.resolve(__dirname, "node_modules/@aeternity/aepp-sdk")
        ],
        loader: 'babel-loader'
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
        test: /\.aes$/,
        use: [
          'raw-loader',
        ]
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg|jpg|png|gif)(\?v=\d+\.\d+\.\d+)?$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
            outputPath: 'assets/',
            esModule: false
          }
        }]
      }
    ]
  }
};
