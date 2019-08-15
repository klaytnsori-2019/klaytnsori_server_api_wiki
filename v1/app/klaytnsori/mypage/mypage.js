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
  var userSession = req.query.session_id;
  //DB에서 session_id를 받아서 해당 유저의 account address 반환
  var userAccount = db.noname(userSession);
  var data = {
    account_address : userAccount
  };
  return res.json(result.successTrue(data));
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
  var userSession = req.query.session_id;

  //DB에서 세션 아이디로 해당 유저의 block리스트와 계좌를 반환
  var userTransaction = db.transaction(userSession);
  //caver에서 block리스트와 유저 계좌보내면 트랜잭션 리스트를 보내줌
  for(var i = 0; i < userTransaction.block_num.length; i++)
  {

  }

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
  //DB에서 세션아이디로 해당 유저의 질문을 제목,내용,클레이양, 카테고리, 상태를 리스트로 반환


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
  //DB에서 세션아이디로 해당 유저의 질문을 제목, 상태, 답변 내용을 리스트로 반환

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
  //DB에서 세션아이디로 해당 유저의 질문 제목, 답변 내용, like수를 리스트로 반환
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
  //DB에서 해당 세션으로 계좌 반환

  //caver에서 계좌로 klay양 반환

});

module.exports = mypage;
