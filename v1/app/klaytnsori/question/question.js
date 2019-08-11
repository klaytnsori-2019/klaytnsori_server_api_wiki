var express = require('express');
var question = express.Router();
var result = require('./../../../../result');
var db = require('./../../../../database.js');
var Caver = require('caver-js');
var caver = new Caver('https://api.baobab.klaytn.net:8651/');
var klaytnsori_testContract = new caver.klay.Contract([{"constant":true,"inputs":[],"name":"getBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"test_owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_questionerAddress","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"deposit","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"_address","type":"address"},{"name":"_value","type":"uint256"}],"name":"setQuestionerBalance","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_address","type":"address"}],"name":"getQuestionerBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"}],'0x71EFcC18cC1baBEF01467dBD9e72286D802a272B');

/*
*category API
*Request
*Nothing
*Response
*category list - Bring all category list(data type int) at DB
*/
question.post('/category', function(req,res,next){
  db.klaytndb.connect();
  var sql = "SELECT * FROM category";
  db.klaytndb.query(sql, function(err, rows, fields){
    if(err) return res.json(result.successFalse(err));
    else{
      db.klaytndb.end();
      return res.json(result.successTrue(rows));
    }
  });
});

/*
*insert_question API
*Request
*session_id : Get user's information at DB
*question_title : Set question_tilte in DB
*question_klay : Set question_klay amount in DB
*qusetion_content : Set question_content in DB
*category : Set question_category in DB
*Response
*question_id : if success to insert in DB, return question_id. It will use show_question.
*/
question.post('/insert_question', function(req,res,next){
  var isValid = true;
  var validationError = {
    name : 'ValidationError',
    errors : {}
  };

  if(!req.body.session_id){
    isValid = false;
    validationError.errors.session_id = {message : 'Session Error' };
  }

  if(!req.body.question_title){
    isValid = false;
    validationError.errors.question_title = {message : 'Title is empty' };
  }

  if(!req.body.quetion_klay){
    isValid = false;
    validationError.errors.question_klay = {message : 'Klay is empty' };
  }

  if(!req.body.question_content){
    isValid = false;
    validationError.errors.question_content = {message : 'Content is empty' };
  }

  if(!req.body.category){
    isValid = false;
    validationError.errors.category = {message : 'Choose the category' };
  }

  if(!isValid) return res.json(result.successFalse(validationError));
  else next();
}, function(req,res,next){
  var u_sid = req.body.session_id;
  var u_address;
  //DB에서 해당 session_id로 email찾고 해당 user의 지갑주소를 가져온다.
  var q_klay = req.body.question_klay;
  var _gas = 300000;
  klaytnsori_testContract.methods.deposit().send({from : u_address, gas : _gas, value : q_klay});
  var b_num= caver.klay.getBlockNumber();
  var b_time = caver.klay.getBlock(b_num).timestamp;
  b_time = parseInt(b_time, 16);
  var trans_time = new Date(b_time * 1000);
  //이 부분에서 생각해야하는 것. getBlockNumber을 호출하게 되면 저장한 블록의 번호를 가져오는지!이게 가장 중요한 문제.
  //DB에 필요한 정보를 모두 저장 후 해당 질문의 id를 q_id에 저장.


  return res.json(result.successTrue(rows));
});

/*
*show_question API
*Request
*question_id : Bring question's information at DB.
*Response
*question_title : Set question_title using question_id
*question_klay : Set question_klay using question_id
*question_content : Set question_content using question_id
*question_date : Set question_date using question_id
*question_email : Set question_email using question_id
*question_state : Set question_state using question_id
*/
question.get('/show_question',function(req,res,next){
  var isValid = true;
  var validationError = {
    name : 'ValidationError',
    errors:{}
  };

  if(!req.query.question_id){
    isValid = false;
    validationError.errors.question_id = {message:'404 Not Found'};
  }

  if(!isValid) return res.json(result.successFalse(validationError));
  else next();
},function(req,res,next){
  db.klaytndb.connect();
  var question_num = req.query.question_id;
  var sql = "SELECT * FROM question WHERE question_num = ?";
  var params = [question_num];
  db.klaytndb.query(sql, params, function(err, rows, fields){
    if(err) return res.json(result.successFalse(err));
    else{
      db.klaytndb.end();
      return res.json(result.successTrue(rows));
    }
  });
});

/*
*question_list API
*Request
*category : Not essentially request. division questions using category
*sort_num : Not essentially request. division questions using sort_method
*keyword : Not essentially request. division questions using keyword
*question_state : Essentially request. division questions using question_state
*select_enable : if question_state is false, essentially request. division questions using select_enable
*Response
*question_id : return question's id
*category : return category
*question_title : return question's id
*question_reamin_date : return remain_date
*question_klay : return question's klay
*question_state : return question's state
*/
question.get('/question_list',function(req,res,next){
  var isValid = true;
  var validationError = {
    name : 'ValidationError',
    errors : {}
  };

  if(!req.query.question_state){
    isValid = false;
    validationError.errors.question_state = { message : '404 Not Found'};
  }
  if(req.query.question_state == false)
  {
    if(!req.query.select_enable)
    {
      isValid = false;
      validationError.errors.question_state = { message : '404 Not Found'};
    }
  }
  if(!isValid) return res.json(result.successFalse(validationError));
  else next();
}, function(req,res,next){
  var _enable = req.body.select_enable;
  var current_time = new Date().getTime();
  var date_limit = 604800;
  if(question_state){


    return res.json(result.successTrue(rows));
  }
  else{
    if(select_enable){

      return res.json(result.successTrue(rows));
    }
    else{

      return res.json(result.successTrue(rows));
    }
  }
});

/*
*insert_answer API
*Request
*question_id : When user inserts answer, mark where user inserts answer.
*session_id : Mark who insert answer
*answer_content : Insert table what user write answer.
*Response
*If success, return result = true.
*/
question.post('/insert_answer', function(req,res,next){
  var isValid = true;
  var validationError = {
    name : 'ValidationError',
    errors : {}
  };

  if(!req.body.question_id){
    isValid = false;
    validationError.errors.question_id = { message : '404 Not Found'};
  }

  if(!req.body.session_id){
    isValid = false;
    validationError.errors.session_id = { message : 'Session Error'};
  }

  if(!req.body.answer_content){
    isValid = false;
    validationError.errors.answer_content = { message : 'Answer is empty'};
  }

  if(!isValid) return res.json(result.successFalse(validationError));
  else next();
}, function(req,res,next){
  db.klaytndb.connect();
  var session_id = req.body.session_id;
  var answer_content = req.body.answer_content;
  var question_num = req.body.question_id;
  var sql = "SELECT count(*) as total FROM answer";
  db.klaytndb.query(sql, function(err, row, fields){
    if(err) return res.json(result.successFalse(err));
    else{
      row[0].total = row[0].total + 1;
      var sql2 = "SELECT email FROM userSession WHERE session_id = ?";
      var params2 = [session_id];
      db.klaytndb.query(sql2, params2, function(err, rows, fields){
        if(err) return res.json(result.successFalse(err));
        else{
          var sql3 = "INSERT INTO answer (answer_num, email, answer_content, question_num) VALUES (?, ?, ?, ?)";
          var params3 = [row[0].total, rows[0].email, answer_content, question_num];
          db.klaytndb.query(sql3, params3, function(err, rows, fields){
            if(err) return res.json(result.successFalse(err));
            else{
              db.klaytndb.end();
              var data = {};
              return res.json(result.successTrue(data));
            }
          });
        }
      });
    }
  });
});

/*
*insert_like API
*Request
*session_id : Get user's information at DB
*question_id : Get what question's id
*answer_id : Get what answer's id
*Response
*If success, return result = true.
*/
question.post('/insert_like', function(req,res,next){
  var isValid = true;
  var validationError = {
    name : 'ValidationError',
    errors : {}
  };

  if(!req.body.question_id){
    isValid = false;
    validationError.errors.question_id = { message : '404 Not Found'};
  }
  if(!req.body.session_id){
    isValid = false;
    validationError.errors.session_id = { message : 'Session Error'};
  }
  if(!req.body.answer_id){
    isValid = false;
    validationError.errors.answer_id = { message : '404 Not Found'};
  }
  if(!isValid) return res.json(result.successFalse(validationError));
  else next();
},function(req,res,next){
  db.klaytndb.connect();
  var session_id = req.body.session_id;
  var question_num = req.body.question_id;
  var answer_num = req.body.answer_id;
  var sql1 = "SELECT email FROM userSession WHERE session_id = ?";
  var params2 = [session_id];
  db.klaytndb.query(sql1, params2, function(err, rows, fields){
    if(err) return res.json(result.successFalse(err));
    else{
      var sql2 = "INSERT INTO userLike (question_num, answer_num ,email) VALUES (?, ?, ?)";
      var params = [question_num, answer_num, rows[0].email];
      db.klaytndb.query(sql, params, function(err, rows, fields){
        if(err) return res.json(result.successFalse(err));
        else{
          db.klaytndb.end();
          var data = {};
          return res.json(result.successTrue(data));
        }
      });
    }
  });
});

/*
*select_answer API
*Request
*session_id : Get user's information at DB
*question_id : Get what question's id
*answer_id : Get what answer's id
*Response
*question_state : After change the question's state.
*/
question.post('/select_answer',function(req,res,next){
  var isValid = true;
  var validationError = {
    name : 'ValidationError',
    errors : {}
  };

  if(!req.body.question_id){
    isValid = false;
    validationError.errors.question_id = { message : '404 Not Found'};
  }
  if(!req.body.session_id){
    isValid = false;
    validationError.errors.session_id = { message : 'Session Error'};
  }
  if(!req.body.answer_id){
    isValid = false;
    validationError.errors.answer_id = { message : '404 Not Found'};
  }
  if(!req.body.select_enable){
    isValid = false;
    validationError.errors.select_enable = { message : '404 Not Found'};
  }
  if(!isValid) return res.json(result.successFalse(validationError));
  else next();
},function(req,res,next){
  db.klaytndb.connect();
  var question_num = req.body.question_id;
  var answer_num = req.body.answer_id;
  var select = req.body.select_enable;
  var _gas = 300000;
  var sql = "UPDATE answer SET is_selected = true WHERE question_num = ? AND answer_num = ?";
  var params = [question_num, answer_num];
  db.klaytndb.query(sql, params, function(err, rows, fields){
    if(err) return res.json(result.successFalse(err));
  });
  if(select){
    var sql2 = "SELECT email FROM answer WHERE answer_num = ?";
    var params2 = [answer_num];
    db.klaytndb.query(sql2, params2, function(err, result, fields){
        if (err) throw err;
        else{
          var sql3 = "SELECT wallet_address FROM userInfo WHERE email = ?";
          var params3 = [result[0].email];
          db.klaytndb.query(sql3, params3, function(err, result, fields){
            if (err) throw err;
            else{
                var u_address = result[0].wallet_address;
                var q_klay = result[0].q_klay*(0.1);
                var q_address = result[0].q_address;
                klaytnsori_testContract.methods.transfer(u_address, q_klay).send({from : q_u_address, gas : _gas, value : q_klay});
                db.klaytndb.end();
                return res.json();
                }
              });
            }
          });
        }
  else{
    db.klaytndb.query(sql,params,function(err, rows, fields){
      if(err) return res.json(result.successFalse(err));
      else {
        var u_address = result[0].wallet_address;
        var q_a_klay = result[0].q_klay*(0.7)*(0.01);
        var q_address = result[0].q_address;
        klaytnsori_testContract.methods.transfer(u_address, q_klay).send({from : q_address, gas : _gas, value : q_a_klay});
      }
    });
    db.klaytndb.query(sql, params, function(err, rows, fields){
      if(err) return res.json(result.successFalse(err));
      else{
        for(var i = 0; i < rows.length ; i++){
          var u_address = result[i].wallet_address;
          var q_l_klay = result[i].q_klay*(0.3)*(0.01)/rows.length;
          var q_address = result[i].q_address;
          klaytnsori_testContract.methods.transfer(u_address, q_klay).send({from : q_address, gas : _gas, value : q_l_klay});
        }
      }
    });
  }
});

question.post('/d_question', function(req,res){
  var q_id = req.body.question_num;
  db.klaytndb.query("DELETE FROM question WHERE question_num = ?", q_id, function(err,result){
    if(err) return res.json(err);
    else return res.json();
  });
});

question.post('/d_answer', function(req,res){
  var a_id = req.body.answer_id;
  db.klaytndb.query("DELETE FROM answer WHERE answer_id = ?", a_id, function(err,result){
    if(err) return res.json(err);
    else return res.json();
  });
});

question.post('/d_like', function(req,res){
  var u_id = req.body.email;
  db.klaytndb.query("DELETE FROM userLike WHERE email = ?", u_id, function(err,result){
    if(err) return res.json(err);
    else return res.json();
  });
});


question.post('/test', function(req,res){

  var hex = "0x1a695230000000000000000000000000ac66a2c9262b7398aa397a7b14ef8838c83cfb32";
  console.log(caver.klay.abi.decodeParameter(hex));
  console.log(r);
});
module.exports = question;
