var express = require('express');
var userInfo = express.Router();
var result = require('./../../../../result');
var caver = require('../caver/MypageCaver.js');
var db = require('./../../../../klaytndb.js');
var translateTime = require('./../translateTime.js');

/*
*userInfo API
*Request
*session_id : Get user's information at DB
*Response
*account_address : Return user's account address from DB.
*/
userInfo.get('/',function(req,res,next){
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
  db.getWalletaddressAndPK(userSession, (rows)=>{
    if(rows==false){
      var dbError = {
          "name": 'DB',
          "errors": {}
      };
      dbError.errors.db = { message: 'Cannot find user in userSession table' };
      return res.json(result.successFalse(dbError));
    }
    else{
      var userAccount = rows[0].wallet_address;
      var data = {
        account_address : userAccount
      };
      return res.json(result.successTrue(data));
    }
  });
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
userInfo.get('/transaction', function(req,res,next){
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
  //caver에서 block리스트와 유저 계좌보내면 트랜잭션 리스트를 보내줌
  db.showTransaction(userSession, (rows)=>{
    if(rows == false){
      var dbError = {
          "name": 'DB',
          "errors": {}
      };
      dbError.errors.db = { message: 'Cannot find transactionList in transaction table' };
      return res.json(result.successFalse(dbError));
    }
    else{
      var transactionList = new Array;
      for(var j = 10 in rows){
        transactionList.push(rows[j].transaction);
      }
      caver.showTransactions(transactionList).then((transactions)=>{
        for(var i in transactions){
          var transactionHexTime = transactions[i].timestamp;
          var transactionUnixTime = parseInt(transactionHexTime, 16);
          transactions[i].timestamp = translateTime.translateDate(transactionUnixTime);
          transactions[i].value = caver.translateKlay(parseInt(transactions[i].value, 16));
        }
        return res.json(result.successTrue(transactions));
      });
    }
  });
});

/*
*my_question_list API
*Request
*session_id : Get user's qusetion information at DB
*Response
*question_id : question number
*question_title : User inserted question title
*question_content : User inserted question content
*question_klay : User inserted question klay amount
*category : User inserted question category
*question_state : Present state
*/
userInfo.get('/my_question_list', function(req,res,next){
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
  //DB에서 세션아이디로 해당 유저의 질문을 제목,내용,클레이양, 카테고리, 상태를 리스트로 반환
  db.myQuestionList(userSession, (rows)=>{
    if(rows == false){
      var dbError = {
          "name": 'DB',
          "errors": {}
      };
      dbError.errors.db = { message: 'Cannot find my questions in question table' };
      return res.json(result.successFalse(dbError));
    }
    else{
      for(var i in rows){
        var rowsTime = rows[i].time;
        rows[i].time = translateTime.translateDate(rowsTime/1000);
      }
      return res.json(result.successTrue(rows));
    }
  });
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
userInfo.get('/my_answer_list', function(req,res,next){
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
  //DB에서 세션아이디로 해당 유저의 질문을 제목, 상태, 답변 내용을 리스트로 반환
  db.myAnswerList(userSession, (rows)=>{
    if(rows == false){
      var dbError = {
          "name": 'DB',
          "errors": {}
      };
      dbError.errors.db = { message: 'Cannot find my answers in answer table' };
      return res.json(result.successFalse(dbError));
    }
    else{
      return res.json(result.successTrue(rows));
    }
  });
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
userInfo.get('/my_like_list', function(req,res,next){
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
  //DB에서 세션아이디로 해당 유저의 질문 제목, 답변 내용, like수를 리스트로 반
  db.myLikeList(userSession, (rows)=>{
    if(rows == false){
      var dbError = {
          "name": 'DB',
          "errors": {}
      };
      dbError.errors.db = { message: 'Cannot find my like in like table' };
      return res.json(result.successFalse(dbError));
    }
    else{
      return res.json(result.successTrue(rows));
    }
  });
});

/*
*my_remain_klay API
*Request
*session_id : Get user's klay amount information at caver
*Response
*klay : User's klay amount
*/
userInfo.get('/my_remain_klay', function(req,res,next){
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
  db.myRemainKlay(userSession,(rows)=>{
    if(rows == false){
      var dbError = {
          "name": 'DB',
          "errors": {}
      };
      dbError.errors.db = { message: 'Cannot find session id in session table' };
      return res.json(result.successFalse(dbError));
    }
    else{
      var userAccount = rows[0].wallet_address;
      var klay = caver.showMyKlay(userAccount).then((klay)=>{
        var data = {
          "Klay" : klay
        };
        return res.json(result.successTrue(data));
      });
    }
  });
});

module.exports = userInfo;
