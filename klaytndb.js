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
    var params3 = [u_email, u_pw];
    var sql3 = "SELECT count(email) as total FROM userInfo WHERE email = ? AND password = ?";
    db.klaytndb.query(sql3, params3, function (err, result, fields) {
        if (result[0].total) {
            var params3 = [u_email];
            var sql3 = "SELECT count(session_id) as totals FROM userSession WHERE email = ?";
            db.klaytndb.query(sql3, params3, function (err, result, fields) {
                if (result[0].totals) {
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
                                    return callback(result); // private_key 반환
                                }
                            });
                        }
                    });
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
                            return callback(result); // private_key 반환
                        }
                    });
                }
            });
        }
        else {
            return callback(false);
        }
    });
};

db.login2 = function (u_email, callback) {
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
                    var sql = "SELECT session_id FROM userSession WHERE email =?";
                    var params = [u_email];
                    db.klaytndb.query(sql, params, function (err, result, fields) {
                        if (err) {
                            console.log(err);
                            return callback(false);
                        }
                        else {
                            return callback(result); // session_id 반환
                        }
                    });
                }
            });
        }
    });
};

db.logout1 = function (logout_session_id, callback) {
    var params = [logout_session_id];
    var sql = "SELECT count(email) as total FROM userSession WHERE session_id = ?";
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (result[0].total) {
            var sql = "SELECT email FROM userSession WHERE session_id = ?";
            var params = [logout_session_id];
            db.klaytndb.query(sql, params, function (err, result, fields) {
                if (err) {
                    console.log(err);
                    return callback(false);
                }
                else {
                    var params = [result[0].email];
                    var sql = "SELECT email, count(wallet_address) as totals FROM userInfo WHERE email = ?";
                    db.klaytndb.query(sql, params, function (err, result, fields) {
                        if (result[0].totals) {
                            var params2 = [result[0].email];
                            var sql2 = "SELECT wallet_address FROM userInfo WHERE email = ?";
                            db.klaytndb.query(sql2, params2, function (err, result, fields) {
                                if (err) {
                                    console.log(err);
                                    return callback(false);
                                }
                                else {
                                    return callback(result); // wallet_address 반환
                                }
                            });
                        }
                        else { // wallet_address 없음
                            return callback(false);
                        }
                    });
                }
            });
        }
        else { // session_id 없음
            return callback(false);
        }
    });
};

db.getWalletaddressAndPK = function (session_id, callback) {
    var sql = "SELECT count(email) as total FROM userSession WHERE session_id = ?";
    var params = [session_id];
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (result[0].total) {
            var sql = "SELECT email FROM userSession WHERE session_id = ?";
            var params = [session_id];
            db.klaytndb.query(sql, params, function (err, result, fields) {
                if (err) {
                    console.log(err);
                    return callback(false);
                }
                else {
                    var sql = "SELECT email, count(wallet_address) as totals FROM userInfo WHERE email = ?";
                    var params = [result[0].email];
                    db.klaytndb.query(sql, params, function (err, result, fields) {
                        if (result[0].totals) {
                            var params2 = [result[0].email];
                            var sql2 = "SELECT wallet_address, private_key FROM userInfo WHERE email = ?";
                            db.klaytndb.query(sql2, params2, function (err, result, fields) {
                                if (err) {
                                    console.log(err);
                                    return callback(false);
                                }
                                else {
                                    return callback(result); // wallet_address, private_key 반환
                                }
                            });
                        }
                        else { // wallet_address 없음
                            return callback(false);
                        }
                    });
                }
            });
        }
        else { // session_id 없음
            return callback(false);
        }
    });
};

db.logout2 = function (logout_session_id, callback) {
    var params = [logout_session_id];
    var sql = "DELETE FROM userSession WHERE session_id = ?";
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (err) {
            console.log(err);
            return callback(false);
        } 
        else{
            return callback(true);
        } // session_id 삭제
    });
};

db.signup1 = function (u_email, callback) {
    var params = [u_email];
    var sql = "SELECT count(email) as total FROM userInfo WHERE email = ?";
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (err) {
            console.log(err);
            return callback(false);
        }
        else { // email 중복 판단 0(중복없음) or 1(중복있음)
            if (result[0].total) { 
                return callback(false); // 중복 이메일 있는경우
            } 
            else {
                return callback(true); // 중복 이메일 없는 경우
            }
        }
    });
};

db.signup2 = function (u_email, u_pw, u_nick, _address, _privateK, callback) {
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
        else {
            var sql1 = "DELETE FROM userAuth WHERE email = ?";
            var params1 = [u_email];
            db.klaytndb.query(sql1, params1, function (err, result, fields) {
                if (err) {
                    console.log(err);
                    return callback(false);
                } // 인증 코드 삭제
                else {
                    return callback(true);
                }
            });
        }
    });
};

