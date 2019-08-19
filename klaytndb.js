var mysql = require('mysql');
var db = {};
db.klaytndb = mysql.createConnection({
    host: 'klaytn-database.ciitcrpahoo9.ap-northeast-2.rds.amazonaws.com',
    user: 'admin',
    password: 'klaytn2019!',
    port: 3306,
    database: 'klaytndb'
});

db.login1 = function (u_email, u_pw, callback) {
    //db.klaytndb.connect();
    var sql = "SELECT email FROM userInfo WHERE email = ? AND password = ?";
    var params = [u_email, u_pw];
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (err) {
            console.log(err);
            return callback(false);
        } // email과 password가 일치하지 않습니다.
        else {
            var params4 = [u_email];
            var sql4 = "DELETE FROM userSession WHERE email = ?";
            db.klaytndb.query(sql4, params4, function (err, result, fields) {
                if (err) {
                  console.log(err);
                  return callback(false);
                }
                else {
                    var params2 = [u_email];
                    var sql2 = "SELECT private_key FROM userInfo WHERE email = ?";
                    db.klaytndb.query(sql2, params2, function (err, result, fields) {
                        if (err) {
            console.log(err);
            return callback(false);
        }
                        else {
                            console.log("db_login1_success!");
                            //db.klaytndb.end();
                            return callback(result); // private_key 반환
                        }
                    });
                }
            });
        }
    });
};

db.login2 = function (u_email, callback) {
    //db.klaytndb.connect();
    var sql2 = "SELECT MAX(session_id) as max FROM userSession";
    db.klaytndb.query(sql2, function (err, result, fields) {
        if (err) {
            console.log(err);
            return callback(false);
        }
        else {
            result[0].max = result[0].max + 1;
            var sql3 = "INSERT INTO userSession (session_id ,email) VALUES(?, ?)";
            var params3 = [result[0].max, u_email];
            db.klaytndb.query(sql3, params3, function (err, result, fields) {
                if (err) {
            console.log(err);
            return callback(false);
        }
                else {
                    console.log("db_login2_success!");
                    //db.klaytndb.end();
                    return callback(result); // session_id 반환
                }
            });
        }
    });
};

db.logout1 = function (logout_session_id, callback) {
    //db.klaytndb.connect();
    var sql = "SELECT email FROM userSession WHERE session_id = ?";
    var params = [logout_session_id];
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (err) {
            console.log(err);
            return callback(false);
        } // session_id 없음
        else {
            var params2 = [result[0].email];
            var sql2 = "SELECT wallet_address FROM userInfo WHERE email = ?";
            db.klaytndb.query(sql2, params2, function (err, result, fields) {
                if (err) {
            console.log(err);
            return callback(false);
        }
                else {
                    console.log("db_logout1_success!");
                    //db.klaytndb.end();
                    return callback(result); // wallet_address 반환
                }
            });
        }
    });
};

db.getWalletaddressAndPK = function (session_id, callback) {
    //db.klaytndb.connect();
    var sql = "SELECT email FROM userSession WHERE session_id = ?";
    var params = [session_id];
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (err) {
            console.log(err);
            return callback(false);
        } // session_id 없음
        else {
            var params2 = [result[0].email];
            var sql2 = "SELECT wallet_address, private_key FROM userInfo WHERE email = ?";
            db.klaytndb.query(sql2, params2, function (err, result, fields) {
                if (err) {
            console.log(err);
            return callback(false);
        }
                else {
                    console.log(err);
                    //db.klaytndb.end();
                    return callback(result); // wallet_address, private_key 반환
                }
            });
        }
    });
};

db.logout2 = function (logout_session_id, callback) {
    //db.klaytndb.connect();
    var params = [logout_session_id];
    var sql = "DELETE FROM userSession WHERE session_id = ?";
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (err) {
            console.log(err);
            return callback(false);
        } 
        else{
            console.log("db_logout2_success!");
            return callback(true);
        }
        //db.klaytndb.end(); // session_id 삭제
    });
};

