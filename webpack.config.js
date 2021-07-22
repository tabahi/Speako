const path = require('path');
const url = require('url');

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'var',
    library: 'Speako',
  },
  devServer: {
    host: '127.0.0.1',
    port: 8010,
    proxy: {
      '/api/': {
        target: 'http://127.0.0.1:8011',
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    },
    historyApiFallback: {
      index: url.parse('/index.htm').pathname
    }
  },
  mode : 'production',
};
/*

production
development


    mode : 'production',

    mode : 'development',
    devtool: 'inline-source-map',
*/