db.find_pw_auth_identity1 = function (u_email, callback) {
    var params = [u_email];
    var sql = "SELECT count(email) as total FROM userInfo WHERE email = ?";
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (err) {
            console.log(err);
            return callback(false);
        }
        else { // 해당 email 존재 여부 판단 1(존재) or 0(없음)
            //db.klaytndb.end();
            if (result[0].total){ 
                return callback(true); // 해당 이메일 존재
            }
            else{
                return callback(false); // 해당 이메일 없음
            }
        }
    });
};

db.find_pw_auth_identity2 = function (u_email, authorize_text, callback) {
    var params = [u_email, authorize_text];
    var sql = "INSERT INTO userAuth (email, code) VALUES (?, ?)";
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (err) {
            console.log(err);
            return callback(false);
        }
        else {
            return callback(true); // 인증 코드 저장 성공
        }
    });
};

db.auth_identity_code = function (u_email, callback) { //DB에서 해당 이메일로 들어온 인증코드 리턴 부분에 쓰임
    var sql = "SELECT count(code) as total FROM userAuth WHERE email = ?";
    var params = [u_email];
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (result[0].total) {
            var params = [u_email];
            var sql = "SELECT code FROM userAuth WHERE email = ?";
            db.klaytndb.query(sql, params, function (err, result, fields) {
                if (err) {
                    console.log(err);
                    return callback(false);
                }
                else {
                    return callback(result); // 인증 code 반환
                }
            });
        }
        else { // code 없음
            return callback(false);
        }
    });
};

db.find_pw_auth_identity4 = function (u_email, u_pw, callback) {
    var sql1 = "DELETE FROM userAuth WHERE email = ?";
    var params1 = [u_email];
    db.klaytndb.query(sql1, params1, function (err, result, fields) {
        if (err) {
            console.log(err);
            return callback(false);
        } // 인증 코드 삭제
    });
    
    var params2 = [u_pw, u_email]
    var sql2 = "UPDATE userInfo SET password = ? WHERE email = ?";
    db.klaytndb.query(sql2, params2, function (err, result, fields) {
        if (err) {
            console.log(err);
            return callback(false);
        }
        else {
            return callback(true); // pw 변경 성공
        }
    });
};

db.modify_pw = function (_session, m_pw, callback) {
    var sql = "SELECT count(email) as total FROM userSession WHERE session_id = ?";
    var params = [_session];
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (result[0].total) {
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
                        if (err) {
                            console.log(err);
                            return callback(false);
                        } // pw 변경 성공
                        else {
                            return callback(true);
                        }
                    });
                }
            });
        }
        else { // email 없음
            return callback(false);
        }
    });
};

db.noname = function (session_id, callback) {
    var sql = "SELECT count(email) as total FROM userSession WHERE session_id = ?";
    var params = [session_id];
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (result[0].total) {
            var sql = "SELECT email FROM userSession WHERE session_id = ?";
            var params = [session_id];
            db.klaytndb.query(sql, params, function (err, result, fields) {
                if (err) {
                    console.log(err);
                    return callback(false);
                }
                else {
                    var sql = "SELECT email, count(wallet_address) as totals FROM userInfo WHERE email = ?";
                    var params = [result[0].email];
                    db.klaytndb.query(sql, params, function (err, result, fields) {
                        if (result[0].totals) {
                            var params2 = [result[0].email];
                            var sql2 = "SELECT wallet_address FROM userInfo WHERE email = ?";
                            db.klaytndb.query(sql2, params2, function (err, result, fields) {
                                if (err) {
                                    console.log(err);
                                    return callback(false);
                                }
                                else{
                                    return callback(result); // wallet_address 반환
                                }
                            });
                        }
                        else { // wallet_address 없음
                            return callback(false);
                        }
                    });
                }
            });
        }
        else { // email 없음
            return callback(false);
        }
    });
};

db.registerTransaction = function (transaction, wallet_address, callback) { // 트랜잭션, 지갑 주소 저장
    var params = [transaction, wallet_address];
    var sql = "INSERT INTO transaction VALUES (?, ?)";
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (err) {
            console.log(err);
            return callback(false);
        }
        else {
            return callback(true);
        }
    });
};

