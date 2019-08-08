
var express = require('express');
var membership = express.Router();
var result = require('./../../../../result.js');
var Caver = require('caver-js');
var caver = new Caver('https://api.baobab.klaytn.net:8651/')
var mysql = require('mysql');
var klaytndb = mysql.createConnection({
    host: 'klaytn-database.ciitcrpahoo9.ap-northeast-2.rds.amazonaws.com',
    user: 'admin',
    password: 'klaytn2019!',
    port: 3306,
    database: 'klaytndb'

});
var mail = require('./../../../../mail.js');

/*
*Log-in API
*Request
*email : Klaytnsori user's ID &autho usage
*password : Klaytnsori user's email -password
*Response
*session_id : session -> prevent redundent login
*/
membership.post('/login', function (req, res, next) {
    console.log('login');

    var isValid = true;
    var validationError = {
        "name": 'ValidationError',
        "errors": {}
    };
    if (!req.body.email) {
        isValid = false;
        validationError.errors.email = { message: 'Email is required!' };
    }
    if (!req.body.password) {
        isValid = false;
        validationError.errors.password = { message: 'Password is required!' };
    }
    if (!isValid) return res.json(result.successFalse(validationError));
    else next();
},
 function (req, res) {
     var u_email = req.body.email;
     var u_pw = req.body.password;
     var sql = "SELECT email FROM userInfo WHERE email = ? AND password = ?";
     var params = [u_email, u_pw]
     klaytndb.connect();
     klaytndb.query(sql, params, function (err, result, fields) {
         if (err) throw err;
         return res.json(result);
     });
     var _address;
     var _privateK;
     caver.klay.accounts.wallet.add('_address', '_privateK');
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

    klaytndb.connect();
    var params = [logout_session]
    var sql = "DELETE FROM userSession WHERE session_id = ?";
    klaytndb.query(sql, params,function (err, result, fields) {
        if (err) throw err;
    });
    var u_account_address;
    caver.klay.accounts.wallet.remove('u_account_address')
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

membership.post('/signup', function (req, res, next) {
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
    var _ok = false;
    klaytndb.connect();
    var params = [u_email]
    var sql = "SELECT email FROM userInfo WHERE email = ?";
    klaytndb.query(sql, params, function (err, result, fields) {
        if (err) throw err;
        if (!result) _ok != _ok;
    });

    if (_ok) {
        var account = caver.klay.accounts.create();
        var _address = account.address;
        var _privateK = account.privateKey;
        //DB에 추가 email,password, address, privatekey를 저장


        var data = {
            "email": u_email
        };

        var params = [u_email, u_pw, u_nick, _address, _privateK]
        var sql = "INSERT INTO userInfo (email, password, nickname, wallet_address, private_key) VALUES (?, ?, ?, ?, ?)";
        klaytndb.query(sql, params, function (err, result, fields) {
            if (err) throw err;
        });
        return res.json(result.successTrue(data));
    }
    else {
        var emailError = {
            "name": 'email 중복',
            "errors": {}
        };
        emailError.errors = { message: 'Another user is using same email' };
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
membership.get('find_pw', function (req, res) {
    var _email = req.body.email;
    //DB에서 해당 email의 pw를 찾음.

    klaytndb.connect();
    var params = [u_email]
    var sql = "SELECT password FROM userInfo WHERE email = ?";
    klaytndb.query(sql, params, function (err, result, fields) {
        if (err) throw err;
        return res.json(result);
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
    if (!isValid) return res.json(result.successFalse(validationError));
    else next();
}, function (req, res) {
    var _session = req.body.session_id;
    var m_pw = req.body.password;

    klaytndb.connect();
    var params = [_session]
    var sql = "SELECT email FROM userSession WHERE session_id = ?";
    klaytndb.query(sql, params, function (err, result, fields) {
        if (err) throw err;
        var sql2 = "UPDATE userInfo SET password = ? WHERE email = ?"
        var params = [m_pw, result]
        klaytndb.query(sql2, params2, function (err, result, fields) {
            if (err) throw err;
     });
    });
    //DB에서 해당 session_id로 email을 확인한 후 pw를 변경
    return res.json({ message: 'Success to modify your password!' });
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
    if (!isValid) return res.json(result.successFalse(validationError));
    else next();
}, function (req, res, next) {
    var u_email = req.body.email;
    var authorize_text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 6 ; i++) {
        authorize_text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    var data = {
        "email" : u_email,
        "authorize_text": authorize_text
    };
    mail.transporter.sendMail(mail.mailOption(u_email,authorize_text), function(err, info){
      if(err){
        console.error('Send Mail error : ', err);
      }
      else {
        consile.log('Message sent : ', info);
      }
    });
    return res.json(result.successTrue(data));
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
    if (!req.body.email) {
        isValid = false;
        validationError.errors.email = { message: 'Email is empty' };
    }
    if (!req.body.authorize_text) {
        isValid = false;
        validationError.errors.authorize_text = { message: 'Authorize code is empty' };
    }
    if (!isValid) return res.json(result.successFalse(validationError));
    else next();
}, function (req, res, next) {
    klaytndb.connect();
    var params = [u_email]
    var sql = "SELECT code FROM userAuth WHERE email = ?";
    klaytndb.query(sql, params, function (err, result, fields) {
        if (err) throw err;
        return res.json(result);
    });
    // 이 부분이 잘 이해가 안됌
    var string1 = req.body.authorize_text;
    var string2;
    if (string1 == string2) {
        //session 아이디 반환

        return res.json(result.successTrue(rows));
    }
    else {
        var codeError = {
            "name": 'Authorize code Error',
            "errors": {}
        };
        codeError.errors = { message: 'Diffrent authorize text' };
        return res.json(result.successFalse(codeError));
    }
});


module.exports = membership;
