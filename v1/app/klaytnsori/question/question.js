var express = require('express');
var question = express.Router();
var result = require('./../../../../result');

/*
*category API
*Request
*Nothing
*Response
*category list - Bring all category list(data type int) at DB
*/
question.post('/category', function(req,res,next){
  //DB에서 카테고리 정보 리스트 형태로 반환.

  return res.json(result.successTrue(data));
});

/*
*insert_question API
*Request
*session_id : Get user's information at DB
*question_title : Set question_title in DB
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
  var q_klay = req.body.question_klay;
  var q_title = req.body.question_title;
  var q_content = req.body.question_content;
  var cate = req.body.category;
  //DB에서 세션 아이디로 해당 유저의 계좌를 가져옴

  //caver에서 해당 유저의 계좌와 klay로 전송 후 트랜잭션 명세서 리턴

  //DB에 필요 정보 저장 후 question_id 리턴

  var data = {
    question_id : q_id
  };
  return res.json(result.successTrue(data));
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
*category : Set category using question_id
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
  var question_num = req.query.question_id;
  //DB에서 질문 넘버로 질문 제목,클레이,내용,시간,질문자,상태,카테고리 리턴

  var data ={

  }
  return res.json(result.successTrue(data));
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


  }
  else{
    if(select_enable){


    }
    else{


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
  var session_id = req.body.session_id;
  var answer_content = req.body.answer_content;
  var question_num = req.body.question_id;
  //DB에서 해당 질문 번호에 답변과 답변자 이메일 넣기.

  return res.json(result.successTrue());
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
  var session_id = req.body.session_id;
  var question_num = req.body.question_id;
  var answer_num = req.body.answer_id;
  //DB에 해당 질문 번호와 답변 번호와 유저 이메일을 테이블에 저장.

  return res.json(result.successTrue());
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
  var question_num = req.body.question_id;
  var answer_num = req.body.answer_id;
  var select = req.body.select_enable;
  var sessoin_id
  if(select){

        }
  else{

    });
});

module.exports = question;
