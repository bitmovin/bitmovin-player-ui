const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const replacer = require('replacer-util').replacer;
const util = require('util');
const exec = util.promisify(require('child_process').exec);

const OUTPUT_ROOT_DIRECTORY = 'dist';

// You can customize the output names and css prefix by passing environment variables to the build script, e.g.:
// ```
// OUTPUT_NAMESPACE=my.custom.namespace OUTPUT_FILENAME=my-custom-filename OUTPUT_CSS_PREFIX=mycssprefix npm run build:prod
// ```
const outputnames = {
  globalNamespace: process.env.OUTPUT_NAMESPACE || 'bitmovin.playerui',
  filename: process.env.OUTPUT_FILENAME || 'bitmovinplayer-ui',
  cssPrefix: process.env.OUTPUT_CSS_PREFIX || 'bmpui',
};

const globalNamespaceArray = outputnames.globalNamespace.split('.');

module.exports = (env, { mode }) => {
  return {
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
    devtool: 'source-map',
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
                    mode === 'production' ? require('cssnano')({ preset: 'default' }) : null, // only minify css in production mode
                  ],
                },
              },
            },
            {
              loader: 'sass-loader',
              options: {
                additionalData: `$prefix: ${outputnames.cssPrefix};`, // overrides the default `prefix` variable in _variables.scss
              },
            },
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
      {
        apply: compiler => {
          compiler.hooks.done.tapAsync('CreateUiFrameworkFilesPlugin', async compilation => {
            await createJavascriptUiFrameworkFilesWithReplacedPrefix();
          });
        },
      },
    ],
    resolve: {
      extensions: ['.ts', '.js', '.scss', '.css'],
    },
    output: {
      path: path.resolve(__dirname, OUTPUT_ROOT_DIRECTORY),
      publicPath: '',
      clean: true,
    },
    devServer: {
      static: {
        directory: path.join(__dirname, OUTPUT_ROOT_DIRECTORY),
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
};

async function createJavascriptUiFrameworkFilesWithReplacedPrefix() {
  await exec('npx tsc'); // run the typescript compiler to generate the dist-tsc folder
  const options = {
    templatingOn: false, // disable liquid syntax to avoid issues with {{ and }}
    find: '{{PREFIX}}',
    replacement: outputnames.cssPrefix,
  };

  replacer.transform(`${OUTPUT_ROOT_DIRECTORY}/js/framework`, `${OUTPUT_ROOT_DIRECTORY}/js/framework`, options);
}
