const express = require('express')
const developerFront = require('./api/developer-front')

const app = express();

app.use('/spider/developer-front', developerFront)

module.exports = app