db.showTransaction = function (session_id, callback) { // //DB에서 세션 아이디로 해당 유저의 transaction list 반환
    var sql = "SELECT count(email) as total FROM userSession WHERE session_id = ?";
    var params = [session_id];
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (result[0].total) {
            var params = [session_id];
            var sql = "SELECT email FROM userSession WHERE session_id = ?";
            db.klaytndb.query(sql, params, function (err, result, fields) {
                if (err) {
                    console.log(err);
                    return callback(false);
                }
                else {
                    var sql = "SELECT email, count(wallet_address) as totals FROM userInfo WHERE email = ?";
                    var params = [result[0].email];
                    db.klaytndb.query(sql, params, function (err, result, fields) {
                        if (result[0].totals) {
                            var params2 = [result[0].email];
                            var sql2 = "SELECT wallet_address FROM userInfo WHERE email = ?";
                            db.klaytndb.query(sql2, params2, function (err, result, fields) {
                                if (err) {
                                    console.log(err);
                                    return callback(false);
                                }
                                else {
                                    var sql = "SELECT wallet_address, count(transaction) as totalss FROM transaction WHERE wallet_address = ?";
                                    var params = [result[0].wallet_address];
                                    db.klaytndb.query(sql, params, function (err, result, fields) {
                                        if (result[0].totalss) {
                                            var params3 = [result[0].wallet_address];
                                            var sql3 = "SELECT transaction FROM transaction WHERE wallet_address = ?";
                                            db.klaytndb.query(sql3, params3, function (err, result, fields) {
                                                if (err) {
                                                    console.log(err);
                                                    return callback(false);
                                                }
                                                else {
                                                    return callback(result); // transaction 반환
                                                }
                                            });
                                        }
                                        else { // transaction 없음
                                            return callback(false);
                                        }
                                    });
                                }
                            });
                        }
                        else { // wallet_address 없음
                            return callback(false);
                        }
                    });
                }
            });
        }
        else { // email 없음
            return callback(false);
        }
    });
};

db.my_question_list = function (session_id, callback) {
    var sql = "SELECT count(email) as total FROM userSession WHERE session_id = ?";
    var params = [session_id];
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (result[0].total) {
            var params = [session_id];
            var sql = "SELECT email FROM userSession WHERE session_id = ?";
            db.klaytndb.query(sql, params, function (err, result, fields) {
                if (err) {
                    console.log(err);
                    return callback(false);
                }
                else {
                    var sql = "SELECT email, count(question_num) as totals FROM question WHERE email = ?";
                    var params = [result[0].email];
                    db.klaytndb.query(sql, params, function (err, result, fields) {
                        if (result[0].totals) {
                            var params2 = [result[0].email];
                            var sql3 = "SELECT question_num FROM question WHERE email = ?";
                            db.klaytndb.query(sql3, params2, function (err, result, fields) {
                                if (err) {
                                    console.log(err);
                                    return callback(false);
                                }
                                else {
                                    var params3 = [result[0].question_num];
                                    var sql4 = "SELECT count(is_selected) as totalss FROM answer WHERE question_num = ?";
                                    db.klaytndb.query(sql4, params3, function (err, result, fields) {
                                        if (err) {
                                            console.log(err);
                                            return callback(false);
                                        }
                                        else {
                                            if (result[0].totalss == 0) { // 답변 없는 경우
                                                var sql5 = "SELECT question.question_title, question.question_content, question.klay, category.category FROM question INNER JOIN category ON question.question_num = ?  AND question.category_num = category.category_num";
                                                db.klaytndb.query(sql5, params3, function (err, result, fields) {
                                                    if (err) {
                                                        console.log(err);
                                                        return callback(false);
                                                    }
                                                    else {
                                                        result[0].is_selected = "false"; // 답변이 없으니 채택 여부 false
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
                                                        return callback(result); // 해당 유저의 질문을 제목,내용,클레이양, 카테고리, 상태를 리스트로 반환
                                                    }
                                                });
                                            }
                                        }
                                    });
                                }
                            });
                        }
                        else {
                            return callback(false);
                        }
                    });
                }
            });
        }
        else {
            return callback(false);
        }
    });
};

db.my_answer_list = function (session_id, callback) {
    var sql = "SELECT count(email) as total FROM userSession WHERE session_id = ?";
    var params = [session_id];
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (result[0].total) {
            var params = [session_id];
            var sql = "SELECT email FROM userSession WHERE session_id = ?";
            db.klaytndb.query(sql, params, function (err, result, fields) {
                if (err) {
                    console.log(err);
                    return callback(false);
                }
                else {
                    var sql = "SELECT email, count(answer_content) as totals FROM answer WHERE email = ?";
                    var params = [result[0].email];
                    db.klaytndb.query(sql, params, function (err, result, fields) {
                        if (result[0].totals) {
                            var params2 = [result[0].email];
                            var sql2 = "SELECT question.question_title ,answer.answer_content, answer.is_selected FROM question JOIN answer ON answer.email = ?";
                            db.klaytndb.query(sql2, params2, function (err, result, fields) {
                                if (err) {
                                    console.log(err);
                                    return callback(false);
                                }
                                else {
                                    return callback(result); // 질문 제목, 답변 내용, 채택 여부를 리스트로 반환
                                }
                            });
                        }
                        else {
                            return callback(false);
                        }
                    });
                }
            });
        }
        else {
            return callback(false);
        }
    });
};

