var express = require('express');
var klaytnsori = express.Router();
var membership = require('./membership/membership');
var userInfo = require('./userInfo/userInfo');
var question = require('./question/question');

klaytnsori.use('/membership', membership);
klaytnsori.use('/userInfo', userInfo);
klaytnsori.use('/question', question);

module.exports = klaytnsori;
