var mysql = require('mysql');
var db = {};
db.klaytndb = mysql.createConnection({
    host: 'klaytn-database.ciitcrpahoo9.ap-northeast-2.rds.amazonaws.com',
    user: 'admin',
    password: 'klaytn2019!',
    port: 3306,
    database: 'klaytndb'
});

db.login = function (u_email, u_pw) {
    db.connect();
    var sql = "SELECT email FROM userInfo WHERE email = ? AND password = ?";
    var params = [u_email, u_pw];
    klaytndb.query(sql, params, function (err, result, fields) {
        if (err) console.log(err); // email과 password가 일치하지 않습니다.
        else {
            var params4 = [u_email];
            var sql4 = "DELETE FROM userSession WHERE email = ?";
            klaytndb.query(sql4, params4, function (err, result, fields) {
                if (err) console.log(err);
            });
        }
    });
    var sql2 = "SELECT MAX(session_id) as max FROM userSession";
    klaytndb.query(sql2, function (err, result, fields) {
        if (err) console.log(err);
        else {
            result[0].max = result[0].max + 1;
            var sql3 = "INSERT INTO userSession (session_id ,email) VALUES(?, ?)";
            var params3 = [result[0].max, u_email];
            klaytndb.query(sql3, params3, function (err, result, fields) {
                if (err) console.log(err); // login 성공
                else {
                    db.end();
                    return res.json(result);
                }
            });
        }
    });
};

db.logout = function (logout_session_id) {
    db.connect();
    var params = [logout_session];
    var sql = "DELETE FROM userSession WHERE session_id = ?";
    klaytndb.query(sql, params, function (err, result, fields) {
        if (err) console.log(err); // logout 성공
        db.end();
    });
};

db.signup = function (u_email, u_pw, u_nick) {
    db.connect();
    var params = [u_email];
    var sql = "SELECT email FROM userInfo WHERE email = ?";
    klaytndb.query(sql, params, function (err, result, fields) {
        if (err) console.log(err);
        else {
            _ok = true;
            if (_ok) {
                //caver에서 wallet 생성 후 privateKey와 Address를 돌려줌
                //const account = caver.klay.accounts.create();
                //var _address = account.address;
                //var _privateK = account.privateKey;
                //caver.klay.accounts.wallet.add(_address, _privateK);
                var data = {
                    "email": u_email,
                    "password": u_pw,
                    "nickname": u_nick,
                    "wallet_address": _address,
                    "privateK": _privateK
                };
                var params2 = [u_email, u_pw, u_nick, _address, _privateK];
                var sql2 = "INSERT INTO userInfo (email, password, nickname, wallet_address, private_key) VALUES (?, ?, ?, ?, ?)";
                klaytndb.query(sql2, params2, function (err, result, fields) {
                    if (err) console.log(err); // 회원가입 성공
                    db.end();
                    return res.json(result);
                });
            }
            else {
                var emailError = {
                    "name": 'email 중복',
                    "errors": {}
                };
                emailError.errors = { message: 'Another user is using same email' };
                db.end();
                return res.json(result);
            }
        }
    });
};

db.find_pw = function (u_email) {
    db.connect();
    var params = [u_email];
    var sql = "SELECT password FROM userInfo WHERE email = ?";
    klaytndb.query(sql, params, function (err, result, fields) {
        if (err) console.log(err); // 여기 로직 바뀐거 앞 부분을 어떻게 이어야할지 모르겠습니다.
        else {
            db.end();
            return res.json(result);
        }
    });
};

db.modify_pw = function (_session, m_pw) {
    db.connect();
    var params = [_session];
    var sql = "SELECT email FROM userSession WHERE session_id = ?";
    klaytndb.query(sql, params, function (err, result, fields) {
        if (err) console.log(err);
        else {
            var sql2 = "UPDATE userInfo SET password = ? WHERE email = ?"
            var params2 = [m_pw, result[0].email];
            klaytndb.query(sql2, params2, function (err, result, fields) {
                if (err) console.log(err); // pw 변경 성공
                else {
                    db.end();
                    return res.json({ message: 'Success to modify your password!' });
                }
            });
        }
    });
};

db.authorize_identity = function (u_email, string1) {
    db.connect();
    var params = [u_email];

    var sql = "SELECT code FROM userAuth WHERE email = ?";
    klaytndb.query(sql, params, function (err, result, fields) {
        if (err) console.log(err); 
        else {
            //var string1 = req.body.authorize_text; 위에서 선언해줘야함
            var string2 = result[0].code;
            if (string1 == string2) { // 인증 성공
                //caver.klay.accounts.wallet.add('u_account_address');
                db.end();
                return res.json(result); 
            }
            else {
                var codeError = {
                    "name": 'Authorize code Error',
                    "errors": {}
                };
                codeError.errors = { message: 'Diffrent authorize text' };
                db.end();
                return res.json(result);
            }
        }
    });
};