db.my_like_list = function (session_id, callback) {
    var params = [session_id];
    var sql = "SELECT count(email) as total FROM userSession WHERE session_id = ?";
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (result[0].total) {
            var params5 = [session_id];
            var sql5 = "SELECT email FROM userSession WHERE session_id = ?";
            db.klaytndb.query(sql5, params5, function (err, result, fields) {
                if (err) {
                    console.log(err);
                    return callback(false);
                }
                else {
                    var params2 = [result[0].email];
                    var sql2 = "SELECT email, count(email) as totals FROM userLike WHERE email = ?"
                    db.klaytndb.query(sql2, params2, function (err, result, fields) {
                        if (result[0].totals) {
                            var params = [result[0].email];
                            var sql = "SELECT email, answer_num FROM userLike WHERE email = ?";
                            db.klaytndb.query(sql, params, function (err, result, fields) {
                                if (err) {
                                    console.log(err);
                                    return callback(false);
                                }
                                else {
                                    var params4 = [result[0].email];
                                    var sql4 = "SELECT email, answer_num, count(answer_num) as count FROM userLike WHERE email = ?";
                                    db.klaytndb.query(sql4, params4, function (err, result, fields) {
                                        if (result[0].count) {
                                            var params3 = [result[0].email, result[0].answer_num];
                                            var sql3 = "SELECT l1.question_num, l1.answer_num, count(l2.answer_num) as like_num FROM userLike as l1 JOIN userLike as l2 ON l1.email = ? AND l2.answer_num = ?";
                                            db.klaytndb.query(sql3, params3, function (err, result, fields) {
                                                if (err) {
                                                    console.log(err);
                                                    return callback(false);
                                                }
                                                else {
                                                    return callback(result); // 질문 번호, 답변 번호, 라이크 수 반환
                                                }
                                            });
                                        }
                                        else {
                                            return callback(false);
                                        }
                                    });
                                }
                            });
                        }
                        else {
                            return callback(false);
                        }
                    });
                }
            });
        }
        else {
            return callback(false);
        }
    });
};

db.my_remain_klay = function (session_id, callback) {
    var params = [session_id];
    var sql = "SELECT count(email) as total FROM userSession WHERE session_id = ?";
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (result[0].total) {
            var params = [session_id];
            var sql = "SELECT email FROM userSession WHERE session_id = ?";
            db.klaytndb.query(sql, params, function (err, result, fields) {
                if (err) {
                    console.log(err);
                    return callback(false);
                }
                else {
                    var params = [result[0].email];
                    var sql = "SELECT email, count(wallet_address) as totals FROM userInfo WHERE email = ?";
                    db.klaytndb.query(sql, params, function (err, result, fields) {
                        if (result[0].totals) {
                            var params2 = [result[0].email];
                            var sql2 = "SELECT wallet_address FROM userInfo WHERE email = ?";
                            db.klaytndb.query(sql2, params2, function (err, results, fields) {
                                if (err) {
                                    console.log(err);
                                    return callback(false);
                                }
                                else {
                                    return callback(results); // wallet_address 반환
                                }
                            });
                        }
                        else {
                            return callback(false);
                        }
                    });
                }
            });
        }
        else {
            return callback(false);
        }
    });
};

db.category = function (callback) {
    var sql = "SELECT * FROM category";
    db.klaytndb.query(sql, function (err, result, fields) {
        if (err) {
            console.log(err);
            return callback(false);
        }
        else {
            return callback(result);
        }
    });
};


db.insert_question1 = function (session_id, question_title, question_klay, question_content, category, trans_time, callback) {
    var params = [session_id];
    var sql = "SELECT count(email) as totals FROM userSession WHERE session_id = ?";
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (result[0].totals) {
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
                                    var sql3 = "SELECT MAX(question_num) as max FROM question WHERE question_title = ?";
                                    var params3 = [question_title];
                                    db.klaytndb.query(sql3, params3, function (err, results, fields) {
                                        if (err) {
                                            console.log(err);
                                            return callback(false);
                                        }
                                        else {
                                            return callback(results); // question_num 반환
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        }
        else {
            return callback(false);
        }
    });
};

db.insert_question2 = function (session_id, transaction, callback) {
    var params = [session_id];
    var sql = "SELECT count(email) as total FROM userSession WHERE session_id = ?";
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (result[0].total) {
            var params = [session_id];
            var sql = "SELECT email FROM userSession WHERE session_id = ?";
            db.klaytndb.query(sql, params, function (err, result, fields) {
                if (err) {
                    console.log(err);
                    return callback(false);
                }
                else {
                    var u_email = result[0].email;
                    var params = [result[0].email];
                    var sql = "SELECT count(wallet_address) as totals FROM userInfo WHERE email = ?";
                    db.klaytndb.query(sql, params, function (err, results, fields) {
                        if (results[0].totals) {
                            var sql2 = "SELECT wallet_address FROM userInfo WHERE email = ?";
                            var params2 = [u_email];
                            db.klaytndb.query(sql2, params2, function (err, resultss, fields) {
                                if (err) {
                                    console.log(err);
                                    return callback(false);
                                }
                                else {
                                    var params3 = [transaction, resultss[0].wallet_address];
                                    var sql3 = "INSERT INTO transaction (transaction, wallet_address) VALUES (?, ?)";
                                    db.klaytndb.query(sql3, params3, function (err, result, fields) {
                                        if (err) {
                                            console.log(err);
                                            return callback(false);
                                        }
                                        else {
                                            return callbakc(true); // transaction, wallet_address 저장
                                        }
                                    });
                                }
                            });
                        }
                        else {
                            return callback(false);
                        }
                    });
                }
            });
        }
        else {
            return callback(false);
        }
    });
};

