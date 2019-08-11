var express = require('express');
var mypage = express.Router();
var result = require('./../../../../result');
var Caver = require('caver-js');
var caver = new Caver('https://api.baobab.klaytn.net:8651/');
var db = require('./../../../../database.js');

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
  var b_list = new Array();
  //DB에서 해당 session_id로 들어온 사용자의 email을 확인 후 caver로 거래 내역 조회

  var data = new Array();
  for(var i = 0 ; i < b_list.length ; i++)
  {
    data[i] = caver.klay.getBlock(b_list[i]);
  }
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
  db.klaytndb.connect();
  var session_id = req.query.session_id;
  var params = [session_id];
  var sql = "SELECT email FROM userSession WHERE session_id = ?";
  db.klaytndb.query(sql, params, function(err, rows, fields){
    if(err) return res.json(result.successFalse(err));
    else{
      var params2 = [result[0].email];
      var sql2 = "SELECT question.question_title, question.question_content, question.klay, category.category FROM question JOIN category WHERE question.email = ? AND question.category_num = category.category_num";
      db.klaytndb.query(sql2, params2, function(err, rows, fields){
        if (err) return res.json(result.successFalse(err));
        else{
          db.klaytndb.end();
          return res.json(result.successTrue(rows));
        }
      });
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
  db.klaytndb.connect();
  var session_id = req.query.session_id;
  var params = [session_id];
  var sql = "SELECT email FROM userSession WHERE session_id = ?";
  klaytndb.query(sql, params, function(err, rows, fields){
  if (err) return res.json(result.successFalse(err));
  else{
    var params2 = [result[0].email];
    var sql2 = "SELECT question.question_title ,answer.answer_content, answer.is_selected FROM question JOIN answer ON answer.email = ?";
    db.klaytndb.query(sql2, params2, function(err, rows, fields){
      if(err) return res.json(result.successFalse(err));
      else{
        db.klaytndb.end();
        return res.json(result.successTrue(rows));
      }
    });
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
  db.klaytndb.connect();
  var session_id = req.query.session_id;
  var params = [session_id];
  var sql = "SELECT email FROM userSession WHERE session_id = ?";
  db.klaytndb.query(sql, params, function(err, rows, fields){
    if(err) return res.json(result.successFalse(err));
    else{
      var params2 = [result[0].email];
      var sql2 = "SELECT question_num, answer_num FROM userLike WHERE email = ?";
      db.klaytndb.query(sql2, params2, function(err, rows, fields){
        if(err) return res.json(result.successFalse(err));
        else{
          db.klaytndb.end();
          return res.json(result.successTrue(rows));
        }
      });
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
  db.klaytndb.connect();
  var session_id = req.query.session_id;
  var params = [session_id];
  var sql = "SELECT email FROM userSession WHERE session_id = ?";
  db.klaytndb.query(sql, params, function(err, rows, fields){
    if(err) return res.json(result.successFalse(err));
    else{
      var params2 = [result[0].email];
      var sql2 = "SELECT wallet_address FROM userInfo WHERE email = ?";
      db.klaytndb.query(sql2, params2, function(err, rows, fields){
        if(err) return res.json(result.successFalse(err));
        else{
          var u_account_address = rows[0].wallet_address;
          var u_klay = caver.klay.getBalance('u_account_address');
          var data = {
            klay : u_klay
          };
          db.klaytndb.end();
          return res.json(result.successTrue(data));
        }
      });
     }
  });
});

module.exports = mypage;
