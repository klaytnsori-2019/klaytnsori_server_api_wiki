var express = require('express');
var membership = express.Router();
var result = require('./../../../../result.js');
var mail = require('./../../../../mail.js');

/*
*Log-in API
*Request
*email : Klaytnsori user's ID &Fautho usage
*password : Klaytnsori user's email -password
*Response
*session_id : session -> prevent redundent login
*/
membership.post('/login', function(req, res, next){
    var isValid = true;
    var validationError = {
        "name": 'ValidationError',
        "errors": {}
    };
    if (!req.body.email) {
        isValid = false;
        validationError.errors.email = { message: 'Email is empty' };
    }
    if (!req.body.password) {
        isValid = false;F
        validationError.errors.password = { message: 'Password is empty' };
    }
    if (!isValid) return res.json(result.successFalse(validationError));
    else next();
},
 function(req, res){
   var u_email = req.body.email;
   var u_pw = req.body.password;
   //email과 pw를 보내 디비에서 privatekey를 가져옴
<<<<<<< HEAD

   //privatekey로 caver에서 wallet 추가

   //db에 email을 보내서 세션 받기.

=======

   //privatekey로 caver에서 wallet 추가

   //db에 email을 보내서 세션 받기.

>>>>>>> master
   var data = { message : 'Wellcome to klaytnsori service!'};
   return res.json(result.successTrue(data));
 });

