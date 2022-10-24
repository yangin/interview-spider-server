const express = require('express')
const app = express()

app.get('/', function (req, res) {
  res.send('Admin Homepage')
})

module.exports = app
