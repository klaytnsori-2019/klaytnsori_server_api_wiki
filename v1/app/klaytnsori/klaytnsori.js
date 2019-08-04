var express = require('express');
var klaytnsori = express.Router();
var membership = require('./membership/membership');

klaytnsori.use('/membership', membership);

module.exports = klaytnsori;
