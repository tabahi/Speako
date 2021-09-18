const path = require('path');
const url = require('url');
const webpack = require('webpack');
var WebpackPwaManifest = require('webpack-pwa-manifest');
const WorkboxPlugin = require('workbox-webpack-plugin');


module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname),
    libraryTarget: 'var',
    library: 'Speako',
  },
  plugins: [
    new WebpackPwaManifest({
      name: 'Speako Web App',
      short_name: 'Speako',
      description: 'My awesome Speako!',
      background_color: '#ffffff',
      crossorigin: 'use-credentials', //can be null, use-credentials or anonymous
      icons: [
        {
          src: path.resolve('assets/apple-touch-icon.png'),
          sizes: [96, 128, 192, 256, 384, 512] // multiple sizes
        },
        {
          src: path.resolve('assets/android-chrome-512x512.png'),
          size: '512x512' // you can also use the specifications pattern
        },
        {
          src: path.resolve('assets/android-chrome-512x512.png'),
          size: '512x512',
          purpose: 'maskable'
        }
      ]
    }),
    new WorkboxPlugin.GenerateSW({
      // Do not precache images
      exclude: [/\.(?:png|jpg|jpeg|svg)$/],

      // Define runtime caching rules.
      runtimeCaching: [{
        // Match any request that ends with .png, .jpg, .jpeg or .svg.
        urlPattern: /\.(?:png|jpg|jpeg|svg)$/,

        // Apply a cache-first strategy.
        handler: 'CacheFirst',

        options: {
          // Use a custom cache name.
          cacheName: 'images',

          // Only cache 10 images.
          expiration: {
            maxEntries: 10,
          },
        },
      }],
    })


  ],
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