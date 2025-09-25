const path = require('path');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

/** Modify this to your needs */
const outputnames = {
  globalNamespace: process.env.OUTPUT_NAMESPACE || 'bitmovin.playerui',
  filename: process.env.OUTPUT_FILENAME || 'bitmovinplayer-ui',
  cssPrefix: process.env.OUTPUT_CSS_PREFIX || 'bmpui',
};

const globalNamespaceArray = outputnames.globalNamespace.split('.');

module.exports = {
  entry: {
    [outputnames.filename]: {
      import: ['./src/scss/bitmovinplayer-ui.scss', './src/ts/main.ts'],
      filename: './js/[name].js',
      library: {
        type: 'umd',
        name: {
          amd: '[name]',
          commonjs: '[name]',
          root: globalNamespaceArray,
        },
      },
    },
    demo: './src/scss/demo.scss',
  },
  module: {
    rules: [
      {
        test: /\.ts?$/,
        loader: 'string-replace-loader',
        enforce: 'pre',
        exclude: /node_modules/,
        options: {
          multiple: [
            { search: '{{VERSION}}', replace: JSON.stringify(require('./package.json').version), flags: 'g' },
            { search: '{{PREFIX}}', replace: outputnames.cssPrefix, flags: 'g' },
          ],
        },
      },
      {
        test: /\.ts?$/,
        use: [
          {
            loader: 'ts-loader',
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.svg$/i,
        type: 'asset/inline',
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {
              esModule: false,
            },
          },
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  [
                    'postcss-preset-env', // already includes autoprefixer
                  ],
                ],
              },
            },
          },
          'sass-loader',
        ],
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: './css/[name].css',
      runtime: false,
    }),
    new HtmlWebpackPlugin({
      template: './src/html/index.html',
      filename: './index.html',
      inject: false,
      minify: false,
    }),
    new HtmlWebpackPlugin({
      template: './src/html/simple.html',
      filename: './simple.html',
      inject: false,
      minify: false,
    }),
  ],
  resolve: {
    extensions: ['.ts', '.js', '.scss', '.css'],
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '',
    clean: true,
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    port: 9000,
    hot: true,
    client: {
      overlay: {
        errors: true,
        warnings: true,
      },
    },
  },
  target: ['web', 'es5'],
};