db.show_question = function (question_num, callback) {
    var params = [question_num];
    var sql = "SELECT count(question_num) as totals FROM question WHERE question_num = ?";
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (result[0].totals) {
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
                                return callback(result); // 질문 번호, 질문자 이메일, 질문 제목, 카테고리, 질문 내용, klay, 질문 시간, 답변 번호, 답변자 이메일, 답변 내용, 답변 채택 여부 반환
                            }
                        });
                    }
                }
            });
        }
        else {
            return callback(false);
        }
    });
};

db.questionList = function (question_state, sort_num, keyword, category, callback) { 
    sort_num = typeof sort_num !== 'undefined' ? sort_num : 0; // 0 -> 오래된 순, 1 -> 최신순, 2 -> klay순
    keyword = typeof keyword !== 'undefined' ? keyword : '%%';
    category = typeof category !== 'undefined' ? category : 0; // 0-> 전체, 1~13 -> 카테고리
    question_state = typeof question_state !== 'undefined' ? question_state : 0; // 0 -> 답변 진행중, 1 -> Like 진행중, 2 -> 채택 완료

    if (category != 0) { // 카테고리 별
        if (question_state == 0) { // 답변 진행중
            if (sort_num == 0) { // 오래된 순
                var sql = "SELECT question.question_num, question.question_title, question.email, category.category, question.klay, question.time FROM question INNER JOIN category ON question.category_num = category.category_num AND question.q_selected = ?  AND question.question_content LIKE ? AND question.category_num = ?";
                var params = [question_state, keyword, category];
                db.klaytndb.query(sql, params, function (err, result, fields) {
                    if (err) {
                        console.log(err);
                        return callback(false);
                    }
                    else {
                        return callback(result); // 답변 진행중 게시판에 대해 질문 번호, 질문 제목, 질문자 이메일, 카테고리, klay, 질문 시간 오래된 순 반환
                    }
                });
            }
            else if (sort_num == 1) { // 최신순
                var sql = "SELECT question.question_num, question.question_title, question.email, category.category, question.klay, question.time FROM question INNER JOIN category ON question.category_num = category.category_num AND question.q_selected = ? AND question.question_content LIKE '%?%' AND question.category_num = ? ORDER BY question.time DESC";
                var params = [question_state, keyword, category];
                db.klaytndb.query(sql, params, function (err, result, fields) {
                    if (err) {
                        console.log(err);
                        return callback(false);
                    }
                    else {
                        return callback(result); // 답변 진행중 게시판에 대해 질문 번호, 질문 제목, 질문자 이메일, 카테고리, klay, 질문 시간 최신순 반환
                    }
                });
            }
            else { // klay 순
                var sql = "SELECT question.question_num, question.question_title, question.email, category.category, question.klay, question.time FROM question INNER JOIN category ON question.category_num = category.category_num AND question.q_selected = ? AND question.question_content LIKE '%?%' AND question.category_num = ? ORDER BY question.klay DESC";
                var params = [question_state, keyword, category];
                db.klaytndb.query(sql, params, function (err, result, fields) {
                    if (err) {
                        console.log(err);
                        return callback(false);
                    }
                    else {
                        return callback(result); // 답변 진행중 게시판에 대해 질문 번호, 질문 제목, 질문자 이메일, 카테고리, klay, 질문 시간 klay 순 반환
                    }
                });
            }
        }
        else if (question_state == 1) { // Like 진행중
            if (sort_num == 0) { // 오래된 순
                var sql = "SELECT question.question_num, question.question_title, question.email, category.category, question.klay, question.time FROM question INNER JOIN category ON question.category_num = category.category_num AND question.q_selected = ? AND question.question_content LIKE '%?%' AND question.category_num = ?";
                var params = [question_state, keyword, category];
                db.klaytndb.query(sql, params, function (err, result, fields) {
                    if (err) {
                        console.log(err);
                        return callback(false);
                    }
                    else {
                        return callback(result); // Like 진행중 게시판에 대해 질문 번호, 질문 제목, 질문자 이메일, 카테고리, klay, 질문 시간 오래된 순 반환
                    }
                });
            }
            else if (sort_num == 1) { // 최신순
                var sql = "SELECT question.question_num, question.question_title, question.email, category.category, question.klay, question.time FROM question INNER JOIN category ON question.category_num = category.category_num AND question.q_selected = ? AND question.question_content LIKE '%?%' AND question.category_num = ? ORDER BY question.time DESC";
                var params = [question_state, keyword, category];
                db.klaytndb.query(sql, params, function (err, result, fields) {
                    if (err) {
                        console.log(err);
                        return callback(false);
                    }
                    else {
                        return callback(result); // Like 진행중 게시판에 대해 질문 번호, 질문 제목, 질문자 이메일, 카테고리, klay, 질문 시간 최신순 반환
                    }
                });
            }
            else { // klay 순
                var sql = "SELECT question.question_num, question.question_title, question.email, category.category, question.klay, question.time FROM question INNER JOIN category ON question.category_num = category.category_num AND question.q_selected = ? AND question.question_content LIKE '%?%' AND question.category_num = ? ORDER BY question.klay DESC";
                var params = [question_state, keyword, category];
                db.klaytndb.query(sql, params, function (err, result, fields) {
                    if (err) {
                        console.log(err);
                        return callback(false);
                    }
                    else {
                        return callback(result); // Like 게시판에 대해 질문 번호, 질문 제목, 질문자 이메일, 카테고리, klay, 질문 시간 klay 순 반환
                    }
                });
            }
        }
        else { // 채택 완료
            if (sort_num == 0) { // 오래된 순
                var sql = "SELECT question.question_num, question.question_title, question.email, category.category, question.klay, question.time FROM question INNER JOIN category ON question.category_num = category.category_num AND question.q_selected = ? AND question.question_content LIKE '%?%' AND question.category_num = ?";
                var params = [question_state, keyword, category];
                db.klaytndb.query(sql, params, function (err, result, fields) {
                    if (err) {
                        console.log(err);
                        return callback(false);
                    }
                    else {
                        return callback(result); // 답변 채택 완료 게시판에 대해 질문 번호, 질문 제목, 질문자 이메일, 카테고리, klay, 질문 시간 오래된 순 반환
                    }
                });
            }
            else if (sort_num == 1) { // 최신순
                var sql = "SELECT question.question_num, question.question_title, question.email, category.category, question.klay, question.time FROM question INNER JOIN category ON question.category_num = category.category_num AND question.q_selected = ? AND question.question_content LIKE '%?%' AND question.category_num = ? ORDER BY question.time DESC";
                var params = [question_state, keyword, category];
                db.klaytndb.query(sql, params, function (err, result, fields) {
                    if (err) {
                        console.log(err);
                        return callback(false);
                    }
                    else {
                        return callback(result); // 답변 채택 완료 게시판에 대해 질문 번호, 질문 제목, 질문자 이메일, 카테고리, klay, 질문 시간 최신순 반환
                    }
                });
            }
            else { // klay 순
                var sql = "SELECT question.question_num, question.question_title, question.email, category.category, question.klay, question.time FROM question INNER JOIN category ON question.category_num = category.category_num AND question.q_selected = ? AND question.question_content LIKE '%?%' AND question.category_num = ? ORDER BY question.klay DESC";
                var params = [question_state, keyword, category];
                db.klaytndb.query(sql, params, function (err, result, fields) {
                    if (err) {
                        console.log(err);
                        return callback(false);
                    }
                    else {
                        return callback(result); // 답변 채택 완료 게시판에 대해 질문 번호, 질문 제목, 질문자 이메일, 카테고리, klay, 질문 시간 klay 순 반환
                    }
                });
            }
        }
    }
    else { // 카테고리 전체
        if (question_state == 0) { // 답변 진행중
            if (sort_num == 0) { // 오래된 순
                var sql = "SELECT question.question_num, question.question_title, question.email, category.category, question.klay, question.time FROM question INNER JOIN category ON question.category_num = category.category_num AND question.q_selected = ? AND question.question_content LIKE '%?%'";
                var params = [question_state, keyword];
                db.klaytndb.query(sql, params, function (err, result, fields) {
                    if (err) {
                        console.log(err);
                        return callback(false);
                    }
                    else {
                        return callback(result); // 답변 진행중 게시판에 대해 질문 번호, 질문 제목, 질문자 이메일, 카테고리, klay, 질문 시간 오래된 순 반환
                    }
                });
            }
            else if (sort_num == 1) { // 최신순
                var sql = "SELECT question.question_num, question.question_title, question.email, category.category, question.klay, question.time FROM question INNER JOIN category ON question.category_num = category.category_num AND question.q_selected = ? AND question.question_content LIKE '%?%' ORDER BY question.time DESC";
                var params = [question_state, keyword];
                db.klaytndb.query(sql, params, function (err, result, fields) {
                    if (err) {
                        console.log(err);
                        return callback(false);
                    }
                    else {
                        return callback(result); // 답변 진행중 게시판에 대해 질문 번호, 질문 제목, 질문자 이메일, 카테고리, klay, 질문 시간 최신순 반환
                    }
                });
            }
            else { // klay 순
                var sql = "SELECT question.question_num, question.question_title, question.email, category.category, question.klay, question.time FROM question INNER JOIN category ON question.category_num = category.category_num AND question.q_selected = ? AND question.question_content LIKE '%?%' ORDER BY question.klay DESC";
                var params = [question_state, keyword];
                db.klaytndb.query(sql, params, function (err, result, fields) {
                    if (err) {
                        console.log(err);
                        return callback(false);
                    }
                    else {
                        return callback(result); // 답변 진행중 게시판에 대해 질문 번호, 질문 제목, 질문자 이메일, 카테고리, klay, 질문 시간 klay 순 반환
                    }
                });
            }
        }
        else if (question_state == 1) { // Like 진행중
            if (sort_num == 0) { // 오래된 순
                var sql = "SELECT question.question_num, question.question_title, question.email, category.category, question.klay, question.time FROM question INNER JOIN category ON question.category_num = category.category_num AND question.q_selected = ? AND question.question_content LIKE '%?%'";
                var params = [question_state, keyword];
                db.klaytndb.query(sql, params, function (err, result, fields) {
                    if (err) {
                        console.log(err);
                        return callback(false);
                    }
                    else {
                        return callback(result); // Like 진행중 게시판에 대해 질문 번호, 질문 제목, 질문자 이메일, 카테고리, klay, 질문 시간 오래된 순 반환
                    }
                });
            }
            else if (sort_num == 1) { // 최신순
                var sql = "SELECT question.question_num, question.question_title, question.email, category.category, question.klay, question.time FROM question INNER JOIN category ON question.category_num = category.category_num AND question.q_selected = ? AND question.question_content LIKE '%?%' ORDER BY question.time DESC";
                var params = [question_state, keyword];
                db.klaytndb.query(sql, params, function (err, result, fields) {
                    if (err) {
                        console.log(err);
                        return callback(false);
                    }
                    else {
                        return callback(result); // Like 진행중 게시판에 대해 질문 번호, 질문 제목, 질문자 이메일, 카테고리, klay, 질문 시간 최신순 반환
                    }
                });
            }
            else { // klay 순
                var sql = "SELECT question.question_num, question.question_title, question.email, category.category, question.klay, question.time FROM question INNER JOIN category ON question.category_num = category.category_num AND question.q_selected = ? AND question.question_content LIKE '%?%' ORDER BY question.klay DESC";
                var params = [question_state, keyword];
                db.klaytndb.query(sql, params, function (err, result, fields) {
                    if (err) {
                        console.log(err);
                        return callback(false);
                    }
                    else {
                        return callback(result); // Like 진행중 게시판에 대해 질문 번호, 질문 제목, 질문자 이메일, 카테고리, klay, 질문 시간 klay 순 반환
                    }
                });
            }
        }
        else { // 채택 완료
            if (sort_num == 0) { // 오래된 순
                var sql = "SELECT question.question_num, question.question_title, question.email, category.category, question.klay, question.time FROM question INNER JOIN category ON question.category_num = category.category_num AND question.q_selected = ? AND question.question_content LIKE '%?%'";
                var params = [question_state, keyword];
                db.klaytndb.query(sql, params, function (err, result, fields) {
                    if (err) {
                        console.log(err);
                        return callback(false);
                    }
                    else {
                        return callback(result); // 답변 채택 완료 게시판에 대해 질문 번호, 질문 제목, 질문자 이메일, 카테고리, klay, 질문 시간 오래된 순 반환
                    }
                });
            }
            else if (sort_num == 1) { // 최신순
                var sql = "SELECT question.question_num, question.question_title, question.email, category.category, question.klay, question.time FROM question INNER JOIN category ON question.category_num = category.category_num AND question.q_selected = ? AND question.question_content LIKE '%?%' ORDER BY question.time DESC";
                var params = [question_state, keyword];
                db.klaytndb.query(sql, params, function (err, result, fields) {
                    if (err) {
                        console.log(err);
                        return callback(false);
                    }
                    else {
                        return callback(result); // 답변 채택 완료 게시판에 대해 질문 번호, 질문 제목, 질문자 이메일, 카테고리, klay, 질문 시간 최신순 반환
                    }
                });
            }
            else { // klay 순
                var sql = "SELECT question.question_num, question.question_title, question.email, category.category, question.klay, question.time FROM question INNER JOIN category ON question.category_num = category.category_num AND question.q_selected = ? AND question.question_content LIKE '%?%' ORDER BY question.klay DESC";
                var params = [question_state, keyword];
                db.klaytndb.query(sql, params, function (err, result, fields) {
                    if (err) {
                        console.log(err);
                        return callback(false);
                    }
                    else {
                        return callback(result); // 답변 채택 완료 게시판에 대해 질문 번호, 질문 제목, 질문자 이메일, 카테고리, klay, 질문 시간 klay 순 반환
                    }
                });
            }
        }
    }
};

