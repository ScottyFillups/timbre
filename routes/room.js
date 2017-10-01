const express = require('express')
const path = require('path')
const router = express.Router()

function getRouter (appManager) {
  let router = express.Router()
  router.get('/:room', function sendRoomPage (req, res) {
    let address = req.params.room
    if (appManager.roomExists(address)) {
      res.sendFile(path.join(__dirname, '../views/room.html'))
    } else {
      res.sendFile(path.join(__dirname, '../views/error.html'))
    }
  })
  return router
}

module.exports = getRouter