db.signup1 = function (u_email, callback) {
    //db.klaytndb.connect();
    var params = [u_email];
    var sql = "SELECT count(email) as total FROM userInfo WHERE email = ?";
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (err) {
            console.log(err);
            return callback(false);
        } 
        else { // email 중복 판단 0(중복없음) or 1(중복있음)
            //console.log(result);
            if(result[0].total)
            {return callback(false);} // 중복 이메일 있는경우
            else{
                console.log("db_signup1_success!");
                return callback(true); // 중복 이메일 없는 경우
            } // result[0].total = 0 or 1
        }
    });
};

db.signup2 = function (u_email, u_pw, u_nick, _address, _privateK, callback) { // authorize_identity에 들어가야함
    //db.klaytndb.connect();
    // result[0].total = 0 인 경우
        /* 여기부터 위에 선언해줘야함
        //caver에서 wallet 생성 후 privateKey와 Address를 돌려줌
        //const account = caver.klay.accounts.create();
        //var _address = account.address;
        //var _privateK = account.privateKey;
        //caver.klay.accounts.wallet.add(_address, _privateK);
        */
        var data = {
            "email": u_email,
            "password": u_pw,
            "nickname": u_nick,
            "wallet_address": _address,
            "privateK": _privateK
        };
        var params2 = [u_email, u_pw, u_nick, _address, _privateK];
        var sql2 = "INSERT INTO userInfo (email, password, nickname, wallet_address, private_key) VALUES (?, ?, ?, ?, ?)";
        db.klaytndb.query(sql2, params2, function (err, result, fields) {
            if (err) {
            console.log(err);
            return callback(false);
        } // 회원가입 성공
            else{
                console.log("db_signup2_success!");
            //db.klaytndb.end();
            return callback(result);
            }
        });
};

db.find_pw_auth_identity1 = function (u_email, callback) {
    //db.klaytndb.connect();
    var params = [u_email];
    var sql = "SELECT count(email) as total FROM userInfo WHERE email = ?";
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (err) {
            console.log(err);
            return callback(false);
        }
        else { // 해당 email 존재 여부 판단 1(존재) or 0(없음)
            //db.klaytndb.end();
            console.log("db_find_pw_auth_identity1_success!");
            return callback(result); // result[0].total = 0 or 1
        }
    });
};

db.find_pw_auth_identity2 = function (u_email, authorize_text, callback) {
    //db.klaytndb.connect();
    var params = [u_email, authorize_text];
    var sql = "INSERT INTO userAuth (email, code) VALUES (?, ?)";
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (err) {
            console.log(err);
            return callback(false);
        }
        else {
            console.log("db_find_pw_auth_identity2_success!");
            //db.klaytndb.end();
            return callback(true); // 인증 코드 저장 성공
        }
    });
};

db.auth_identity_code = function (u_email, callback) { //DB에서 해당 이메일로 들어온 인증코드 리턴 부분에 쓰임
    //db.klaytndb.connect();
    var params = [u_email];
    var sql = "SELECT code FROM userAuth WHERE email = ?";
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (err) {
            console.log(err);
            return callback(false);
        }
        else {
            //db.klaytndb.end();
            console.log("db_auth_identity_code_success!");
            return callback(result); // 인증 code 반환
            }
    });
};

db.find_pw_auth_identity4 = function (u_email, callback) {
     //db.klaytndb.connect();
    var sql1 = "DELETE FROM userAuth WHERE email = ?";
    var params1 = [u_email];
    db.klaytndb.query(sql1, params1, function (err, rows, fields) {
        if (err) {
            console.log(err);
            return callback(false);
        } // 인증 코드 삭제
    });
    var params2 = [u_email]
    var sql2 = "SELECT password FROM userInfo WHERE email = ?";
    db.klaytndb.query(sql2, params2, function (err, result, fields) {
        if (err) {
            console.log(err);
            return callback(false);
        }
        else {
            console.log("db_find_pw_auth_identity4_success!");
            //db.klaytndb.end();
            return callback(result); // pw 반환
        }
    });
};