db.questionListDefault = function (cur_time, callback) { // 모든 게시판 누를 때마다 호출, 모든 질문 불러오기, 7일 된 질문 분류하는 기능
    var sql = "UPDATE question SET q_selected = 1 WHERE ? - time >= '0000-00-07 00:00:00'";
    var params = [cur_time];
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (err) {
            console.log(err);
            return callback(false); // 질문 상태 변화
        }
    });
    var sql1 = "SELECT question.question_num, question.question_title, question.email, category.category, question.klay, question.time FROM question INNER JOIN category ON question.category_num = category.category_num";
    db.klaytndb.query(sql1, function (err, result, fields) {
        if (err) {
            console.log(err);
            return callback(false);
        }
        else {
            return callback(result); // 모든 질문에 대해 질문 번호, 질문 제목, 질문자 이메일, 카테고리, klay, 질문 시간 반환
        }
    });
};

db.insertAnswer = function (session_id, answer_content, question_num, callback) {
    var sql = "SELECT count(*) as total FROM answer";
    db.klaytndb.query(sql, function (err, result, fields) {
        if (err) {
            console.log(err);
            return callback(false);
        }
        else {
            result[0].total = result[0].total + 1;
            var params = [session_id];
            var sql = "SELECT count(email) as totals FROM userSession WHERE session_id = ?";
            db.klaytndb.query(sql, params, function (err, result, fields) {
                if (result[0].totals) {
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
                                    return callback(true);
                                }
                            });
                        }
                    });
                }
                else {
                    return callback(false);
                }
            });
        }
    });
};

