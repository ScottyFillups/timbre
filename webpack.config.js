const path = require('path')

module.exports = {
  entry: {
    app: './src/index.js'
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist'
  },
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'dist/js')
  }
  // socket.io webpack bug
  /* module: {
    noParse: ['ws'],
  },
  externals: ['ws'] */
}
