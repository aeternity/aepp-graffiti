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

module.exports = env => {
  return {
    mode: env.NODE_ENV === 'prod' ? 'production' : 'development',
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
      disableHostCheck: true,
      host: '0.0.0.0'
    },
    devtool: env.NODE_ENV === 'prod' ? '' : 'eval-source-map',
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
            path.resolve(__dirname, "node_modules/@download/blockies")
          ],
          loader: 'babel-loader'
        },
        // this will apply to both plain `.css` files
        // AND `<style>` blocks in `.vue` files
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
}
