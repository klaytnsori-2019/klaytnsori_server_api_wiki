var express = require('express');
var membership = express.Router();
var result = require('./../../../../result.js');
var Caver = require('caver-js');
var caver = new Caver('https://api.baobab.klaytn.net:8651/');
var db = require('./../../../../database.js');
var mail = require('./../../../../mail.js');

/*
*Log-in API
*Request
*email : Klaytnsori user's ID &autho usage
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
   var u_email = req.body.email;
   var u_pw = req.body.password;
   //db.klaytndb.connect();
   var params = [u_email, u_pw];
   db.klaytndb.query("SELECT private_key FROM userInfo WHERE email = ? AND password = ?", params, function(err, rows, fields){
       if (err) return res.json(result.successFalse(err));
       else{
         caver.klay.accounts.wallet.add(rows[0].private_key);
         var params4 = [u_email];
         var sql4 = "DELETE FROM userSession WHERE email = ?";
         db.klaytndb.query(sql4, params4, function (err, result, fields) {
                 if (err) console.log(err);
          });
       }
   });
   db.klaytndb.query("SELECT MAX(session_id) as max FROM userSession", function(err, rows, fields){
     if (err) return res.json(result.successFalse(err));
     else{
       rows[0].max = rows[0].max + 1;
       var params3 = [rows[0].max, u_email];
       db.klaytndb.query("INSERT INTO userSession (session_id ,email) VALUES(?, ?)", params3, function(err, rows, fields){
         if (err) return res.json(result.successFalse(err));
         else{
           db.klaytndb.query("SELECT session_id FROM userSession WHERE email = ?", u_email, function(err, rows, fields){
             if(err) return res.json(result.successFalse(err));
             else{
               return res.json(result.successTrue(rows));
             }
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
    var logout_session = req.body.session_id;
    //db.klaytndb.connect();
    var params = [logout_session];
    var sql1 = "SELECT wallet_address FROM userInfo WHERE email = (SELECT email FROM userSession WHERE session_id = ?)"
    var sql2 = "DELETE FROM userSession WHERE session_id = ?";
    db.klaytndb.query(sql1, params, function(err, rows, field){
      if(err) return res.json(result.successFalse(err));
      else{
        caver.klay.accounts.wallet.remove(rows[0].wallet_address);
      }
    });
    db.klaytndb.query(sql2,params,function(err, rows, field){
      if(err) return res.json(result.successFalse(err));
      else{
        var data = { message: 'Thanks to use our service' };
        //db.klaytndb.end();
        return res.json(result.successTrue(data));
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
    var u_email = req.body.email;
    var u_pw = req.body.password;
    var u_nick = req.body.nickname;
    var params = [u_email]
    var sql = "SELECT count(email) as total FROM userInfo WHERE email = ?";
    db.klaytndb.query(sql, params, function(err, rows, fields){
       if (err) return res.json(result.successFalse(err));
       else{
         if(rows[0].total){
           var emailError = {
               "name": 'email 중복',
               "errors": {}
           };
           emailError.errors = { message: 'Another user is using same email' };
           return res.json(result.successFalse(emailError));
         }
         else{
           var data = {
             email : u_email,
             password : u_pw,
             nickname : u_nick
           };
           return res.json(result.successTrue(data));
         }
       }
     });
    /*
    var params = [];
    var sql = "SELECT email FROM userInfo";
    db.klaytndb.query(sql, params, function(err, rows, fields){
        if (err) return res.json(result.successFalse(err));
        else{
          for(var i = 0 ; i < rows.length ; i++)
          {
            if(rows[i].email == u_email)
            {
              var emailError = {
                  "name": 'email 중복',
                  "errors": {}
                };
                emailError.errors = { message: 'Another user is using same email' };
                return res.json(result.successFalse(emailError));
            }
          }
          var data = {
            email : u_email,
            password : u_pw,
            nickname : u_nick
          };
          return res.json(result.successTrue(data));
      }
    });*/
});

