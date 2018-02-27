var webpack = require('webpack');
var path = require('path');

module.exports = {
  entry: [
    './src/swiftype_app_search.js'
  ],
  output: {
    path: path.join(__dirname, 'public'),
    filename: 'bundle.js',
    library: 'SwiftypeAppSearch',
    libraryTarget: 'umd'
  },
  externals: {
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  module: {
    rules: [{
      test: /\.jsx?$/,
      exclude: /node_modules/,
      use: [
        {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                'es2015',
                {
                  loose: true
                }
              ]
            ]
          }
        }
      ]
    }]
  },
  plugins: [
  ]
};
