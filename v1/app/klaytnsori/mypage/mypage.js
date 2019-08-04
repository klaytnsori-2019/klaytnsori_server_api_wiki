var express = require('express');
var mypage = express.Router();
var result = require('./../../../../result');

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
  var u_wallet_address;
  //DB에서 해당 session_id로 들어온 사용자의 email을 확인 후 caver로 거래 내역 조회

  var u_klay;
  var u_trans_time;
  var u_trans_content;
  var u_recipient_address;
  var data = {
    klay : u_klay,
    trans_time : u_trans_time,
    trans_content : u_trans_content,
    recipient_address : u_recipient_address
  };
  return res.json(result.successTrue(data));
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
  //DB에서 해당 유저의 질문을 가져옴

  return res.json(result.successTrue(rows));
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
  //DB에서 해당 유저의 답변을 가져옴

  return res.json(result.successTrue(rows));
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
  //DB에서 해당 유저의 like를 가져옴

  return res.json(result.successTrue(rows));
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
  //DB에서 해당 유저의 wallet의 정보를 가져옴


  var u_wallet_address;
  //var u_klay = caver.klay.getBalance('u_wallet_address');
  //큰 따음표일 수 있다.

  var data = {
    klay : u_klay
  };
  return res.json(result.successTrue(data));
});

module.epxorts = mypage;