db.modify_pw = function (_session, m_pw, callback) {
    //db.klaytndb.connect();
    var params = [_session];
    var sql = "SELECT email FROM userSession WHERE session_id = ?";
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (err) {
            console.log(err);
            return callback(false);
        }
        else {
            var sql2 = "UPDATE userInfo SET password = ? WHERE email = ?"
            var params2 = [m_pw, result[0].email];
            db.klaytndb.query(sql2, params2, function (err, result, fields) {
                if (err) 
                {
                    console.log(err);
                    return callback(false);
                } // pw 변경 성공
                else {
                    var codeSuccess = {
                    "name": 'Modify password',
                    "data": {}
                    };
                    codeSuccess.data = { message: 'Success to modify password!' };
                    console.log("db_modify_pw_success!");
                    //db.klaytndb.end();
                    return callback(true);
                }
            });
        }
    });
};

/*
db.authorize_identity = function (u_email, string1) {
    db.klaytndb.connect();
    var params = [u_email];
    var sql = "SELECT code FROM userAuth WHERE email = ?";
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (err) console.log(err); 
        else {
            //var string1 = req.body.authorize_text; 위에서 선언해줘야함
            var string2 = result[0].code;
            if (string1 == string2) { // 인증 성공
                //caver.klay.accounts.wallet.add('u_account_address');
                db.klaytndb.end();
                return result; 
            }
            else {
                var codeError = {
                    "name": 'Authorize code Error',
                    "errors": {}
                };
                codeError.errors = { message: 'Diffrent authorize text' };
                db.klaytndb.end();
                return codeError;
            }
        }
    });
};
*/

db.noname = function (session_id, callback) { // mypage.get('/',function(req,res,next)
    //db.klaytndb.connect();
    var sql = "SELECT email FROM userSession WHERE email = ?";
    var params = [session_id];
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (err) {
            console.log(err);
            return callback(false);
        } // email과 password가 일치하지 않습니다.
        else {
            var params2 = [result[0].email];
            var sql2 = "SELECT wallet_address FROM userInfo WHERE email = ?";
            db.klaytndb.query(sql2, params2, function (err, result, fields) {
                if (err) {
            console.log(err);
            return callback(false);
        }
                else {
                    //db.klaytndb.end();
                    console.log("db_noname_success!");
                    return callback(result); // wallet_address 반환
                }
            });
        }
    });
};

db.registerTransaction = function (transaction, wallet_address, callback) { // 트랜잭션, 지갑 주소 저장
    //db.klaytndb.connect();
    var params = [transaction, wallet_address];
    var sql = "INSERT INTO transaction VALUES (?, ?)";
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (err) {
            console.log(err);
            return callback(false);
        }
        else {
            console.log("db_registerTransaction_success!");
            return callback(true);
        }
    });
};

db.showTransaction = function (session_id, callback) { // //DB에서 세션 아이디로 해당 유저의 transaction list 반환
    //db.klaytndb.connect();
    var params = [session_id];
    var sql = "SELECT email FROM userSession WHERE session_id = ?";
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (err) {
            console.log(err);
            return callback(false);
        }
        else {
            var params2 = [result[0].email];
            var sql2 = "SELECT wallet_address FROM userInfo WHERE email = ?";
            db.klaytndb.query(sql2, params2, function (err, result, fields) {
                if (err) {
            console.log(err);
            return callback(false);
        }
                else {
                    var params3 = [result[0].wallet_address];
                    var sql3 = "SELECT transaction FROM transaction WHERE wallet_address = ?";
                    db.klaytndb.query(sql3, params3, function (err, result, fields) {
                        if (err) {
            console.log(err);
            return callback(false);
        }
                        else {
                            //db.klaytndb.end();
                            console.log("db_showTransaction_success!");
                            return callback(result);
                            }
                    });
                 }
            });
        }
    });
};

