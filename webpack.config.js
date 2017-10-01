const path = require('path')

module.exports = {
  entry: {
    lobby: './client/lobby.js',
    room: './client/room.js'
  },
  output: {
    filename: '[name].bundle.js',
    path: path.join(__dirname, './public/js')
  },
  devtool: 'inline-source-map'
}
