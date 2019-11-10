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
   db.findPasswordFirst(userEmail, (row)=>{
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
       db.loginFirst(userEmail, userPassword, (rows)=>{
         if(rows == false){
           var dbError = {
               "name": 'DB',
               "errors": {}
           };
           dbError.errors.db = { message: 'Cannot find in userInfo table' };
           return res.json(result.successFalse(dbError));
         }
         else{
           db.loginSecond(userEmail, (rows)=>{
             var userSession = rows[0].session_id;
             var data = {
               "session_id" : userSession
             };
             return res.json(result.successTrue(data));
           });
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
    db.logoutFirst(userSession, (rows)=>{
      if(rows == false){
        var dbError = {
            "name": 'DB',
            "errors": {}
        };
        dbError.errors.db = { message: 'Cannot find information in userSession table' };
        return res.json(result.successFalse(dbError));
      }
      db.logoutSecond(userSession, (rows)=>{
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
    });
});

/*
*check_email API
*if new user join in klaytnsori service, new user should make new account.
*This account uses in only klaytnsori service.
*But user can send or receive from other accounts.
*Request
*email : new user's using email like ID.
*Response
*if success sign-up, return in result.json result = true.
*/

membership.post('/check_email', function(req, res, next){
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
}, function(req, res, next){
    var userEmail = req.body.email;
    //DB에서 해당 이메일 중복 여부 확인 후 count값으로 리턴
    db.checkEmail(userEmail, (rows)=>{
      var overlapCount = rows;
      if(!overlapCount){
        var data = { message : 'You can use this E-mail.'};
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
    db.findPasswordFirst(userEmail, (rows)=>{
      var emailCount = rows;
      if(emailCount){
        var authorizeText = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        for(var i = 0; i < 6 ; i++){
          authorizeText += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        //DB에서 해당 이메일과 인증코드를 인증테이블에 저장후 true리턴
        db.findPasswordSecond(userEmail, authorizeText, (row)=>{
          var dbOk = row;
          console.log(row);
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
  db.authIdentityCodePW(userEmail, (rows)=>{
    //console.log(rows);
    var string2 = rows[0].codePW;
    //console.log(string1);
    //console.log(string2);
    if(string1 != string2){
      var codeError = {
          "name": 'Authorize code Error',
          "errors": {}
      };
      codeError.errors.code = { message: 'Diffrent authorize text' };
      return res.json(result.successFalse(codeError));
    }
    else{
      db.findPasswordThird(userEmail, userNewPassword, (row)=>{
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
    db.modifyPassword(userSession, newPassword, (rows)=>{
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
*signup API
*Request
*email : To authorize user's identity using random num
*passowrd : User use password.
*nickname : User's using name in service
*Response
*/
membership.post('/signup', function (req, res, next) {
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
    db.authInsertInfoAndAuth(userEmail, userPassword, userNickname, authorizeText, (rows)=>{
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
*Authorize_signup API
*Request
*email : User's email to find matching code
*authorize_text : To authorize user's identity
*Response
*session_id : if success signup, return true
*/
membership.post('/authorize_signup', function (req, res, next) {
    var isValid = true;
    var validationError = {
        name: 'ValidationError',
        errors: {}
    };

    if(!req.body.email){
      isValid = false;
      validationError.errors.email = { message: 'email is empty' };
    }

    if(!req.body.authorize_text){
        isValid = false;
        validationError.errors.authorize_text = { message: 'Authorize code is empty' };
    }

    if(!isValid) return res.json(result.successFalse(validationError));
    else next();
},function(req, res, next){
  var userEmail = req.body.email;
  var string1 = req.body.authorizeText;
  db.authIdentityCodeEmail(userEmail, (rows)=>{
    if(rows == false){
      var dbError = {
        "name" : "DB",
        "errors" : {}
      };
      dbError.errors.db = { message : 'Cannot Find information in authEmail'};
      return res.json(result.successFalse(dbError));
    }

    else{
        var string2 = rows[0].code;
        if(string1 == string2){
          var userCaver = caver.createAccount();
          db.signupAuthUser(userEmail, userCaver.address, userCaver.privateKey, (rows)=>{
            var dbOk = rows;
            if(dbOk){
              var caverOk = caver.removeAccount(userCaver.address);
              var data = {message : 'Thanks to join in klaytnsori service'};
              return res.json(result.successTrue(data));
            }

            else{
              var dbError = {
                "name": 'DB',
                "errors": {}
              };
              dbError.errors.db = { message: 'Cannot insert information in userInfo table' };
              return res.json(result.successsFalse(dbError));
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
    }
  });
});

module.exports = membership;