db.my_question_list = function (session_id, callback) {
    //db.klaytndb.connect();
    var params = [session_id];
    var sql = "SELECT email FROM userSession WHERE session_id = ?";
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (err) {
            console.log(err);
            return callback(false);
        }
        else {
            var params2 = [result[0].email];
            var sql3 = "SELECT question_num FROM question WHERE email = ?";
            db.klaytndb.query(sql3, params2, function (err, result, fields) {
                if (err) {
            console.log(err);
            return callback(false);
        }
                else {
                    var params3 = [result[0].question_num];
                    var sql4 = "SELECT count(is_selected) as total FROM answer WHERE question_num = ?";
                    db.klaytndb.query(sql4, params3, function (err, result, fields) {
                        if (err) {
            console.log(err);
            return callback(false);
        }
                        else {
                            if (result[0].total == 0) { // 답변 없는 경우
                                var sql5 = "SELECT question.question_title, question.question_content, question.klay, category.category FROM question INNER JOIN category ON question.question_num = ?  AND question.category_num = category.category_num";
                                db.klaytndb.query(sql5, params3, function (err, result, fields) {
                                    if (err) {
            console.log(err);
            return callback(false);
        }
                                    else {
                                        result[0].is_selected = "false"; // 답변이 없으니 채택 여부 false
                                        console.log("db_my_question_list_success!");
                                        //db.klaytndb.end();
                                        return callback(result); // 해당 유저의 질문을 제목,내용,클레이양, 카테고리, 상태를 리스트로 반환
                                    }
                                });
                            }
                            else { // 답변 있는 경우
                                var sql6 = "SELECT question.question_num, question.email, question.question_title, category.category, question.question_content, question.klay, question.time, answer.is_selected FROM question INNER JOIN answer ON question.question_num = ? AND question.question_num = answer.question_num INNER JOIN category ON question.category_num = category.category_num";
                                db.klaytndb.query(sql6, params3, function (err, result, fields) {
                                    if (err) {
            console.log(err);
            return callback(false);
        }
                                    else {
                                        console.log("db_my_question_list_success!");
                                        //db.klaytndb.end();
                                        return callback(result); // 해당 유저의 질문을 제목,내용,클레이양, 카테고리, 상태를 리스트로 반환
                                    }
                                });
                            }
                        }
                    });
                }
            });
        }
    });
};

db.my_answer_list = function (session_id, callback) {
    //db.klaytndb.connect();
    var params = [session_id];
    var sql = "SELECT email FROM userSession WHERE session_id = ?";
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (err) {
            console.log(err);
            return callback(false);
        }
        else {
            var params2 = [result[0].email];
            var sql2 = "SELECT question.question_title ,answer.answer_content, answer.is_selected FROM question JOIN answer ON answer.email = ?";
            db.klaytndb.query(sql2, params2, function (err, result, fields) {
                if (err) {
            console.log(err);
            return callback(false);
        }
                else {
                    //db.klaytndb.end();
                    console.log("db_my_answer_list_success!");
                    return callback(result); // 답변 제목, 답변 내용, 채택 여부를 리스트로 반환
                }
            });
        }
    });
};

/*db.my_like_list = function (session_id, callback) {
    //db.klaytndb.connect();
    var params = [session_id];
    var sql = "SELECT email FROM userSession WHERE session_id = ?";
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (err) {
            console.log(err);
            return callback(false);
        }
        else {
            var params2 = [result[0].email];
            var sql2 = "SELECT question_num, answer_num FROM userLike WHERE email = ?";
            db.klaytndb.query(sql2, params2, function (err, result, fields) {
                if (err) {
            console.log(err);
            return callback(false);
        }
                else {
                    console.log("db_my_like_list_success!");
                    //db.klaytndb.end();
                    return callback(result);
                }
            });
        }
    });
};*/