db.insertLike = function (session_id, question_num, answer_num, callback) {
    var params = [session_id];
    var sql = "SELECT count(email) as total FROM userSession WHERE session_id = ?";
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (result[0].total) {
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
                            return callback(true);
                        }
                    });
                }
            });
        }
        else {
            return callback(false);
        }
    });
};

db.selectAnswerOne = function (question_num, answer_num, callback) {
    var sql4 = "UPDATE question SET q_selected = 2 WHERE question_num = ?";
    var params4 = [question_num];
    db.klaytndb.query(sql4, params4, function (err, result, fields) {
        if (err) {
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
    var params = [question_num];
    var sql = "SELECT count(email) as total FROM answer WHERE question_num = ?";
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (result[0].total) {
            var sql2 = "SELECT answer.email as a_email, question.email as q_email FROM answer JOIN question ON answer.answer_num = ? AND question.question_num = ?";
            var params2 = [answer_num, question_num];
            db.klaytndb.query(sql2, params2, function (err, result, fields) {
                if (err) {
                    console.log(err);
                    return callback(false);
                }
                else {
                    var sql3 = "SELECT userInfo.wallet_address as answer_wallet_address, userInfo.private_key as answer_private_key, userInfo.wallet_address as questioner_wallet_address, question.klay as klay FROM userInfo JOIN question ON userInfo.email = ? OR userInfo.email = ? OR qustion.email = ?";
                    var params3 = [result[0].a_email, result[0].q_email, result[0].q_email];
                    db.klaytndb.query(sql3, params3, function (err, rows, fields) {
                        if (err) {
                            console.log(err);
                            return callback(false);
                        }
                        else {
                            return callback(rows); // answer_wallet_address, answer_private_key, questioner_wallet_address, klay 반환
                        }
                    });
                }
            });
        }
        else callback(false);
    });
};

db.selectAnswerLike = function (answer_num, callback) {
    var params = [answer_num];
    var sql = "SELECT count(email) as total FROM userLike WHERE answer_num = ?";
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (result[0].total) {
            var params = [answer_num];
            var sql = "SELECT email FROM userLike answer_num = ?";
            db.klaytndb.query(sql, params, function (err, result, fields) {
                if (err) {
                    console.log(err);
                    return callback(false);
                }
                else {
                    var params = [result[0].email];
                    var sql = "SELECT email, count(wallet_address) as totals FROM userInfo WHERE email = ?";
                    db.klaytndb.query(sql, params, function (err, result, fields) {
                        if (result[0].totals) {
                            var params2 = [result[0].email];
                            var sql2 = "SELECT wallet_address, private_key FROM userInfo WHERE email = ?";
                            db.klaytndb.query(sql2, params2, function (err, result, fields) {
                                if (err) {
                                    console.log(err);
                                    return callback(false);
                                }
                                else {
                                    return callbakc(result);
                                }
                            });
                        }
                        else {
                            return callback(false);
                        }
                    });
                }
            });
        }
        else {
            return callback(false);
        }
    });
};

module.exports = db;
