var express = require('express');
var question = express.Router();
var result = require('./../../../../result');
var Caver = require('caver-js');
var caver = new Caver('https://api.baobab.klaytn.net:8651/');

var klaytnsori_testContract = new caver.klay.Contract([{"constant":true,"inputs":[],"name":"getBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"test_owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_questionerAddress","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"deposit","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[{"name":"_address","type":"address"},{"name":"_value","type":"uint256"}],"name":"setQuestionerBalance","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_address","type":"address"}],"name":"getQuestionerBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"}],'0x71EFcC18cC1baBEF01467dBD9e72286D802a272B');
/*
function fetchklay(){
  return klaytnsori_testContract.methods.getBalance().call();
}
*/
/*
*category API
*Request
*Nothing
*Response
*category list - Bring all category list(data type int) at DB
*/
question.get('/category', function(req,res,next){
  //DB에서 category관련 data를 받아서 출력

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
  //DB에서 해당 question_id에 해당하는 내용을 모두 가져온다.

  return res.json(result.successTrue(rows));
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

  //DB에 답변 table에 들어오는 정보 저장.

  var data = {};
  return res.json(result.successTrue(data));
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

  //DB에 like table에 들어오는 정보 저장.

  var data = {};
  return res.json(result.successTrue(data));
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

  if(!isValid) return res.json(result.successFalse(validationError));
  else next();
},function(req,res,next){
  //DB에서 question의 상태 update
  var u_email;
  //DB에서 session_id로 들어온 email과 answer_id로 들어온 id의 wallet을 찾는다.

  //caver에서 server의 wallet에서 answer_id의 wallet으로 klay 전송
  var q_u_account_address;
  var q_klay;
  //밑에 send할 때 보내는 거 질문.
  klaytnsori_testContract.methods.transfer(q_u_account_address, q_klay).send({from : q_u_address, gas : _gas, value : q_klay});
  var q_state = true;
  var data = {
    question_state : q_state
  };
  return res.json(result.successTrue(data));
});

module.exports = question;