db.my_like_list = function (session_id, callback) {
    //db.klaytndb.connect();
    var params = [session_id];
    var sql = "SELECT email FROM userSession WHERE session_id = ?";
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (err) {
            console.log(err);
            return callback(false);
        }
        else {
            var params2 = [result[0].email];
            var sql2 = "SELECT email, answer_num FROM userLike WHERE email = ?";
            db.klaytndb.query(sql2, params2, function (err, result, fields){
                if (err) {
                    console.log(err);
                    return callback(false);
                }
                else {
                    var params3 = [result[0].email, result[0].answer_num];
                var sql3 = "SELECT l1.question_num, l1.answer_num, count(l2.answer_num) as like_num FROM userLike as l1 JOIN userLike as l2 ON l1.email = ? AND l2.answer_num = ?";
                db.klaytndb.query(sql3, params3, function (err, result, fields) {
                    if (err) {
                        console.log(err);
                        return callback(false);
                    }
                    else {
                        console.log("db_my_like_list_success!");
                        //db.klaytndb.end();
                        return callback(result);
                    }
                });
            }
            });
        }
    });
};

/*db.my_like_count = function (answer_num, callback) {
    //db.klaytndb.connect();
    var params = [answer_num];
    var sql = "SELECT count(answer_num) as like_num FROM userLike WHERE answer_num = ?";
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (err) {
            console.log(err);
            return callback(false);
        }
        else {
            //db.klaytndb.end();
            console.log("db_my_like_count_success!");
            return callback(result); // result[0].like_num 은 like 수
        }
    });
};*/

db.my_remain_klay = function (session_id, callback) {
    //db.klaytndb.connect();
    var params = [session_id];
    var sql = "SELECT email FROM userSession WHERE session_id = ?";
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (err) {
            console.log(err);
            return callback(false);
        }
        else{
            var params2 = [result[0].email];
            var sql2 = "SELECT wallet_address FROM userInfo WHERE email = ?";
            db.klaytndb.query(sql2, params2, function (err, results, fields) {
                if (err) {
            console.log(err);
            return callback(false);
        }
                else{
                    //db.klaytndb.end();
                    console.log("db_my_remain_klay_success!");
                    return callback(results); // wallet_address 반환
                }
            });
        }
    });
};

db.category = function (callback) {
    //db.klaytndb.connect();
    var sql = "SELECT * FROM category";
    db.klaytndb.query(sql, function (err, result, fields) {
        if (err) {
            console.log(err);
            return callback(false);
        }
        else {
            //db.klaytndb.end();
            console.log("db_category_success!");
            return callback(result);
        }
    });
};

db.insert_question1 = function (session_id, question_title, question_klay, question_content, category, trans_time, callback) {
    //db.klaytndb.connect();
    var sql = "SELECT count(*) as total FROM question";
    db.klaytndb.query(sql, function (err, result, fields) {
        if (err) {
            console.log(err);
            return callback(false);
        }
        else {
            var question_num = result[0].total + 1;
            var sql = "SELECT email FROM userSession WHERE session_id = ?";
            var params = [session_id];
            db.klaytndb.query(sql, params, function (err, results, fields) {
                if (err) {
            console.log(err);
            return callback(false);
        }
                else {
                    var params2 = [question_num, results[0].email, question_title, category, question_content, question_klay, trans_time];
                    var sql2 = "INSERT INTO question (question_num, email, question_title, category_num, question_content, klay, time) VALUES (?, ?, ?, ?, ?, ?, ?)";
                    db.klaytndb.query(sql2, params2, function (err, result, fields) {
                        if (err) {
            console.log(err);
            return callback(false);
        } // 질문 등록 성공
                        else {
                            //db.klaytndb.end();
                            console.log("db_insert_question1_success!");
                            return callback(result);
                        }
                    });
                }
            });
        }
    });
};

