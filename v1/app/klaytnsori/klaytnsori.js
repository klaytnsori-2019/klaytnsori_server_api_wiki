var express = require('express');
var klaytnsori = express.Router();
var membership = require('./membership/membership');
var mypage = require('./mypage/mypage');
var question = require('./question/question');

klaytnsori.use('/membership', membership);
klaytnsori.use('/mypage', mypage);
klaytnsori.use('/question', question);

module.exports = klaytnsori;
