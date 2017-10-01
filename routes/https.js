const express = require('express')
const path = require('path')
const router = express.Router()

if (process.env.PORT) {
  router.get('*', (req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      res.redirect('https://' + req.get('host') + req.url)
    } else {
      next()
    }
  })
}

module.exports = router