db.insert_question2 = function (session_id, transaction, callback) {
    //db.klaytndb.connect();
    var params = [session_id];
    var sql = "SELECT email FROM userSession WHERE session_id = ?";
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (err) {
            console.log(err);
            return callback(false);
        }
        else {
            var sql2 = "SELECT wallet_address FROM userInfo WHERE email = ?";
            var params2 = [result[0].email];
            db.klaytndb.query(sql2, params2, function (err, results, fields) {
                if (err) {
            console.log(err);
            return callback(false);
        }
                else {
                    var params3 = [transaction, results[0].wallet_address];
                    var sql3 = "INSERT INTO transaction (transaction, results[0].wallet_address) VALUES (?, ?)";
                    db.klaytndb.query(sql3, params3, function (err, result, fields) {
                        if (err) {
            console.log(err);
            return callback(false);
        }
                        else {
                            //db.klaytndb.end();
                            console.log("db_insert_question2_success!");
                            return callbakc(result); // transaction, wallet_address 저장
                        }
                    });
                }
            });
        }
    });
};

db.show_question = function (question_num, callback) {
    //db.klaytndb.connect();
    var sql = "SELECT count(is_selected) as total FROM answer WHERE question_num = ?";
    var params = [question_num];
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (err) {
            console.log(err);
            return callback(false);
        }
        else {
            if (result[0].total == 0) { // 답변 없는 경우
                var sql2 = "SELECT question.question_num, question.email, question.question_title, category.category, question.question_content, question.klay, question.time FROM question INNER JOIN category ON question.question_num = ?  AND question.category_num = category.category_num";
                var params2 = [question_num];
                db.klaytndb.query(sql2, params2, function (err, result, fields) {
                    if (err) {
            console.log(err);
            return callback(false);
        }
                    else {
                        result[0].is_selected = "false"; // 답변이 없으니 채택 여부 false
                        //db.klaytndb.end();
                        console.log("db_show_question_success!");
                        return callback(result);
                    }
                });
            }
            else { // 답변 있는 경우
                var sql3 = "SELECT question.question_num, question.email, question.question_title, category.category, question.question_content, question.klay, question.time, answer.answer_num, answer.email, answer.answer_content, answer.is_selected FROM question INNER JOIN answer ON question.question_num = ? AND question.question_num = answer.question_num INNER JOIN category ON question.category_num = category.category_num";
                var params3 = [question_num];
                db.klaytndb.query(sql3, params3, function (err, result, fields) {
                    if (err) {
            console.log(err);
            return callback(false);
        }
                    else {
                        console.log("db_show_question_success!");
                        //db.klaytndb.end();
                        return callback(result); // 질문 번호, 질문자 이메일, 질문 제목, 카테고리, 질문 내용, klay, 질문 시간, 답변 번호, 답변자 이메일, 답변 내용, 답변 채택 여부 반환
                    }
                });
            }
        }
    });
};

db.questionListDefault = function (cur_time, callback) { // 디폴트, 지금은 채택 여부 없고, 만약 채택 여부도 반환하려면 질문 번호를 다 받아야함
    //db.klaytndb.connect();
    var sql1 = "SELECT question.question_num, question.question_title, question.email, category.category, question.klay, question.time FROM question INNER JOIN category ON question.category_num = category.category_num";
    db.klaytndb.query(sql1, function (err, result, fields) {
        if (err) {
            console.log(err);
            return callback(false);
        }
        else {
            //db.klaytndb.end();
            console.log("db_question_list_success!");
            return callback(result); // 질문 번호, 질문 제목, 질문자 이메일, 카테고리, klay, 질문 시간 반환
        }
    });
};

db.questionListCategory = function (category_num, callback) { // 카테고리별
    //db.klaytndb.connect();
    var sql = "SELECT question.question_num, question.question_title, question.email, category.category, question.klay, question.time FROM question INNER JOIN category ON question.category_num = ? AND question.category_num = category.category_num";
    var params = [category_num];
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (err) {
            console.log(err);
            return callback(false);
        }
        else {
            //db.klaytndb.end();
            console.log("db_question_list_success!");
            return callback(result); // 질문 번호, 질문 제목, 질문자 이메일, 카테고리, klay, 질문 시간 반환
        }
    });
};