/*
*Find password API
*if user forgot user's password, find the password.
*Request
*email : authorize the user.
*Response
*Password : user's password.
*/
membership.post('/find_pw_auth_code', function (req, res) {
    var u_email = req.body.email;
    var params = [u_email]
    var sql = "SELECT email FROM userInfo WHERE email = ?";
    db.klaytndb.query(sql, params, function (err, rows, fields) {
        if (err) return res.json(result.successFalse(err));
        else{
          var authorize_text = "";
          var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
          for (var i = 0; i < 6 ; i++) {
              authorize_text += possible.charAt(Math.floor(Math.random() * possible.length));
          }
          var data = {
            email : u_email,
            authorize_text : authorize_text
          };
          var params2 = [u_email, authorize_text];
          var sql2 = "INSERT INTO userAuth (email, code) VALUES (?, ?)";
          db.klaytndb.query(sql2, params2, function(err, rows, fields){
            if (err) return res.json(result.successFalse(err));
            else{
              mail.transporter.sendMail(mail.mailOption(u_email,authorize_text), function(err, info){
                  return res.json(result.successTrue(data));
              });
            }
          });
        }
    });
});


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
  var params = [u_email];
  var sql = "SELECT code FROM userAuth WHERE email = ?";
  db.klaytndb.query(sql, params, function(err, rows, fields){
    if (err) return res.json(result.successFalse(err));
    else{
      var string2 = rows[0].code;
      if(string1 != string2){
        var codeError = {
            "name": 'Authorize code Error',
            "errors": {}
        };
        codeError.errors = { message: 'Diffrent authorize text' };
        return res.json(result.successFalse(codeError));
      }
    }
  });
  var sql1 = "DELETE FROM userAuth WHERE email = ?";
  var params1 = [u_email];
  db.klaytndb.query(sql1, params1, function(err, rows, fields){
    if (err) return res.json(result.successFalse(err));
  });
  var params = [u_email]
  var sql = "SELECT password FROM userInfo WHERE email = ?";
  db.klaytndb.query(sql, params, function(err, rows, fields){
      if (err) return res.json(result.successFalse(err));
      else return res.json(result.successTrue(rows));
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
    var _session = req.body.session_id;
    var m_pw = req.body.password;
    var params = [_session]
    var sql = "SELECT email FROM userSession WHERE session_id = ?";
    db.klaytndb.query(sql, params, function(err, rows, fields){
        if (err) return res.json(result.successFalse(err));
        else{
          var sql2 = "UPDATE userInfo SET password = ? WHERE email = ?"
          var params2 = [m_pw, rows[0].email];
          db.klaytndb.query(sql2, params2, function(err, result, fields){
            if(err) return res.json(result.successFalse(err));
            else{
              //var data = {};
              return res.json({ message: 'Success to modify your password!' });
            }
          });
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
    var u_email = req.body.email;
    var u_pw = req.body.password;
    var u_nick = req.body.nickname;
    var authorize_text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 6 ; i++) {
        authorize_text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    var data = {
        "email" : u_email,
        "password" : u_pw,
        "nickname" : u_nick,
        "authorize_text": authorize_text
    };
    var params2 = [u_email, authorize_text];
    var sql2 = "INSERT INTO userAuth (email, code) VALUES (?, ?)";
    db.klaytndb.query(sql2, params2, function(err, rows, fields){
      if (err) return res.json(result.successFalse(err));
      else{
        mail.transporter.sendMail(mail.mailOption(u_email,authorize_text), function(err, info){
            return res.json(result.successTrue(data));
        });
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
  var u_email = req.body.email;
  var u_pw = req.body.password;
  var u_nick = req.body.nickname;
  var string1 = req.body.authorize_text;
  var params = [u_email];
  var sql = "SELECT code FROM userAuth WHERE email = ?";
  db.klaytndb.query(sql, params, function(err, rows, fields){
    if (err) return res.json(result.successFalse(err));
    else{
      var string2 = rows[0].code;
      if(string1 == string2){
        var account = caver.klay.accounts.create();
        var _address = account.address;
        var _privateK = account.privateKey;
        var params = [u_email, u_pw, u_nick, _address, _privateK]
        var sql = "INSERT INTO userInfo (email, password, nickname, wallet_address, private_key) VALUES (?, ?, ?, ?, ?)";
        db.klaytndb.query(sql, params, function(err, rows, fields){
            if (err) return res.json(result.successFalse(err));
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
  var sql1 = "DELETE FROM userAuth WHERE email = ?";
  var params1 = [u_email];
  db.klaytndb.query(sql1, params1, function(err, rows, fields){
    if (err) return res.json(result.successFalse(err));
    else{
      var data = {};
      return res.json(result.successTrue(data));
    }
  });
});

membership.post('/d_usr', function(req,res){
  var u_id = req.body.email;
  db.klaytndb.query("DELETE FROM userInfo WHERE email = ?", u_id, function(err,result){
    if(err) return res.json(err);
    else return res.json();
  });
});

module.exports = membership;