db.transaction = function (session_id) {
    db.connect();
    var params = [session_id];
    var sql = "SELECT email FROM userSession WHERE session_id = ?";
    klaytndb.query(sql, params, function (err, result, fields) {
        if (err) console.log(err);
        else {
            // email 은 result[0].email 에 저장되어 있음
            //var data = new Array();
            //for (var i = 0 ; i < b_list.length ; i++) {
            //data[i] = caver.klay.getBlock(b_list[i]);
            //}
            db.end();
            return res.json(result);
        }
    });
};

db.my_question_list = function (session_id) {
    db.connect();
    var params = [session_id];
    var sql = "SELECT email FROM userSession WHERE session_id = ?";
    klaytndb.query(sql, params, function (err, result, fields) {
        if (err) console.log(err);
        else {
            var params2 = [result[0].email];
            var sql2 = "SELECT question.question_title, question.question_content, question.klay, category.category FROM question JOIN category WHERE question.email = ? AND question.category_num = category.category_num";
            klaytndb.query(sql2, params2, function (err, result, fields) {
                if (err) console.log(err);
                else {
                    db.end();
                    return res.json(result);
                }
            });
        }
    });
};

db.my_answer_list = function (session_id) {
    db.connect();
    var params = [session_id];
    var sql = "SELECT email FROM userSession WHERE session_id = ?";
    klaytndb.query(sql, params, function (err, result, fields) {
        if (err) console.log(err);
        else {
            var params2 = [result[0].email];
            var sql2 = "SELECT question.question_title ,answer.answer_content, answer.is_selected FROM question JOIN answer ON answer.email = ?";
            klaytndb.query(sql2, params2, function (err, result, fields) {
                if (err) console.log(err);
                else {
                    db.end();
                    return res.json(result);
                }
            });
        }
    });
};

db.my_like_list = function (session_id) {
    db.connect();
    var params = [session_id];
    var sql = "SELECT email FROM userSession WHERE session_id = ?";
    klaytndb.query(sql, params, function (err, result, fields) {
        if (err) console.log(err);
        else {
            var params2 = [result[0].email];
            var sql2 = "SELECT question_num, answer_num FROM userLike WHERE email = ?";
            klaytndb.query(sql2, params2, function (err, result, fields) {
                if (err) console.log(err);
                else {
                    db.end();
                    return res.json(result);
                }
            });
        }
    });
};

db.my_remain_klay = function (session_id) {
    db.connect();
    var params = [session_id];
    var sql = "SELECT email FROM userSession WHERE session_id = ?";
    klaytndb.query(sql, params, function (err, result, fields) {
        if (err) console.log(err);
        else{
            var params2 = [result[0].email];
            var sql2 = "SELECT wallet_address FROM userInfo WHERE email = ?";
            klaytndb.query(sql2, params2, function (err, results, fields) {
                if (err) console.log(err);
                else{
                    // wallet_address 는 result[0].wallet_address 에 있음
                    // caver
                    //var u_account_address;
                    //var u_klay = caver.klay.getBalance('u_account_address');
                    //큰 따음표일 수 있다.
                    //var data = {
                    //    klay: u_klay
                    //};
                    db.end();
                    return res.json(results);
                }
            });
        }
    });
};

db.category = function () {
    db.connect();
    var sql = "SELECT * FROM category";
    klaytndb.query(sql, function (err, result, fields) {
        if (err) console.log(err);
        else {
            db.end();
            return res.json(result);
        }
    });
};

db.insert_question = function (session_id, question_title, question_klay, question_content, category, trans_time) {
    db.connect();
    var sql = "SELECT count(*) as total FROM question";
    klaytndb.query(sql, function (err, result, fields) {
        if (err) console.log(err);
        else {
            question_num = result[0].total + 1;
            var sql = "SELECT email FROM userSession WHERE session_id = ?";
            var params = [session_id];
            klaytndb.query(sql, params, function (err, results, fields) {
                if (err) console.log(err);
                else {
                    var params2 = [question_num, results[0].email, question_title, category, question_content, question_klay, trans_time];
                    var sql2 = "INSERT INTO question (question_num, email, question_title, category_num, question_content, klay, time) VALUES (?, ?, ?, ?, ?, ?, ?)";
                    klaytndb.query(sql2, params2, function (err, result, fields) {
                        if (err) console.log(err); // 질문 등록 성공
                        else {
                            db.end();
                            return res.json(result);
                        }
                    });
                }
            });
        }
    });
};