db.questionListKeyword = function (keyword, callback) { // 키워드 검색
    //db.klaytndb.connect();
    var sql = "SELECT question.question_num, question.question_title, question.email, category.category, question.klay, question.time FROM question INNER JOIN category ON question.category_num = ? AND question.question_content like '%?%'";
    var params = [keyword];
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (err) {
            console.log(err);
            return callback(false);
        }
        else {
            //db.klaytndb.end();
            console.log("db_question_list_success!");
            return callback(result); // 질문 번호, 질문 제목, 질문자 이메일, 카테고리, klay, 질문 시간 반환
        }
    });
};

db.questionListTime = function (callback) { // 최신순
    //db.klaytndb.connect();
    var sql = "SELECT question.question_num, question.question_title, question.email, category.category, question.klay, question.time FROM question INNER JOIN category ON question.category_num = category.category_num ORDER BY question.time DESC";
    db.klaytndb.query(sql, function (err, result, fields) {
        if (err) {
            console.log(err);
            return callback(false);
        }
        else {
            //db.klaytndb.end();
            console.log("db_question_list_success!");
            return callback(result); // 질문 번호, 질문 제목, 질문자 이메일, 카테고리, klay, 질문 시간 반환
        }
    });
};

db.questionListKlay = function (callback) { // klay순
    //db.klaytndb.connect();
    var sql = "SELECT question.question_num, question.question_title, question.email, category.category, question.klay, question.time FROM question INNER JOIN category ON question.category_num = category.category_num ORDER BY question.klay DESC";
    db.klaytndb.query(sql, function (err, result, fields) {
        if (err) {
            console.log(err);
            return callback(false);
        }
        else {
            //db.klaytndb.end();
            console.log("db_question_list_success!");
            return callback(result); // 질문 번호, 질문 제목, 질문자 이메일, 카테고리, klay, 질문 시간 반환
        }
    });
};

db.questionListState = function (cur_time, sort_num, callback) { // 게시판 분류
    // 1.답변 진행중(q_selected = false, cur_time - question.time < 7days), 2. Like 진행중(q_selected = false, cur_time - question.time > 7days)
    // 3. 답변 채택 완료(q_selected = true)
    //db.klaytndb.connect();
    if (sort_num == 3) {
        var sql2 = "SELECT question.question_num, question.email, question.question_title, category.category, question.question_content, question.klay, question.time FROM question INNER JOIN category ON question.q_selected = true AND question.category_num = category.category_num";
        db.klaytndb.query(sql2, function (err, result, fields) {
            if (err) {
                console.log(err);
                return callback(false);
            }
            else {
                console.log("db_question_list_success!");
                return callback(result);
            }
        });
    }
    else {
        var sql2 = "SELECT question_num, time FROM question WHERE q_selected = false";
        db.klaytndb.query(sql2, function (err, result, fields) {
            if (err) {
                console.log(err);
                return callback(false);
            }
            else {
                if (cur_time - result[0].time < '168:00:00') { // 답변 진행중
                    var sql3 = "SELECT question.question_num, question.email, question.question_title, category.category, question.question_content, question.klay, question.time FROM question INNER JOIN category ON question.q_selected = false AND question.category_num = category.category_num AND ? - ? < '168:00:00'";
                    var params3 = [cur_time, result[0].time];
                    db.klaytndb.query(sql3, params3, function (err, result, fields) {
                        if (err) {
                            console.log(err);
                            return callback(false);
                        }
                        else {
                            console.log("db_show_question_success!");
                            //db.klaytndb.end();
                            return callback(result); // 질문 번호, 질문자 이메일, 질문 제목, 카테고리, 질문 내용, klay, 질문 시간 반환
                        }
                    });
                }
                else { // Like 진행중
                    var sql3 = "SELECT question.question_num, question.email, question.question_title, category.category, question.question_content, question.klay, question.time FROM question INNER JOIN category ON question.q_selected = false AND question.category_num = category.category_num AND ? - ? > '168:00:00'";
                    var params3 = [cur_time, result[0].time];
                    db.klaytndb.query(sql3, params3, function (err, result, fields) {
                        if (err) {
                            console.log(err);
                            return callback(false);
                        }
                        else {
                            console.log("db_show_question_success!");
                            //db.klaytndb.end();
                            return callback(result); // 질문 번호, 질문자 이메일, 질문 제목, 카테고리, 질문 내용, klay, 질문 시간 반환
                        }
                    });
                }
            }
        });
    }
};

