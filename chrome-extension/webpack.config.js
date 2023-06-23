
const path = require('node:path');

module.exports = {
  entry: './src/content.ts',
  target: 'web',
  output: {
    path: path.join(__dirname, 'scripts'),
    filename: 'content.js',
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              ['@babel/preset-env', { targets: "defaults" }],
              '@babel/preset-typescript',
            ],
          }
        }
      }
    ]
  }
}