/*
*Log-out API
*Request
*Session id -> clear session table && enable log-in at other envirement
*Response
*if success log-out, return in result.json result = true.
*/
membership.post('/logout', function (req, res) {
    var logout_session = req.body.session_id;
    //DB에서 session_id로 들어온거로 이메일을 확인 후 해당 계좌를 반환

    //caver에서 들어온 계좌를 wallet에서 제거
<<<<<<< HEAD

    //DB에서 session_id 행 삭제

=======

    //DB에서 session_id 행 삭제

>>>>>>> master
    var data = { message: 'Thanks to use our service' };
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

membership.post('/signup', function(req, res, next){
    var isValid = true;
    var validationError = {
        "name": 'ValidationError',
        "errors": {}
    };

    if (!req.body.email){
        isValid = false;
        validationError.errors.email = { message: 'Email is empty' };
    }
    if (!req.body.password){
        isValid = false;
        validationError.errors.password = { message: 'Password is empty' };
    }
    if(!req.body.nickname){
      isValid = false;
      validationError.errors.nickname = { message : 'Nickname is empty'}
    }
    if (!isValid) return res.json(result.successFalse(validationError));
    else next();
}, function(req, res, next){
    var u_email = req.body.email;
    var u_pw = req.body.password;
    var u_nick = req.body.nickname;
    //DB에서 해당 이메일 중복 여부 확인 후 count값으로 리턴


    var data = {
      email : u_email,
      password : u_pw,
      nickname : u_nick
    };
    return res.json(result.successTrue(data));
});

/*
*Find password API1
*if user forgot user's password, find the password.
*Request
*email : send authorize code to user's email.
*Response
*email : send e-amil.
*authorize_code : authorize code to identity user.
*/
membership.post('/find_pw_auth_code', function(req, res, next){
  var isValid = true;
  var validationError = {
      "name": 'ValidationError',
      "errors": {}
  };

  if (!req.body.email){
      isValid = false;
      validationError.errors.email = { message: 'Email is empty' };
  }
  if (!isValid) return res.json(result.successFalse(validationError));
  else next();
},function(req,res){
    var u_email = req.body.email;
    //DB에서 해당 email이 있는지 확인 후 count로 리턴


    var authorize_text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < 6 ; i++){
      authorize_text += possible.charAt(Math.floor(Math.random() * possible.length));
    }

    //DB에서 해당 이메일과 인증코드를 인증테이블에 저장후 true리턴

    var data = {
      email : u_email,
      authorize_text : authorize_text
    };
    mail.transporter.sendMail(mail.mailOption(u_email,authorize_text), function(err, info){
        return res.json(result.successTrue(data));
    });
});

/*
*Find password API2
*if user forgot user's password, find the password.
*email : To find matching password with email.
*authorize_code : check for user's identity.
*Request
*email : send authorize code to user's email.
*Response
*password : user's password
*/
membership.post('/find_pw_auth_identity', function (req, res, next) {
    var isValid = true;
    var validationError = {
        name: 'ValidationError',
        errors: {}
    };
    if(!req.body.email){
        isValid = false;
        validationError.errors.email = { message: 'Email is empty' };
    }
    if(!req.body.authorize_text){
        isValid = false;
        validationError.errors.authorize_text = { message: 'Authorize code is empty' };
    }
    if(!isValid) return res.json(result.successFalse(validationError));
    else next();
},function(req, res, next){
  var u_email = req.body.email;
  var string1 = req.body.authorize_text;
  //DB에서 해당 이메일로 저장되어 있는 인증코드 리턴

  if(string1 != string2){
    var codeError = {
        "name": 'Authorize code Error',
        "errors": {}
    };
    codeError.errors = { message: 'Diffrent authorize text' };
    return res.json(result.successFalse(codeError));
  }

  else{
    //DB에서 해당 이메일의 매칭되어있는 password 리턴

    var data = {
      password : _passwd
    };
    return res.json(result.successTrue(data));
  }
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
membership.post('/modify_pw', function (req, res, next) {
    var isValid = true;
    var validationError = {
        name: 'ValidationError',
        errors: {}
    };
    if (!req.body.session_id) {
        isValid = false;
        validationError.errors.session_id = { message: 'Session Error' };
    }
    if(!req.body.password){
      isValid = false;
      validationError.errors.password = { message: 'Password is empty' };
    }
    if (!isValid) return res.json(result.successFalse(validationError));
    else next();
}, function (req, res) {
    var _session = req.body.session_id;
    var m_pw = req.body.password;
    //DB에서 해당 세션으로 이메일을 확인한 뒤 새로들어온 password로 변경

    var data = { message : 'Success to modify your password!'};
    return res.json(result.successTrue(data));
});

/*
*Authorize_code API
*Request
*email : To authorize user's identity using random num
*Response
*/
membership.post('/authorize_code', function (req, res, next) {
    var isValid = true;
    var validationError = {
        name: 'ValidationError',
        errors: {}
    };
    if (!req.body.email) {
        isValid = false;
        validationError.errors.email = { message: 'Email is empty' };
    }
    if (!req.body.password){
        isValid = false;
        validationError.errors.password = { message: 'Password is empty' };
    }
    if(!req.body.nickname){
      isValid = false;
      validationError.errors.nickname = { message : 'Nickname is empty'}
    }
    if (!isValid) return res.json(result.successFalse(validationError));
    else next();
}, function (req, res, next) {
    var u_email = req.body.email;
    var u_pw = req.body.password;
    var u_nick = req.body.nickname;
    var authorize_text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 6 ; i++) {
        authorize_text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    //DB에서 해당 이메일과 인증번호를 인증테이블에 저장 후 true 리턴
    var data = {
        "email" : u_email,
        "password" : u_pw,
        "nickname" : u_nick,
        "authorize_text": authorize_text
    };

    mail.transporter.sendMail(mail.mailOption(u_email,authorize_text), function(err, info){
        return res.json(result.successTrue(data));
    });
});

/*
*Authorize_identity API
*Request
*email : To authorize user's identity using random num
*Response
*session_id : session -> prevent redundent login
*/
membership.post('/authorize_identity', function (req, res, next) {
    var isValid = true;
    var validationError = {
        name: 'ValidationError',
        errors: {}
    };
    if(!req.body.email){
        isValid = false;
        validationError.errors.email = { message: 'Email is empty' };
    }
    if (!req.body.password){
        isValid = false;
        validationError.errors.password = { message: 'Password is empty' };
    }
    if(!req.body.nickname){
      isValid = false;
      validationError.errors.nickname = { message : 'Nickname is empty'}
    }
    if(!req.body.authorize_text){
        isValid = false;
        validationError.errors.authorize_text = { message: 'Authorize code is empty' };
    }
    if(!isValid) return res.json(result.successFalse(validationError));
    else next();
},function(req, res, next){
  var u_email = req.body.email;
  var u_pw = req.body.password;
  var u_nick = req.body.nickname;
  var string1 = req.body.authorize_text;
  //DB에서 해당 이메일로 들어온 인증코드 리턴

  if(string1 == string2){
    //caver에서 새로운 계좌 생성 후 address와 privatekey 리턴

    //DB에 해당 사용자의 정보를 모두 저장.

    var data = {};
    return res.json(result.successTrue(data));
  }
  else{
    var codeError = {
        "name": 'Authorize code Error',
        "errors": {}
    };
    codeError.errors = { message: 'Diffrent authorize text' };
    return res.json(result.successFalse(codeError));
  }
    }
  });
});

module.exports = membership;
