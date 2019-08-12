var express = require('express');
var v1 = express.Router();
var klaytnsori = require('./app/klaytnsori/klaytnsori');

v1.use('/app/klaytnsori', klaytnsori);

module.exports = v1;
