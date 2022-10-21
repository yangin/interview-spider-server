const express = require('express')
const app = express()

app.get('/', function (req, res) {
  res.send('Admin Homepage')
})

app.get('/user', function (req, res) {
  res.send('Admin User Page')
})

module.exports = app
