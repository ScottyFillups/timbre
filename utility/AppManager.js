const RoomManager = require('./RoomManager')

function AppManager (io) {
  this._rooms = {}
  this._io = io
}
AppManager.prototype = {
  genRoom: function (address) {
    let room = this._io.of('/' + address)
    this._rooms[address] = new RoomManager(room, address)
  },
  roomExists: function (address) {
    return this._rooms[address] !== undefined
  }
}

module.exports = AppManager