db.show_question = function (question_num) {
    db.connect();
    var sql = "SELECT count(is_selected) as total FROM answer WHERE question_num = ?";
    var params = [question_num];
    klaytndb.query(sql, params, function (err, result, fields) {
        if (err) console.log(err);
        else {
            if (result[0].total == 0) { // 답변 없는 경우
                var sql2 = "SELECT question.question_num, question.email, question.question_title, category.category, question.question_content, question.klay, question.time FROM question INNER JOIN category ON question.question_num = ?  AND question.category_num = category.category_num";
                var params2 = [question_num];
                klaytndb.query(sql2, params2, function (err, result, fields) {
                    if (err) console.log(err);
                    else {
                        result[0].is_selected = "false"; // 답변이 없으니 채택 여부 false
                        db.end();
                        return res.json(result);
                    }
                });
            }
            else { // 답변 있는 경우
                var sql3 = "SELECT question.question_num, question.email, question.question_title, category.category, question.question_content, question.klay, question.time, answer.is_selected FROM question INNER JOIN answer ON question.question_num = ? AND question.question_num = answer.question_num INNER JOIN category ON question.category_num = category.category_num";
                var params3 = [question_num];
                klaytndb.query(sql3, params3, function (err, result, fields) {
                    if (err) console.log(err);
                    else {
                        db.end();
                        return res.json(result);
                    }
                });
            }
        }
    });
};

db.question_list = function (question_num) {
    db.connect();
    var sql = "SELECT time FROM question WHERE question_num = ?";
    var params = [question_num];
    klaytndb.query(sql, params, function (err, result, fields) {
        if (err) console.log(err);
        else {
            remain_date = result[0].time; //remain_date 위에서 선언되어야함
            db.end();
            return res.json(result);
        }
    });
};

db.insert_answer = function (session_id, answer_content, question_num) {
    db.connect();
    var sql = "SELECT count(*) as total FROM answer";
    klaytndb.query(sql, function (err, result, fields) {
        if (err) console.log(err);
        else {
            result[0].total = result[0].total + 1;
            var sql2 = "SELECT email FROM userSession WHERE session_id = ?";
            var params2 = [session_id];
            klaytndb.query(sql2, params2, function (err, results, fields) {
                if (err) console.log(err);
                else {
                    var sql3 = "INSERT INTO answer (answer_num, email, answer_content, question_num) VALUES (?, ?, ?, ?)";
                    var params3 = [result[0].total, results[0].email, answer_content, question_num];
                    klaytndb.query(sql3, params3, function (err, result, fields) {
                        if (err) console.log(err); // 답변 등록 성공
                        else {
                            db.end();
                            return res.json(result);
                        }
                    });
                }
            });
        }
    });
};

db.insert_like = function (session_id, question_num, answer_num) {
    db.connect();
    var sql2 = "SELECT email FROM userSession WHERE session_id = ?";
    var params2 = [session_id];
    klaytndb.query(sql2, params2, function (err, results, fields) {
        if (err) console.log(err);
        else {
            var sql = "INSERT INTO userLike (question_num, answer_num ,email) VALUES (?, ?, ?)";
            var params = [question_num, answer_num, results[0].email];
            klaytndb.query(sql, params, function (err, result, fields) {
                if (err) console.log(err); // like 성공
                else {
                    db.end();
                    return res.json(result);
                }
            });
        }
    });
};

db.select_answer = function (question_num, answer_num) {
    db.connect();
    var sql = "UPDATE answer SET is_selected = true WHERE question_num = ? AND answer_num = ?";
    var params = [question_num, answer_num];
    klaytndb.query(sql, params, function (err, result, fields) {
        if (err) console.log(err); // 답변 상태 채택 여부 true로 변경
    });
    var sql2 = "SELECT email FROM answer WHERE answer_num = ?";
    var params2 = [answer_num];
    klaytndb.query(sql2, params2, function (err, result, fields) {
        if (err) console.log(err);
        else {
            var sql3 = "SELECT wallet_address FROM userInfo WHERE email = ?";
            var params3 = [result[0].email];
            klaytndb.query(sql3, params3, function (err, result, fields) {
                if (err) console.log(err);
                else {
                    wallet_address = result[0].wallet_address;
                    // wallet_address 는 위에서 변수 선언되어야함
                    //caver
                    //DB에서 session_id로 들어온 email과 answer_id로 들어온 id의 wallet을 찾는다.
                    //caver에서 server의 wallet에서 answer_id의 wallet으로 klay 전송
                    var q_state = true;
                    var data = {
                        question_state: q_state
                    };
                    db.end();
                    return res.json(result);
                }
            });
        }
    });
};
