const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')
require('dotenv').config()
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin')
const { extendDefaultPlugins } = require('svgo')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const devMode = process.env.NODE_ENV === 'development'
const CompressionPlugin = require('compression-webpack-plugin')
const zlib = require('zlib')

module.exports = () => ({
  entry: './src/index.js',
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      react: 'preact/compat',
      'react-dom': 'preact/compat',
      actions: path.resolve(__dirname, 'src/actions'),
      helpers: path.resolve(__dirname, 'src/helpers'),
      pages: path.resolve(__dirname, 'src/pages'),
      styles: path.resolve(__dirname, 'src/styles'),
      utils: path.resolve(__dirname, 'src/utils'),
      assets: path.resolve(__dirname, 'src/assets'),
      components: path.resolve(__dirname, 'src/components'),
      zaruDashboard: path.resolve(__dirname, 'src/components/zaruDashboard'),
    },
  },
  output: {
    path: path.resolve('../Rsi.Web/src/Rsi.Web/wwwroot/dist/react/'),
    publicPath: devMode ? '/' : '/dist/react/',
    chunkFilename: '[name].bundle.js',
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules|highcharts/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true,
            },
          },
          // {
          //   loader: 'source-map-loader',
          // },
        ],
      },
      {
        // Now we apply rule for images
        test: /\.(png|jpe?g|gif|svg)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[ext]',
              outputPath: 'images/',
              // publicPath: devMode
              //   ? process.env.PUBLIC_PATH_DEV + "/images"
              //   : process.env.PUBLIC_PATH_PROD + "/images",
            },
          },
        ],
      },
      {
        // Apply rule for fonts files
        test: /\.(woff|woff2|ttf|otf|eot)$/,
        use: [
          {
            // Using file-loader too
            loader: 'file-loader',
            options: {
              outputPath: 'fonts',
            },
          },
        ],
      },
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          devMode ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          // "postcss-loader",
          'sass-loader',
        ],
      },
    ],
    // noParse: [/moment.js/],
  },
  plugins: [
    // new BundleAnalyzerPlugin(),
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
    new webpack.DefinePlugin({
      // this might expose confidential data about your environment
      'process.env': JSON.stringify(process.env),
      'process.env.NODE_ENV': JSON.stringify(
        process.env.NODE_ENV || 'development',
      ),
      // the correct way
      'process.env.REACT_APP_SECRET_KEY': JSON.stringify(
        process.env.REACT_APP_SECRET_KEY,
      ),
      'process.env.REACT_APP_API_URL': JSON.stringify(
        process.env.REACT_APP_API_URL ?? '',
      ),
      'process.env.REACT_APP_BASE_URL': JSON.stringify(
        process.env.REACT_APP_BASE_URL,
      ),
    }),
    new LodashModuleReplacementPlugin(),
    new webpack.optimize.ModuleConcatenationPlugin(),
    new webpack.optimize.MinChunkSizePlugin({
      minChunkSize: 10000, // Minimum number of characters
    }),
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 5,
    }),
    new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /ja|it/),
    new ImageMinimizerPlugin({
      minimizerOptions: {
        // Lossless optimization with custom option
        // Feel free to experiment with options for better result for you
        plugins: [
          ['gifsicle', { interlaced: true }],
          ['jpegtran', { progressive: true }],
          ['optipng', { optimizationLevel: 5 }],
          // Svgo configuration here https://github.com/svg/svgo#configuration
          [
            'svgo',
            {
              plugins: extendDefaultPlugins([
                {
                  name: 'removeViewBox',
                  active: false,
                },
                {
                  name: 'addAttributesToSVGElement',
                  params: {
                    attributes: [{ xmlns: 'http://www.w3.org/2000/svg' }],
                  },
                },
              ]),
            },
          ],
        ],
      },
    }),
    new CompressionPlugin({
      filename: '[path][base].br',
      algorithm: 'brotliCompress',
      // test: /\.(js|jsx|css|html|svg)$/,
      compressionOptions: {
        params: {
          [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
        },
      },
      threshold: 1024,
      minRatio: 0.8,
      deleteOriginalAssets: false,
    }),
  ].concat(
    devMode
      ? []
      : [
          new MiniCssExtractPlugin({
            filename: '[name].css',
            chunkFilename: '[name].css',
            ignoreOrder: false, // Enable to remove warnings about conflicting order
          }),
        ],
  ),
  devServer: {
    open: true,
    port: 3000,
    hot: true,
    compress: true,
    historyApiFallback: true,
  },
  optimization: {
    minimize: !devMode,
    removeAvailableModules: true,
    removeEmptyChunks: true,
    mergeDuplicateChunks: true,
    flagIncludedChunks: true,
    providedExports: false,
    usedExports: false,
    concatenateModules: true,
    minimizer: [
      // For webpack@5 you can use the `...` syntax to extend existing minimizers (i.e. `terser-webpack-plugin`), uncomment the next line
      `...`,
      new CssMinimizerPlugin(),
    ],

    splitChunks: {
      cacheGroups: {
        defaultVendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10,
          reuseExistingChunk: true,
          name: 'default-vendors',
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true,
          name: 'default',
        },
        commons: {
          name: 'commons',
          chunks: 'initial',
          minChunks: 2,
        },
        highchartsVendor: {
          test: /[\\/]node_modules[\\/](highcharts|highcharts-more)[\\/]/,
          name: 'highcharts',
          chunks: 'all',
        },
        // abc: {
        //   test: /[\\/]node_modules[\\/](moment|lodash)[\\/]/,
        //   name: "abc",
        //   chunks: "all",
        // },
        // vendor: {
        //   test: /[\\/]node_modules[\\/](crypto-js|react-select)[\\/]/,
        //   name: "vendor",
        //   chunks: "all",
        // },
      },
    },
  },
  devtool: 'source-map',
})
