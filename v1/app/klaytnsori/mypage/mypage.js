var express = require('express');
var mypage = express.Router();
var result = require('./../../../../result');

/*
*mypage API
*Request
*session_id : Get user's information at DB
*Response
*account_address : Return user's account address from DB.
*/
mypage.get('/',function(req,res,next){
  var isValid = true;
  var validationError = {
    name : 'ValidationError',
    errors : {}
  };

  if(!req.query.session_id){
    isVlid = false;
    validationError.errors.session_id = { message : 'Session Error'};
  }

  if(!isValid) return res.json(result.successFalse(validationError));
  else next();
}, function(req, res){
  var _session = req.query.session_id;

});
/*
*transaction API
*Request
*session_id : Get user's information at DB
*Response
*klay : User send klay amount for each
*trans_time : User send klay time for each
*trans_content : User send klay content for each
*recipient_address User send to Where for each
*/
mypage.get('/transaction', function(req,res,next){
  var isValid = true;
  var validationError = {
    name : 'ValidationError',
    errors : {}
  };

  if(!req.query.session_id){
    isVlid = false;
    validationError.errors.session_id = { message : 'Session Error'};
  }

  if(!isValid) return res.json(result.successFalse(validationError));
  else next();
}, function(req,res,next){
  var _session = req.query.session_id;

});

/*
*my_question_list API
*Request
*session_id : Get user's qusetion information at DB
*Response
*question_title : User inserted question title
*question_content : User inserted question content
*question_klay : User inserted question klay amount
*category : User inserted question category
*question_state : Present state
*/
mypage.get('/my_question_list', function(req,res,next){
  var isValid = true;
  var validationError = {
    name : 'ValidationError',
    errors : {}
  };
  if(!req.query.session_id){
    isVlid = false;
    validationError.errors.session_id = { message : 'Session Error'};
  }
  if(!isValid) return res.json(result.successFalse(validationError));
  else next();
}, function(req,res,next){
  var session_id = req.query.session_id;

});

/*
*my_answer_list API
*Request
*session_id : Get user's answer information at DB
*Response
*question_title : Question's title that user inserted answer
*question_state : Question's state that user inserted answer
*answer_content : Qusetion's answer content that user inserted
*/
mypage.get('/my_answer_list', function(req,res,next){
  var isValid = true;
  var validationError = {
    name : 'ValidationError',
    errors : {}
  };

  if(!req.query.session_id){
    isVlid = false;
    validationError.errors.session_id = { message : 'Session Error'};
  }

  if(!isValid) return res.json(result.successFalse(validationError));
  else next();
}, function(req,res,next){
  var session_id = req.query.session_id;


});

/*
*my_like_list API
*Request
*session_id : Get user's like information at DB
*Response
*question_title : Question's title that user inserted answer
*answer_content : Qusetion's answer content that user inserted
*like_count : Question's like amount
*/
mypage.get('/my_like_list', function(req,res,next){
  var isValid = true;
  var validationError = {
    name : 'ValidationError',
    errors : {}
  };

  if(!req.query.session_id){
    isVlid = false;
    validationError.errors.session_id = { message : 'Session Error'};
  }

  if(!isValid) return res.json(result.successFalse(validationError));
  else next();
}, function(req,res,next){
  var session_id = req.query.session_id;

});

/*
*my_remain_klay API
*Request
*session_id : Get user's klay amount information at caver
*Response
*klay : User's klay amount
*/
mypage.get('/my_remain_klay', function(req,res,next){
  var isValid = true;
  var validationError = {
    name : 'ValidationError',
    errors : {}
  };

  if(!req.query.session_id){
    isVlid = false;
    validationError.errors.session_id = { message : 'Session Error'};
  }

  if(!isValid) return res.json(result.successFalse(validationError));
  else next();
}, function(req,res,next){
  var session_id = req.query.session_id;

});

module.exports = mypage;
