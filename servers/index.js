const express = require('express')
const developerFront = require('./app/developer-front')

const app = express();

app.use('/developer-front', developerFront)

module.exports = app