db.insertAnswer = function (session_id, answer_content, question_num, callback) {
    //db.klaytndb.connect();
    var sql = "SELECT count(*) as total FROM answer";
    db.klaytndb.query(sql, function (err, result, fields) {
        if (err) {
            console.log(err);
            return callback(false);
        }
        else {
            result[0].total = result[0].total + 1;
            var sql2 = "SELECT email FROM userSession WHERE session_id = ?";
            var params2 = [session_id];
            db.klaytndb.query(sql2, params2, function (err, results, fields) {
                if (err) {
            console.log(err);
            return callback(false);
        }
                else {
                    var sql3 = "INSERT INTO answer (answer_num, email, answer_content, question_num) VALUES (?, ?, ?, ?)";
                    var params3 = [result[0].total, results[0].email, answer_content, question_num];
                    db.klaytndb.query(sql3, params3, function (err, result, fields) {
                        if (err) {
            console.log(err);
            return callback(false);
        } // 답변 등록 성공
                        else {
                            //db.klaytndb.end();
                            console.log("db_insert_answer_success!");
                            return callback(true);
                        }
                    });
                }
            });
        }
    });
};

db.insertLike = function (session_id, question_num, answer_num, callback) {
    //db.klaytndb.connect();
    var sql2 = "SELECT email FROM userSession WHERE session_id = ?";
    var params2 = [session_id];
    db.klaytndb.query(sql2, params2, function (err, results, fields) {
        if (err) {
            console.log(err);
            return callback(false);
        }
        else {
            var sql = "INSERT INTO userLike (question_num, answer_num ,email) VALUES (?, ?, ?)";
            var params = [question_num, answer_num, results[0].email];
            db.klaytndb.query(sql, params, function (err, result, fields) {
                if (err) {
            console.log(err);
            return callback(false);
        } // like 성공
                else {
                    //db.klaytndb.end();
                    console.log("db_insert_like_success!");
                    return callback(true);
                }
            });
        }
    });
};

db.selectAnswerOne = function (question_num, answer_num, callback) {
    //db.klaytndb.connect();
    var sql4 = "UPDATE question SET q_selected = true WHERE question_num = ?";
    var params4 = [question_num];
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (err){
            console.log(err);
            return callback(false);
        }
    }); // 질문 상태 채택 여부 true
    var sql = "UPDATE answer SET is_selected = true WHERE question_num = ? AND answer_num = ?";
    var params = [question_num, answer_num];
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (err) {
            console.log(err);
            return callback(false);
        } // 답변 상태 채택 여부 true로 변경
    });
    var sql2 = "SELECT email FROM answer WHERE answer_num = ?";
    var params2 = [answer_num];
    db.klaytndb.query(sql2, params2, function (err, result, fields) {
        if (err) {
            console.log(err);
            return callback(false);
        }
        else {
            var sql3 = "SELECT wallet_address FROM userInfo WHERE email = ?";
            var params3 = [result[0].email];
            db.klaytndb.query(sql3, params3, function (err, result, fields) {
                if (err) {
            console.log(err);
            return callback(false);
        }
                else {
                    console.log("db_select_answer_success!");
                    //db.klaytndb.end();
                    return callback(result); // wallet_address 
                }
            });
        }
    });
};

db.selectAnswerTwo = function (wallet_address, transaction, callback) {
    //db.klaytndb.connect();
                    var params = [transaction, wallet_address];
                    var sql = "INSERT INTO transaction (transaction, wallet_address) VALUES (?, ?)";
                    db.klaytndb.query(sql, params, function (err, result, fields) {
                        if (err) {
            console.log(err);
            return callback(false);
        }
                        else {
                            //db.klaytndb.end();
                            console.log("db_insert_question2_success!");
                            return callbakc(true); // transaction, wallet_address 저장
                        }
                    });
};

module.exports = db;
