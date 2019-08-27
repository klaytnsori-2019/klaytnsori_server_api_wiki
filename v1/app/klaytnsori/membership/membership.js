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
        isValid = false;
        validationError.errors.password = { message: 'Password is empty' };
    }
    if (!isValid) return res.json(result.successFalse(validationError));
    else next();
},
 function(req, res){
   var userEmail = req.body.email;
   var userPassword = req.body.password;
   //email과 pw를 보내 디비에서 privatekey를 가져옴
   //privatekey로 caver에서 wallet 추가
   //db에 email을 보내서 세션 받기.
   db.find_pw_auth_identity1(userEmail, (row)=>{
     var verificationEmail = row;
     if(!verificationEmail){
       var dbError = {
           "name": 'DB',
           "errors": {}
       };
       dbError.errors.db = { message: 'Cannot find information in userInfo table' };
       return res.json(result.successFalse(dbError));
     }
     else{
       db.login1(userEmail, userPassword, (rows)=>{
         if(rows == false){
           var dbError = {
               "name": 'DB',
               "errors": {}
           };
           dbError.errors.db = { message: 'Cannot find in userInfo table' };
           return res.json(result.successFalse(dbError));
         }
         var userPrivatekey = rows[0].private_key;
         var caverOk = caver.addAccount(userPrivatekey);
         if(caverOk){
           db.login2(userEmail, (rows)=>{
             var userSession = rows[0].session_id;
             var data = {
               "session_id" : userSession
             };
             return res.json(result.successTrue(data));
           });
         }
         else {
           var accountError = {
               "name": 'account',
               "errors": {}
           };
           accountError.errors.account = { message: 'Already user account in wallet' };
           return res.json(result.successFalse(accountError));
         }
       });
     }
   });
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
    //DB에서 session_id 행 삭제
    //caver에서 들어온 계좌를 wallet에서 제거
    db.logout1(userSession, (rows)=>{
      var userAccount = rows[0].wallet_address;
      var caverOk = caver.removeAccount(userAccount);
      if(caverOk){
        db.logout2(userSession, (rows)=>{
          var dbOk = rows;
          if(dbOk){
            var data = { message: 'Thanks to use our service' };
            return res.json(result.successTrue(data));
          }
          else{
            var dbError = {
                "name": 'DB',
                "errors": {}
            };
            dbError.errors.db = { message: 'Cannot delete in userSession table' };
            return res.json(result.successFalse(dbError));
          }
        });
      }
      else{
        var data = { message : 'Can not Remove account from wallet.'};
        return res.json(result.successFalse(data));
      }
    });
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
    db.signup1(userEmail, (rows)=>{
      var overlapCount = rows;
      if(overlapCount){
        var data = {
          "email" : userEmail,
          "password" : userPassword,
          "nickname" : userNickname
        };
        return res.json(result.successTrue(data));
      }
      else {
        var emailError = {
            "name": 'email',
            "errors": {}
        };
        emailError.errors.email = { message: 'Another user is using same email' };
        return res.json(result.successFalse(emailError));
      }
    });
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
    db.find_pw_auth_identity1(userEmail, (rows)=>{
      var emailCount = rows;
      if(emailCount){
        var authorizeText = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for(var i = 0; i < 6 ; i++){
          authorizeText += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        //DB에서 해당 이메일과 인증코드를 인증테이블에 저장후 true리턴
        db.find_pw_auth_identity2(userEmail, authorizeText, (row)=>{
          var dbOk = row;
          if(dbOk){
            var data = {
              email : userEmail,
              authorize_text : authorizeText
            };
            mail.transporter.sendMail(mail.mailOptionFindPw(userEmail,authorizeText), function(err, info){
                return res.json(result.successTrue(data));
              });
          }
          else{
            var dbError = {
                "name": 'DB',
                "errors": {}
            };
            dbError.errors.db = { message: 'Cannot insert information in userAuth table' };
            return res.json(result.successFalse(dbError));
          }
        });
      }
      else{
        var emailError = {
            "name": 'email',
            "errors": {}
        };
        emailError.errors.email = { message: 'Cannot find email in DB' };
        return res.json(result.successFalse(emailError));
      }
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
    if(!req.body.password){
      isValid = false;
      validationError.errors.password = { message: 'New password is empty' };
    }
    if(!isValid) return res.json(result.successFalse(validationError));
    else next();
},function(req, res, next){
  var userEmail = req.body.email;
  var userNewPassword = req.body.password;
  var string1 = req.body.authorize_text;
  //DB에서 해당 이메일로 저장되어 있는 인증코드 리턴
  db.auth_identity_code(userEmail, (rows)=>{
    var string2 = rows[0].code;
    if(string1 != string2){
      var codeError = {
          "name": 'Authorize code Error',
          "errors": {}
      };
      codeError.errors.code = { message: 'Diffrent authorize text' };
      return res.json(result.successFalse(codeError));
    }
    else{
      db.find_pw_auth_identity4 (userEmail, userNewPassword, (row)=>{
        var dbOk = row;
        if(dbOk){
          var data = {message: 'Update password!'};
          return res.json(result.successTrue(data));
        }
        else{
          var dbError = {
              "name": 'DB',
              "errors": {}
          };
          dbError.errors.db = { message: 'Cannot change password in userInfo table' };
          return res.json(result.successFalse(dbError));
        }
      });
    }
  });
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
    db.modify_pw(userSession, newPassword, (rows)=>{
      var dbOk = rows;
      if(dbOk){
        var data = { message : 'Success to modify your password!'};
        return res.json(result.successTrue(data));
      }
      else{
        var dbError = {
            "name": 'DB',
            "errors": {}
        };
        dbError.errors.db = { message: 'Cannot modify information in userInfo table' };
        return res.json(result.successFalse(dbError));
      }
    });
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
    db.find_pw_auth_identity2(userEmail, authorizeText, (rows)=>{
      var dbOk = rows;
      if(dbOk){
        var data = {
            "email" : userEmail,
            "password" : userPassword,
            "nickname" : userNickname,
            "authorize_text": authorizeText
          };
          mail.transporter.sendMail(mail.mailOptionSignup(userEmail,authorizeText), function(err, info){
            return res.json(result.successTrue(data));
          });
      }
      else{
        var dbError = {
            "name": 'DB',
            "errors": {}
        };
        dbError.errors.db = { message: 'Cannot insert information in authUser table' };
        return res.json(result.successFalse(dbError));
      }
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
  var userEmail = req.body.email;
  var userPassword = req.body.password;
  var userNickname = req.body.nickname;
  var string1 = req.body.authorize_text;
  //DB에서 해당 이메일로 들어온 인증코드 리턴
  db.auth_identity_code(userEmail, (rows)=>{
    var string2 = rows[0].code;
    if(string1 == string2){
      //caver에서 새로운 계좌 생성 후 address와 privatekey 리턴
      var userCaver = caver.createAccount();
      //DB에 해당 사용자의 정보를 모두 저장.
      db.signup2(userEmail, userPassword, userNickname, userCaver.address, userCaver.privateKey, (row)=>{
        var dbOk = row;
        if(dbOk){
          var data = { message : 'Thanks to join in klaytnsori service.'};
          return res.json(result.successTrue(data));
        }
        else{
          var dbError = {
              "name": 'DB',
              "errors": {}
          };
          dbError.errors.db = { message: 'Cannot insert information in userInfo table' };
          return res.json(result.successFalse(dbError));
        }
      });
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
});

module.exports = membership;
