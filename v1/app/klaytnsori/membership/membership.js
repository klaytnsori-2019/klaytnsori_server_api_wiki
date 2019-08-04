var express = require('express');
var membership = express.Router();
var result = require('./../../../../result.js');

/*
*Log-in API
*Request
*email : Klaytnsori user's ID &autho usage
*password : Klaytnsori user's email -password
*Response
*session_id : session -> prevent redundent login
*/
membership.post('/login',function(req,res,next){
  console.log('login');

  var isValid = true;
  var validationError = {
      "name" : 'ValidationError',
      "errors":{}
  };

  if(!req.body.email){
    isValid = false;
    validationError.errors.email = { message:'Email is required!'};
  }

  if(!req.body.password){
    isValid = false;
    validationError.errors.password = {message: 'Password is required!'};
  }

  if(!isValid) return res.json(result.successFalse(validationError));

  else next();
  },
  function(req,res,next){
    var u_email = req.body.email;
    var u_pw = req.body.pw;
    var _session = 1;
    //DB에서 u_email과 u_pw확인 후 session_id 부여 변수명은 _session


    //if(err) return res.json(result.successFalse(err));
  //  else {
      var data = {
        "session_id" : _session
      };
      return res.json(result.successTrue(data));
  //  }
  });

  /*
  *Log-out API
  *Request
  *Session id -> clear session table && enable log-in at other envirement
  *Response
  *if success log-out, return in result.json result = true.
  */
  membership.post('/logout', function(req,res){

    var logout_session = req.body.session_id;

    //DB에서 해당 session_id 클리어하고 u_emil로 email 반환

    var data = {message : 'Thanks to use our service'};
    return res.json(result.successTrue(data));
  });

  /*
  *Sing-up API
  *if new user join in klaytnsori service, new user should make new account.
  *This account uses in only klaytnsori service.
  *But user can send or receive from other accounts.
  *Request
  *email : new user's using email like ID.
  *password : authorize user.
  *Response
  *if success sign-up, return in result.json result = true.
  */

  membership.post('/signup', function(req,res,next){
    var isValid = true;
    var validationError = {
      "name" : 'ValidationError',
      "errors":{}
    };

    if(!req.body.email){
      isValid = false;
      validationError.errors.email = { message:'Email is required!'};
    }

    if(!req.body.password){
      isValid = false;
      validationError.errors.password = {message: 'Password is required!'};
    }
    if(!isValid) return res.json(result.successFalse(validationError));
    else next();
  }, function(req,res,next){
    var u_email = req.body.email;
    var u_pw = req.body.password;
    var _ok = true;
    //DB에서 email에 대한 중복 여부 확인 후 boolen으로 _OK를 리턴 맞다면 true

    if(_ok)
    {
      //caver에서 wallet 생성 후 privateKey와 Address를 돌려줌
    /*
      const account = caver.klay.accounts.create();
      caver.klay.accounts.wallet.add('account.privateKey', 'account.address');
      var _address = account.address;
      var _privateK = account.privateKey;
  */
      //DB에 추가 email,password, address, privatekey를 저장


      var data = {
        "email" : u_email,
        "pw" : u_pw
      };
      return res.json(result.successTrue(data));
    }

    else{
      var emailError = {
        "name" : 'email 중복',
        "errors":{}
      };
      emailError.errors = {message: 'Another user is using same email'};
      return res.json(result.successFalse(emailError));
    }
  });

  /*
  *Find password API
  *if user forgot user's password, find the password.
  *Request
  *email : authorize the user.
  *Response
  *Password : user's password.
  */

  membership.get('find_pw', function(req,res){
    var _email = req.body.email;
    var _pw;
    //DB에서 해당 email의 pw를 찾음.

    var data = { password : _pw};
    return res.json(result.successTrue(data));
  });

  /*
  *Modify password API
  *if user want to modify user's password.
  *Request
  *session_id : authorize user.
  *password : change password.
  *Response
  *if success modify password, return in result.json result = true.
  */
  membership.post('/modify_pw', function(req,res,next){
    var isValid = true;
    var validationError = {
      name : 'ValidationError',
      errors : {}
    };
    if(!req.body.session_id){
      isValid = false;
      validationError.errors.session_id = {message: 'Session Error'};
    }
    if(!isValid) return res.json(result.successFalse(validationError));
    else next();
  }, function(req,res,next){
    var _session = req.body.session_id;
    var m_pw = req.body.password;

    //DB에서 해당 session_id로 email을 확인한 후 pw를 변경
    return res.json({message:'Success to modify your password!'});
  });

module.exports = membership;
