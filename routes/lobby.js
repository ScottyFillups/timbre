const express = require('express')
const path = require('path')
const router = express.Router()

router.get('/', function sendLobbyPage (req, res) {
  res.sendFile(path.join(__dirname, '../views/index.html'))
})

module.exports = router
