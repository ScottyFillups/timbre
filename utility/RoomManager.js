function RoomManager (room, address) {
  this._room = room
  this._address = address
  
  let isInitiator = this._isInitiator()
  
  this._room.on('connection', (socket) => {
    console.log('connection')
    socket.on('p2p signal', function (signal) {
      console.log('p2p signalling')
      socket.broadcast.emit('p2p signal', signal)
    })
    this._room.clients((error, clients) => {
      if (clients.length > 2) {
        socket.emit('room full')
      } 
      else if (clients.length === 2) {
        socket.emit('get initiator', false)
        socket.broadcast.emit('get initiator', true)
      }
    })
  })
}

RoomManager.prototype = {
  _isInitiator: function () {
    let b = false
    return function () {
      b = !b
      return b
    }
  },
}

module.exports = RoomManager
