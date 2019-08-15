var express = require('express');
var membership = express.Router();
var result = require('./../../../../result.js');
var mail = require('./../../../../mail.js');
var caver = require('../caver/MembershipCaver.js');
var db = require('./../../../../klaytndb.js');
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
   var userEmail = req.body.email;
   var userPassword = req.body.password;
   //email과 pw를 보내 디비에서 privatekey를 가져옴
   var userPrivatekey = db.login1(userEmail, userPassword);
   //privatekey로 caver에서 wallet 추가
   var caverOk = caver.addAccount(userPrivatekey);
   //db에 email을 보내서 세션 받기.
   if(caverOk){
     var userSession = db.login2(userEmail, userPassword);
     var data = {
       "session_id" : userSession
     };
     return res.json(result.successTrue(data));
   }
   else {
     var accountError = {
         "name": 'account 중복',
         "errors": {}
     };
     accountError.errors.email = { message: 'Already user account in wallet' };
     return res.json(result.successFalse(accountError));
   }
 });

/*
*Log-out API
*Request
*Session id -> clear session table && enable log-in at other envirement
*Response
*if success log-out, return in result.json result = true.
*/
membership.post('/logout', function (req, res) {
    var userSession = req.body.session_id;
    //DB에서 session_id로 들어온거로 이메일을 확인 후 해당 계좌를 반환
    var userAccount = db.logout1(userSession);
    //caver에서 들어온 계좌를 wallet에서 제거
    var caverOk = caver.removeAccount(userAccount);
    //DB에서 session_id 행 삭제
    if(caverOk){
      db.logout2(userSession);
      var data = { message: 'Thanks to use our service' };
      return res.json(result.successTrue(data));
    }
    else{
      var data = { message : 'Can not Remove account from wallet.'};
      return res.json(result.successFalse(data));
    }
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
    var userEmail = req.body.email;
    var userPassword = req.body.password;
    var userNickname = req.body.nickname;
    //DB에서 해당 이메일 중복 여부 확인 후 count값으로 리턴
    var overlapCount = db.signup1(userEmail);
    if(overlapCount == 0){
      var data = {
        "email" : userEmail,
        "password" : userPassword,
        "nickname" : userNickname
      };
      return res.json(result.successTrue(data));
    }
    else {
      var emailError = {
          "name": 'email 중복',
          "errors": {}
      };
      emailError.errors.email = { message: 'Another user is using same email' };
      return res.json(result.successFalse(emailError));
    }
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
    var userEmail = req.body.email;
    //DB에서 해당 email이 있는지 확인 후 count로 리턴
    var emailCount = db.find_pw_auth_identity1(userEmail);
    if(emailCount == 0){
      var authorizeText = "";
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      for(var i = 0; i < 6 ; i++){
        authorizeText += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      //DB에서 해당 이메일과 인증코드를 인증테이블에 저장후 true리턴
      var dbOk = db.find_pw_auth_identity2(userEmail, authorizeText);
      if(dbOk){
        var data = {
          email : userEmail,
          authorize_text : authorizeText
        };
        mail.transporter.sendMail(mail.mailOption(userEmail,authorizeText), function(err, info){
            return res.json(result.successTrue(data));
          });
      }
      else{
        var dbError = {
            "name": 'DB 저장 불가',
            "errors": {}
        };
        dbError.errors.email = { message: 'Cannot insert information in authUser table' };
        return res.json(result.successFalse(dbError));
      }
    }
    else{
      var emailError = {
          "name": 'email 없음',
          "errors": {}
      };
      emailError.errors.email = { message: 'Cannot find email in DB' };
      return res.json(result.successFalse(emailError));
    }
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
  var userEmail = req.body.email;
  var string1 = req.body.authorize_text;
  //DB에서 해당 이메일로 저장되어 있는 인증코드 리턴
  var string2 = db.auth_identity_code(userEmail);
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
    var userPassword = db.find_pw_auth_identity4 (userEmail);
    var data = {
      "password" : userPassword
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
    var userSession = req.body.session_id;
    var newPassword = req.body.password;
    //DB에서 해당 세션으로 이메일을 확인한 뒤 새로들어온 password로 변경
    var dbOk = db.modify_pw(userSession, newPassword);
    if(dbOk){
      var data = { message : 'Success to modify your password!'};
      return res.json(result.successTrue(data));
    }
    else{
      var dbError = {
          "name": 'DB 변경 오류',
          "errors": {}
      };
      dbError.errors.email = { message: 'Cannot modify information in userInfo table' };
      return res.json(result.successFalse(dbError));
    }
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
    var userEmail = req.body.email;
    var userPassword = req.body.password;
    var userNickname = req.body.nickname;
    var authorizeText = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 6 ; i++) {
        authorizeText += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    //DB에서 해당 이메일과 인증번호를 인증테이블에 저장 후 true 리턴
    var dbOk = db.find_pw_auth_identity2(userEmail, authorizeText);
    if(dbOk){
      var data = {
          "email" : userEmail,
          "password" : userPassword,
          "nickname" : userNickname,
          "authorize_text": authorizeText
        };

        mail.transporter.sendMail(mail.mailOption(u_email,authorize_text), function(err, info){
          return res.json(result.successTrue(data));
        });
    }
    else{
      var dbError = {
          "name": 'DB 저장 불가',
          "errors": {}
      };
      dbError.errors.email = { message: 'Cannot insert information in authUser table' };
      return res.json(result.successFalse(dbError));
    }
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
  var userEmail = req.body.email;
  var userPassword = req.body.password;
  var userNickname = req.body.nickname;
  var string1 = req.body.authorize_text;
  //DB에서 해당 이메일로 들어온 인증코드 리턴
  var string2= db.auth_identity_code(userEmail);
  if(string1 == string2){
    //caver에서 새로운 계좌 생성 후 address와 privatekey 리턴
    var userCaver = caver.createAccount();
    //DB에 해당 사용자의 정보를 모두 저장.
    var dbOk = db.signup2(userEmail, userPassword, userNickname, userCaver.address, userCaver.privateKey);
    if(dbOk){
      var data = {};
      return res.json(result.successTrue(data));
    }
    else {
      var dbError = {
          "name": 'DB 저장 불가',
          "errors": {}
      };
      dbError.errors.email = { message: 'Cannot insert information in userInfo table' };
      return res.json(result.successFalse(dbError));
    }
  }
  else{
    var codeError = {
        "name": 'Authorize code Error',
        "errors": {}
    };
    codeError.errors = { message: 'Diffrent authorize text' };
    return res.json(result.successFalse(codeError));
  }
});

membership.post('/dusr', function(req,res){
  db.duser(req.body.email);
  return res.send("success");
});

module.exports = membership;
