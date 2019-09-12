var mysql = require('mysql');
var db = {};
db.klaytndb = mysql.createConnection({
    host: 'klaytn-database.ciitcrpahoo9.ap-northeast-2.rds.amazonaws.com',
    user: 'admin',
    password: 'klaytn2019!',
    port: 3306,
    database: 'klaytndb'
});

db.getPrivatekey = function (u_email, callback) {
    var params = [u_email];
    var sql = "SELECT private_key FROM userInfo WHERE email = ?";
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (err) {
            console.log(err);
            return callback(false);
        }
        else {
            return callback(result); // private_key 반환
        }
    });
};

db.deleteSession = function (u_email, callback){
    var params = [u_email];
    var sql = "DELETE FROM userSession WHERE email = ?";
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

db.countSession = function (u_email, callback) {
    var params = [u_email];
    var sql = "SELECT count(session_id) as totals FROM userSession WHERE email = ?";
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (result[0].totals) {
            return callback(true);
        }
        else {
            return callback(false);
        }
    });
};

db.checkEmailAndPassword = function (u_email, u_pw, callback) {
    var params = [u_email, u_pw];
    var sql = "SELECT count(email) as total FROM userInfo WHERE email = ? AND password = ?";
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (result[0].total) {
            return callback(true);
        }
        else {
            return callback(false);
        }
    });
};

db.checkAuthUser = function (u_email, callback) {
  var params = [u_email];
  var sql = "SELECT authUser FROM userInfo WHERE email = ?";
  db.klaytndb.query(sql, params, function (err, result, fields) {
      if (result[0].anthUser) {
          return callback(true);
      }
      else {
          return callback(false);
      }
  });
};

db.loginFirst = function (u_email, u_pw, callback) {
  db.checkAuthUser(u_email, (rows)=>{
    if(rows){
    db.checkEmailAndPassword(u_email, u_pw, (rows1)=>{
        if(rows1){
        db.countSession(u_email, (rows2)=>{
            if(rows2){
                db.deleteSession(u_email, (rows3)=>{
                    if(rows3){
                        db.getPrivatekey(u_email, (rows4)=>{
                            return callback(rows4);
                          });
                    }
                    else {
                        return callback(false);
                    }
                  });
             }
            else {
              db.getPrivatekey(u_email, (rows4)=>{
                return callback(rows4);
              });
            }
          });
        }
        else {
          return callback(false);
        }
    });
  }
  else{
    return callback(false);
  }
  });
}; // use

db.maxSession = function (callback){
  var sql = "SELECT MAX(session_id) as max FROM userSession";
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

db.insertSession = function (session_id, u_email, callback){
  var sql = "INSERT INTO userSession (session_id ,email) VALUES(?, ?)";
  var params = [session_id, u_email];
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

db.selectSession = function (u_email, callback){
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
};

db.loginSecond = function (u_email, callback) {
    db.maxSession((rows1)=>{
      if (rows1) {
            var session_id = rows1[0].max + 1;
            db.insertSession(session_id, u_email, (rows2)=>{
              if(rows2){
                db.selectSession(u_email, (rows3)=>{
                    return callback(rows3);
                });
              }
              else{
                return callback(false);
              }
            });
          }
          else {
            return callback(false);
          }
  });
}; // use

db.countEmail = function (session_id, callback){
  var params = [session_id];
  var sql = "SELECT count(email) as total FROM userSession WHERE session_id = ?";
  db.klaytndb.query(sql, params, function (err, result, fields) {
      if (result[0].total) {
        return callback(true);
      }
      else{
        return callback(false);
      }
    });
};

db.selectEmail = function (session_id, callback){
  var sql = "SELECT email FROM userSession WHERE session_id = ?";
  var params = [session_id];
  db.klaytndb.query(sql, params, function (err, result, fields) {
      if (err) {
          console.log(err);
          return callback(false);
      }
      else {
        return callback(result);
      }
    });
};

db.countWallet = function (u_email, callback){
  var params = [u_email];
  var sql = "SELECT email, count(wallet_address) as totals FROM userInfo WHERE email = ?";
  db.klaytndb.query(sql, params, function (err, result, fields) {
    if(err){
      return callback(false);
    }
    else{
      return callback(result);
    }
  });
};

db.selectWalletAddress = function (u_email, callback){
  var params = [u_email];
  var sql = "SELECT wallet_address FROM userInfo WHERE email = ?";
  db.klaytndb.query(sql, params, function (err, result, fields) {
      if (err) {
          console.log(err);
          return callback(false);
      }
      else {
          return callback(result); // wallet_address 반환
      }
  });
};

db.logoutFirst = function (logout_session_id, callback) {
    db.countEmail(logout_session_id, (rows1)=>{
      if (rows1){
            db.selectEmail(logout_session_id, (rows2)=>{
              if(rows2){
                    db.countWallet(rows2[0].email, (rows3)=>{
                      if(rows3[0].totals){
                        db.selectWalletAddress(rows3[0].email, (rows4)=>{
                            return callback(rows4);
                        });
                        }
                        else { // wallet_address 없음
                            return callback(false);
                        }
                    });
                }
                else{
                  return callback(false);
                }
            });
        }
        else { // session_id 없음
            return callback(false);
        }
    });
}; // use

db.selectWalletAndPK = function (u_email, callback){
  var params = [u_email];
  var sql = "SELECT wallet_address, private_key FROM userInfo WHERE email = ?";
  db.klaytndb.query(sql, params, function (err, result, fields) {
      if (err) {
          console.log(err);
          return callback(false);
      }
      else {
          return callback(result); // wallet_address, private_key 반환
      }
  });
};

db.getWalletaddressAndPK = function (session_id, callback) {
    db.countEmail(session_id, (rows1)=>{
      if(rows1){
        db.selectEmail(session_id, (rows2)=>{
          if(rows2){
            var u_email = rows2[0].email;
                db.countWallet(u_email, (rows3)=>{
                  if(rows3){
                    db.selectWalletAndPK(u_email, (rows4)=>{
                      return callback(rows4);
                    });
                  }
                  else {
                      return callback(false);
                  }
              });
          }
                else{
                  return callback(false);
                }
            });
        }
        else { // session_id 없음
            return callback(false);
        }
    });
}; // use

db.logoutSecond = function (logout_session_id, callback) {
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
}; // use

db.checkEmail = function (u_email, callback) {
  var params = [u_email];
  var sql = "SELECT count(email) as total FROM userInfo WHERE email = ?";
  db.klaytndb.query(sql, params, function (err, result, fields) {
      if (result[0].total) {
          return callback(true);
      }
      else{
        return callback(false);
      }
    });
}; // use

db.insertWalletAndPK = function (u_email, _address, _privateK, callback){
  var params = [_address, _privateK, u_email];
  var sql = "UPDATE userInfo SET wallet_address = ?, private_key = ?, authUser = true WHERE email = ?";
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

db.deleteEmail = function (u_email, callback){
  var sql = "DELETE FROM authEmail WHERE email = ?";
  var params = [u_email];
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

db.signupNotAuthUser = function (u_email, callback) {
  var sql = "DELETE FROM userInfo WHERE email = ?";
  var params = [u_email];
  db.klaytndb.query(sql, params, function (err, result, fields) {
      if (err) {
          console.log(err);
          return callback(false);
      }
      else {
        db.deleteEmail(u_email, (rows2)=>{
          return callback(rows2);
        });
      }
  });
}; // use

db.signupAuthUser = function (u_email,  _address, _privateK, callback) {
    db.insertWalletAndPK(u_email, _address, _privateK, (rows1)=>{
      if(rows1){
            db.deleteEmail(u_email, (rows2)=>{
              return callback(rows2);
            });
        }
        else{
          return callback(false);
        }
    });
}; // use

db.findPasswordFirst = function (u_email, callback) {
    var params = [u_email];
    var sql = "SELECT count(email) as total FROM userInfo WHERE email = ?";
    db.klaytndb.query(sql, params, function (err, result, fields) {
            if (result[0].total){
                return callback(true); // 해당 이메일 존재
            }
            else{
                return callback(false); // 해당 이메일 없음
            }
    });
}; // use

db.findPasswordSecond = function (u_email, authorize_text, callback) {
    var params = [u_email, authorize_text];
    var sql = "INSERT INTO authPW (email, codePW) VALUES (?, ?)";
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (err) {
            console.log(err);
            return callback(false);
        }
        else {
            return callback(true); // 인증 코드 저장 성공
        }
    });
}; // use

db.authInsertInfoAndAuth = function (u_email, u_pw, u_nick, authorize_text, callback) {
  var params = [u_email, u_pw, u_nick];
  var sql = "INSERT INTO userInfo (email, password, nickname) VALUES (?, ?, ?)";
  db.klaytndb.query(sql, params, function (err, result, fields) {
      if (err) {
          console.log(err);
          return callback(false);
      }
      else {
          db.authIdentityEmail(u_email, authorize_text, (rows)=>{
            return callback(true);
          });
      }
  });
}; // use

db.authIdentityEmail = function (u_email, authorize_text, callback) {
    var params = [u_email, authorize_text];
    var sql = "INSERT INTO authEmail (email, codeEmail) VALUES (?, ?)";
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

db.authIdentityCodePW = function (u_email, callback) {
    var sql = "SELECT count(codePW) as total FROM authPW WHERE email = ?";
    var params = [u_email];
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (result[0].total) {
            var params2 = [u_email];
            var sql2 = "SELECT codePW FROM authPW WHERE email = ?";
            db.klaytndb.query(sql2, params2, function (err, result, fields) {
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
}; // use

db.authIdentityCodeEmail = function (u_email, callback) {
    var sql = "SELECT count(codeEmail) as total FROM authEmail WHERE email = ?";
    var params = [u_email];
    db.klaytndb.query(sql, params, function (err, result, fields) {
        if (result[0].total) {
            var params2 = [u_email];
            var sql2 = "SELECT codeEmail FROM authEmail WHERE email = ?";
            db.klaytndb.query(sql2, params2, function (err, result, fields) {
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
}; // use

db.deleteAuthPW = function (u_email, callback){
  var sql = "DELETE FROM authPW WHERE email = ?";
  var params = [u_email];
  db.klaytndb.query(sql, params, function (err, result, fields) {
      if (err) {
          console.log(err);
          return callback(false);
      }
      else{
        return callback(false);
      }
  });
};

db.updatePassword = function (u_email, u_pw, callback){
  var params = [u_pw, u_email]
  var sql = "UPDATE userInfo SET password = ? WHERE email = ?";
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

db.findPasswordThird = function (u_email, u_pw, callback) {
  db.deleteAuthPW(u_email, (rows1)=>{});
  db.updatePassword(u_email, u_pw, (rows2)=>{
    if(rows2)
      return callback(true);
  });
}; // use

db.modifyPassword = function (session_id, m_pw, callback) {
    db.countEmail(session_id, (rows1)=>{
      if(rows1){
            db.selectEmail(session_id, (rows2)=>{
              if(rows2){
                    db.updatePassword(rows2[0].email, m_pw, (rows3)=>{
                      return callback(true);
                    });
                }
            });
        }
        else {
            return callback(false);
        }
    });
}; // use

db.getWalletAddress = function (session_id, callback) {
    db.countEmail(session_id, (rows1)=>{
      if(rows1){
            db.selectEmail(session_id, (rows2)=>{
              if(rows2){
                    db.countWallet(rows2[0].email, (rows3)=>{
                      if(rows3){
                            db.selectWalletAddress(rows3[0].email, (rows4)=>{
                              return callback(rows4);
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
}; // use

db.insertTransaction = function (transaction, wallet_address, callback) {
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
}; // use

db.countTransaction = function(wallet_address, callback){
  var sql = "SELECT wallet_address, count(transaction) as total FROM transaction WHERE wallet_address = ?";
  var params = [wallet_address];
  db.klaytndb.query(sql, params, function (err, result, fields) {
      if (result[0].total) {
        return callback(result);
      }
      else{
        return callback(false);
      }
    });
};

db.selectTransaction = function(wallet_address, callback){
  var params = [wallet_address];
  var sql = "SELECT transaction FROM transaction WHERE wallet_address = ?";
  db.klaytndb.query(sql, params, function (err, result, fields) {
      if (err) {
          console.log(err);
          return callback(false);
      }
      else {
          return callback(result); // transaction 반환
      }
  });
};

db.showTransaction = function (session_id, callback) {
    db.countEmail(session_id, (rows1)=>{
      if(rows1){
            db.selectEmail(session_id, (rows2)=>{
              if(rows2){
                    db.countWallet(rows2[0].email, (rows3)=>{
                      if(rows3){
                            db.selectWalletAddress(rows3[0].email, (rows4)=>{
                              if(rows4){
                                    db.countTransaction(rows4[0].wallet_address, (rows5)=>{
                                      if(rows5){
                                            db.selectTransaction(rows5[0].wallet_address, (rows6)=>{
                                              return callback(rows6);
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
        else { // email 없음
            return callback(false);
        }
    });
  }
});
}; // use

db.countQuestionNum = function(u_email, callback){
  var sql = "SELECT email, count(question_num) as total FROM question WHERE email = ?";
  var params = [u_email];
  db.klaytndb.query(sql, params, function (err, result, fields) {
      if (result[0].total) {
        return callback(result);
      }
      else{
        return callback(false);
      }
    });
};

db.selectMyQuestion = function (u_email, callback){
  var params = [u_email];
  var sql = "SELECT question.question_title, question.question_content, question.klay, category.category, question.q_selected FROM question INNER JOIN category ON question.email = ?  AND question.category_num = category.category_num";
  db.klaytndb.query(sql, params, function (err, result, fields) {
      if (err) {
          console.log(err);
          return callback(false);
      }
      else {
          return callback(result); // 해당 유저의 질문을 제목,내용,클레이양, 카테고리, 상태를 리스트로 반환 -> 상태는 밑에 부연 설명
      } // 질문 상태 0: 답변 진행중, 1: Like 진행중, 2: 답변 채택
  });
};

db.myQuestionList = function (session_id, callback) {
    db.countEmail(session_id, (rows1)=>{
      if(rows1){
            db.selectEmail(session_id, (rows2)=>{
              if(rows2){
                    db.countQuestionNum(rows2[0].email, (rows3)=>{
                      if(rows3){
                            db.selectMyQuestion(rows3[0].email, (rows4)=>{
                              return callback(rows4);
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
}; // use

db.countAnswerContent = function(u_email, callback){
  var sql = "SELECT email, count(answer_content) as total FROM answer WHERE email = ?";
  var params = [u_email];
  db.klaytndb.query(sql, params, function (err, result, fields) {
      if (result[0].total) {
        return callback(result);
      }
      else{
        return callback(false);
      }
    });
};

db.selectMyAnswer = function(u_email, callback){
  var params = [u_email];
  var sql = "SELECT question.question_title ,answer.answer_content, answer.is_selected FROM question JOIN answer ON answer.question_num = question.question_num AND answer.email = ?";
  db.klaytndb.query(sql, params, function (err, result, fields) {
      if (err) {
          console.log(err);
          return callback(false);
      }
      else {
          return callback(result); // 질문 제목, 답변 내용, 채택 여부를 리스트로 반환
      }
  });
};

db.myAnswerList = function (session_id, callback) {
    db.countEmail(session_id, (rows1)=>{
      if(rows1){
            db.selectEmail(session_id, (rows2)=>{
              if(rows2){
                    db.countAnswerContent(rows2[0].email, (rows3)=>{
                      if(rows3){
                            db.selectMyAnswer(rows3[0].email, (rows4)=>{
                              return callback(rows4);
                            })
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
}; // use

db.countLikeEmail = function(u_email, callback){
  var params = [u_email];
  var sql = "SELECT email, count(email) as total FROM userLike WHERE email = ?"
  db.klaytndb.query(sql, params, function (err, result, fields) {
      if (result[0].total) {
        return callback(result);
      }
      else{
        return callback(false);
      }
    });
};

db.selectAnswerNum = function(u_email, callback){
  var params = [u_email];
  var sql = "SELECT email, answer_num FROM userLike WHERE email = ?";
  db.klaytndb.query(sql, params, function (err, result, fields) {
      if (err) {
          console.log(err);
          return callback(false);
      }
      else {
        return callback(result);
      }
    });
};

db.countAnswerNum = function(u_email, callback){
  var params = [u_email];
  var sql = "SELECT email, answer_num, count(answer_num) as total FROM userLike WHERE email = ?";
  db.klaytndb.query(sql, params, function (err, result, fields) {
      if (result[0].total) {
        return callback(result);
      }
      else{
        return callback(false);
      }
    });
};

db.myLikeResult = function(u_email, answer_num, callback){
  var params = [u_email, answer_num];
  var sql = "SELECT l1.question_num, l1.answer_num, count(l2.answer_num) as like_num FROM userLike as l1 JOIN userLike as l2 ON l1.email = ? AND l2.answer_num = ?";
  db.klaytndb.query(sql, params, function (err, result, fields) {
      if (err) {
          console.log(err);
          return callback(false);
      }
      else {
          return callback(result); // 질문 번호, 답변 번호, 라이크 수 반환
      }
  });
};

db.myLikeList = function (session_id, callback) {
    db.countEmail(session_id, (rows1)=>{
      if(rows1){
            db.selectEmail(session_id, (rows2)=>{
              if(rows2){
                    db.countLikeEmail(rows2[0].email, (rows3)=>{
                      if(rows3){
                            db.selectAnswerNum(rows3[0].email, (rows4)=>{
                              if(rows4){
                                    db.countAnswerNum(rows4[0].email, (rows5)=>{
                                      if(rows5){
                                            db.myLikeResult(rows5[0].email, rows5[0].answer_num, (rows6)=>{
                                              return callback(rows6);
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
}; // use

db.myRemainKlay = function (session_id, callback) {
    db.countEmail(session_id, (rows1)=>{
      if(rows1){
            db.selectEmail(session_id, (rows2)=>{
              if(rows2){
                    db.countWallet(rows2[0].email, (rows3)=>{
                      if(rows3){
                            db.selectWalletAddress(rows3[0].email, (rows4)=>{
                              return callback(rows4);
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
}; // use

db.selectAllCategory = function (callback) {
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
}; // use

db.countQuestion = function(callback){
  var sql = "SELECT count(*) as total FROM question";
  db.klaytndb.query(sql, function (err, result, fields) {
      if (result[0].total) {
          return callback(result);
      }
      else {
        return callback(false);
      }
    });
};

db.insertQuestion = function(question_num, u_email, question_title, category, question_content, question_klay, trans_time, callback){
  var params = [question_num, u_email, question_title, category, question_content, question_klay, trans_time];
  var sql = "INSERT INTO question (question_num, email, question_title, category_num, question_content, klay, time) VALUES (?, ?, ?, ?, ?, ?, ?)";
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

db.maxQuestionNum = function (question_title, callback) {
  var sql3 = "SELECT MAX(question_num) as max FROM question WHERE question_title = ?";
  var params3 = [question_title];
  db.klaytndb.query(sql3, params3, function (err, result, fields) {
      if (err) {
          console.log(err);
          return callback(false);
      }
      else {
          return callback(result); // question_num 반환
      }
  });
};

db.insertQuestionFirst = function (session_id, question_title, question_klay, question_content, category, trans_time, callback) {
    db.countEmail(session_id, (rows)=>{
      if(rows){
            db.countQuestion((rows)=>{
              if(rows){
                    var question_num = rows[0].total + 1;
                    db.selectEmail(session_id, (rows)=>{
                      if(rows){
                            db.insertQuestion(question_num, rows[0].email, question_title, category, question_content, question_klay, trans_time, (rows)=>{
                              if(rows){
                                db.maxQuestionNum(question_title, (rows)=>{
                                  return callback(rows);
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
}; // use

db.insertQuestionSecond = function (session_id, transaction, callback) {
  db.selectEmail(session_id, (rows)=>{
    if(rows){
      var u_email = rows[0].email;
      db.countWallet(u_email, (rows)=>{
        if(rows){
          db.selectWalletAddress(u_email, (rows)=>{
            if(rows){
              db.insertTransaction(transaction, rows[0].wallet_address, (rows)=>{
                return callback(rows);
              })
            }
          });
        }
        else {
          return callback(false);
        }
      });
    }
  });
}; // use

db.countQuestionNumQN = function (question_num, callback) {
  var params = [question_num];
  var sql = "SELECT count(question_num) as total FROM question WHERE question_num = ?";
  db.klaytndb.query(sql, params, function (err, result, fields) {
      if (result[0].total) {
        return callback(true);
      }
      else{
        return callback(false);
      }
    });
};

db.countIsSelected = function (question_num, callback) {
  var sql = "SELECT count(is_selected) as total FROM answer WHERE question_num = ?";
  var params = [question_num];
  db.klaytndb.query(sql, params, function (err, result, fields) {
      if (err) {
          console.log(err);
          return callback(false);
      }
      else {
        return callback(result);
      }
    });
};

db.selectQuestionNoAnswer = function (question_num, callback) {
  var sql = "SELECT question.question_num, question.email, question.question_title, category.category, question.question_content, question.klay, question.time FROM question INNER JOIN category ON question.question_num = ?  AND question.category_num = category.category_num";
  var params = [question_num];
  db.klaytndb.query(sql, params, function (err, result, fields) {
      if (err) {
          console.log(err);
          return callback(false);
      }
      else {
          result[0].is_selected = "false"; // 답변이 없으니 채택 여부 false
          return callback(result);
      }
  });
};

db.selectQuestionAnswer = function(question_num, callback){
  var sql = "SELECT question.question_num, question.email, question.question_title, category.category, question.question_content, question.klay, question.time, answer.answer_num, answer.email, answer.answer_content, answer.is_selected FROM question INNER JOIN answer ON question.question_num = ? AND question.question_num = answer.question_num INNER JOIN category ON question.category_num = category.category_num";
  var params = [question_num];
  db.klaytndb.query(sql, params, function (err, result, fields) {
      if (err) {
          console.log(err);
          return callback(false);
      }
      else {
          return callback(result); // 질문 번호, 질문자 이메일, 질문 제목, 카테고리, 질문 내용, klay, 질문 시간, 답변 번호, 답변자 이메일, 답변 내용, 답변 채택 여부 반환
      }
  });
};

db.showQuestion = function (question_num, callback) {
    db.countQuestionNumQN(question_num, (rows1)=>{
      if(rows1){
            db.countIsSelected(question_num, (rows2)=>{
              if(rows2){
                    if (rows2[0].total == 0) { // 답변 없는 경우
                      db.selectQuestionNoAnswer(question_num, (rows3)=>{
                        return callback(rows3);
                      })
                    }
                    else { // 답변 있는 경우
                      db.selectQuestionAnswer(question_num, (rows3)=>{
                        return callback(rows3);
                      })
                    }
                }
            });
        }
        else {
            return callback(false);
        }
    });
}; // use

db.updateQuestionState = function (callback) {
  var sql = "UPDATE question SET q_selected = 1 WHERE question_num >= 0 AND DATE(time) < DATE(SUBDATE(NOW(), INTERVAL 7 DAY))";
  db.klaytndb.query(sql, function (err, result, fields) {
      if (err) {
          console.log(err);
          return callback(false);
      }
      else{
        return callback(true);
      }
  });
};

db.selectAllQuestionList = function (callback) {
  var sql = "SELECT question.question_num, question.question_title, question.email, category.category, question.klay, question.time FROM question INNER JOIN category ON question.category_num = category.category_num";
  db.klaytndb.query(sql, function (err, result, fields) {
      if (err) {
          console.log(err);
          return callback(false);
      }
      else {
          return callback(result); // 모든 질문에 대해 질문 번호, 질문 제목, 질문자 이메일, 카테고리, klay, 질문 시간 반환
      }
  });
};

db.selectQuestionCategoryTimeLast = function (question_state, keyword, category, callback) {
  var sql = "SELECT question.question_num, question.question_title, question.email, category.category, question.klay, question.time FROM question INNER JOIN category ON question.category_num = category.category_num AND question.q_selected = ? AND question.question_content LIKE ? AND question.category_num = ?";
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
};

db.selectQuestionCategoryTimeFirst = function (question_state, keyword, category, callback) {
  var sql = "SELECT question.question_num, question.question_title, question.email, category.category, question.klay, question.time FROM question INNER JOIN category ON question.category_num = category.category_num AND question.q_selected = ? AND question.question_content LIKE ? AND question.category_num = ? ORDER BY question.time DESC";
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
};

db.selectQuestionCategoryKlay = function (question_state, keyword, category, callback) {
  var sql = "SELECT question.question_num, question.question_title, question.email, category.category, question.klay, question.time FROM question INNER JOIN category ON question.category_num = category.category_num AND question.q_selected = ? AND question.question_content LIKE ? AND question.category_num = ? ORDER BY question.klay DESC";
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
};

db.selectQuestionTimeLast = function (question_state, keyword, category, callback) {
  var sql = "SELECT question.question_num, question.question_title, question.email, category.category, question.klay, question.time FROM question INNER JOIN category ON question.category_num = category.category_num AND question.q_selected = ? AND question.question_content LIKE ?"; //
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
};

db.selectQuestionTimeFirst = function (question_state, keyword, category, callback) {
  var sql = "SELECT question.question_num, question.question_title, question.email, category.category, question.klay, question.time FROM question INNER JOIN category ON question.category_num = category.category_num AND question.q_selected = ? AND question.question_content LIKE ? ORDER BY question.time DESC";
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
};

db.selectQuestionKlay = function (question_state, keyword, category, callback) {
  var sql = "SELECT question.question_num, question.question_title, question.email, category.category, question.klay, question.time FROM question INNER JOIN category ON question.category_num = category.category_num AND question.q_selected = ? AND question.question_content LIKE ? ORDER BY question.klay DESC";
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
};

db.showQuestionList = function (question_state, cur_time, allList, sort_num, keyword, category, callback) {
  db.updateQuestionState((rows)=>{});
    if (allList == 0) { // 모든 질문
        db.selectAllQuestionList((rows)=>{
          return callback(rows);
        });
    }
    else {
        sort_num = typeof sort_num !== 'undefined' ? sort_num : 0; // 0 -> 오래된 순, 1 -> 최신순, 2 -> klay순
        keyword = typeof keyword !== 'undefined' ? keyword : '%%';
        category = typeof category !== 'undefined' ? category : 0; // 0-> 전체, 1~13 -> 카테고리
        question_state = typeof question_state !== 'undefined' ? question_state : 0; // 0 -> 답변 진행중, 1 -> Like 진행중, 2 -> 채택 완료
        if (category != 0) { // 카테고리 별
            if (question_state == 0) { // 답변 진행중
                if (sort_num == 0) { // 오래된 순
                    db.selectQuestionCategoryTimeLast(question_state, keyword, category, (rows)=>{
                      return callback(rows);
                    });
                }
                else if (sort_num == 1) { // 최신순
                    db.selectQuestionCategoryTimeFirst(question_state, keyword, category, (rows)=>{
                      return callback(rows);
                    });
                }
                else { // klay 순
                  db.selectQuestionCategoryKlay(question_state, keyword, category, (rows)=>{
                    return callback(rows);
                  });
                }
            }
            else if (question_state == 1) { // Like 진행중
                if (sort_num == 0) { // 오래된 순
                    db.selectQuestionCategoryTimeLast(question_state, keyword, category, (rows)=>{
                      return callback(rows);
                    });
                }
                else if (sort_num == 1) { // 최신순
                  db.selectQuestionCategoryTimeFirst(question_state, keyword, category, (rows)=>{
                    return callback(rows);
                  });
                }
                else { // klay 순
                  db.selectQuestionCategoryKlay(question_state, keyword, category, (rows)=>{
                    return callback(rows);
                  });
                }
            }
            else { // 채택 완료
                if (sort_num == 0) { // 오래된 순
                  db.selectQuestionCategoryTimeLast(question_state, keyword, category, (rows)=>{
                    return callback(rows);
                  });
                }
                else if (sort_num == 1) { // 최신순
                  db.selectQuestionCategoryTimeFirst(question_state, keyword, category, (rows)=>{
                    return callback(rows);
                  });
                }
                else { // klay 순
                  db.selectQuestionCategoryKlay(question_state, keyword, category, (rows)=>{
                    return callback(rows);
                  });
                }
            }
        }
        else { // 카테고리 전체
            if (question_state == 0) { // 답변 진행중
                if (sort_num == 0) { // 오래된 순
                  db.selectQuestionTimeLast(question_state, keyword, (rows)=>{
                    return callback(rows);
                  });
                }
                else if (sort_num == 1) { // 최신순
                  db.selectQuestionTimeFirst(question_state, keyword, (rows)=>{
                    return callback(rows);
                  });
                }
                else { // klay 순
                  db.selectQuestionKlay(question_state, keyword, (rows)=>{
                    return callback(rows);
                  });
                }
            }
            else if (question_state == 1) { // Like 진행중
                if (sort_num == 0) { // 오래된 순
                  db.selectQuestionTimeLast(question_state, keyword, (rows)=>{
                    return callback(rows);
                  });
                }
                else if (sort_num == 1) { // 최신순
                  db.selectQuestionTimeFirst(question_state, keyword, (rows)=>{
                    return callback(rows);
                  });
                }
                else { // klay 순
                  db.selectQuestionKlay(question_state, keyword, (rows)=>{
                    return callback(rows);
                  });
                }
            }
            else { // 채택 완료
                if (sort_num == 0) { // 오래된 순
                  db.selectQuestionTimeLast(question_state, keyword, (rows)=>{
                    return callback(rows);
                  });
                }
                else if (sort_num == 1) { // 최신순
                  db.selectQuestionTimeFirst(question_state, keyword, (rows)=>{
                    return callback(rows);
                  });
                }
                else { // klay 순
                  db.selectQuestionKlay(question_state, keyword, (rows)=>{
                    return callback(rows);
                  });
                }
            }
        }
    }
}; // use

db.countAnswer = function (callback) {
  var sql = "SELECT count(*) as total FROM answer";
  db.klaytndb.query(sql, function (err, result, fields) {
      if (err) {
          console.log(err);
          return callback(false);
      }
      else {
        return callback(true);
      }
    });
};

db.countAnswerNumSession = function (session_id, callback) {
  var sql = "SELECT userSession.email, count(answer.answer_num) as total FROM userSession JOIN answer ON userSession.session_id = ?";
  var params = [session_id];
  db.klaytndb.query(sql, params, function (err, result, fields) {
      if (err) {
          console.log(err);
          return callback(false);
      }
      else {
        return callback(result);
      }
    });
};

db.insertAnswer =function (answer_num, u_email, answer_content, question_num, callback) {
  var sql = "INSERT INTO answer (answer_num, email, answer_content, question_num) VALUES (?, ?, ?, ?)";
  var params = [answer_num, u_email, answer_content, question_num];
  db.klaytndb.query(sql, params, function (err, result, fields) {
      if (err) {
          console.log(err);
          return callback(false);
      } // 답변 등록 성공
      else {
          return callback(true);
      }
  });
};

db.insertAnswerFirst = function (session_id, answer_content, question_num, callback) {
    db.countEmail(session_id, (rows1)=>{
      if(rows1){
            db.countAnswer((rows2)=>{
              if(rows2){
                    db.countAnswerNumSession(session_id, (rows3)=>{
                      if(rows3){
                            rows3[0].total = rows3[0].total + 1;
                            db.insertAnswer(rows3[0].total, rows3[0].email, answer_content, question_num, (rows4)=>{
                              return callback(rows4);
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
}; // use

db.selectQuestionState = function (question_num, callback) {
  var params = [question_num];
  var sql = "SELECT q_selected FROM question WHERE question_num = ?";
  db.klaytndb.query(sql, params, function (err, result, fields) {
      if (err) {
        return callback(false);
      }
      else{
        return callback(result);
      }
    });
};

db.insertLike = function(question_num, answer_num, u_email, callback){
  var sql = "INSERT INTO userLike (question_num, answer_num ,email) VALUES (?, ?, ?)";
  var params = [question_num, answer_num, u_email];
  db.klaytndb.query(sql, params, function (err, result, fields) {
      if (err) {
          console.log(err);
          return callback(false);
      } // like 성공
      else {
          return callback(true);
      }
  });
};

db.insertLikeFirst = function (session_id, question_num, answer_num, callback) {
    db.selectQuestionState(question_num, (rows1)=>{
      if(rows1[0].q_selected == 1){
        db.countEmail(session_id, (rows2)=>{
          if(rows2){
            db.selectEmail(session_id, (rows3)=>{
              if(rows3){
                db.insertLike(question_num, answer_num, rows3[0].email, (rows4)=>{
                  return callback(rows4);
                });
              }
            });
          }
          else {
            return callback(false);
          }
       });
      }
      else {
        return callback(false);
      }
    });
}; // use

db.updateQuestionStateSelected = function (question_num, callback) {
  var sql = "UPDATE question SET q_selected = 2 WHERE question_num = ?";
  var params = [question_num];
  db.klaytndb.query(sql, params, function (err, result, fields) {
      if (err) {
          console.log(err);
          return callback(false);
      }
      else{
        return callback(true);
      }
  }); // 질문 상태 채택 여부 true
};

db.updateAnswerIsSelected = function (question_num, answer_num, callback) {
  var sql = "UPDATE answer SET is_selected = true WHERE question_num = ? AND answer_num = ?";
  var params = [question_num, answer_num];
  db.klaytndb.query(sql, params, function (err, result, fields) {
      if (err) {
          console.log(err);
          return callback(false);
      } // 답변 상태 채택 여부 true로 변경
      else{
        return callback(true);
      }
  });
};

db.countEmailQuestionNum = function (question_num, callback) {
  var params = [question_num];
  var sql = "SELECT count(email) as total FROM answer WHERE question_num = ?";
  db.klaytndb.query(sql, params, function (err, result, fields) {
      if (result[0].total) {
        return callback(true);
      }
      else{
        return callback(false);
      }
    });
};

db.selectEmailQuestionNum = function (question_num, callback) {
  var sql = "SELECT email FROM question WHERE question_num = ?";
  var params = [question_num];
  db.klaytndb.query(sql, params, function (err, result, fields) {
      if (err) {
          console.log(err);
          return callback(false);
      }
      else {
        return callback(result);
      }
    });
};

db.selectWalletAndKlay = function (u_email, question_num, callback) {
  var sql = "SELECT userInfo.wallet_address as questioner_wallet_address, question.klay as klay FROM userInfo JOIN question ON userInfo.email = ? AND question.question_num = ?";
  var params = [u_email, question_num];
  db.klaytndb.query(sql, params, function (err, result, fields) {
      if (err) {
          console.log(err);
          return callback(false);
      }
      else {
        return callback(result);
      }
    });
};

db.selectEmailAnswerNum = function (answer_num, callback) {
  var sql = "SELECT email FROM answer WHERE answer_num = ?";
  var params = [answer_num];
  db.klaytndb.query(sql, params, function (err, result, fields) {
      if (err) {
          return callback(false);
      }
      else {
        return callback(result);
      }
    });
};

db.selectAnswer = function (question_num, answer_num, callback) {
    db.selectQuestionState(question_num, (rows1)=>{
      if(rows1[0].q_selected != 2){
            db.updateQuestionStateSelected(question_num, (rows2)=>{});
            db.updateAnswerIsSelected(question_num, answer_num, (rows3)=>{});
            db.countEmailQuestionNum(question_num, (rows4)=>{
              if(rows4){
                db.selectEmailQuestionNum(question_num, (rows5)=>{
                  if(rows5){
                    db.selectWalletAndKlay(rows5[0].email, question_num, (rows6)=>{
                      if(rows6){
                        db.selectEmailAnswerNum(answer_num, (rows7)=>{
                          if(rows7){
                            db.selectWalletAndPK(rows7[0].email, (rows8)=>{
                              if(rows8){
                                var data = {
                                  "questioner_wallet_address": rows6[0].questioner_wallet_address,
                                  "answer_wallet_address": rows8[0].wallet_address,
                                  "answer_private_key": rows8[0].private_key,
                                  "klay": rows6[0].klay
                                }
                              return callback(data);
                              }
                              else{
                                return callback(false);
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
        }
        else {
            return callback(false);
        }
    });
}; // use

db.countEmailAnswerNum = function (answer_num, callback) {
  var params = [answer_num];
  var sql = "SELECT count(email) as total FROM userLike WHERE answer_num = ?";
  db.klaytndb.query(sql, params, function (err, result, fields) {
      if (result[0].total) {
        return callback(true);
      }
      else{
        return callback(false);
      }
    });
};

db.selectEmailLikeAnswerNum = function (answer_num, callback) {
  var params = [answer_num];
  var sql = "SELECT email FROM userLike WHERE answer_num = ?";
  db.klaytndb.query(sql, params, function (err, result, fields) {
      if (err) {
          console.log(err);
          return callback(false);
      }
      else {
        return callback(result);
      }
    });
};

db.selectAnswerLike = function (answer_num, callback) {
  db.countEmailAnswerNum(answer_num, (rows1)=>{
    if(rows1){
      db.selectEmailLikeAnswerNum(answer_num, (rows2)=>{
        if(rows2){
          db.countWallet(rows2[0].email, (rows3)=>{
            if(rows3){
              db.selectWalletAndPK(rows3[0].email, (rows4)=>{
                if(rows4){
                  return callback(rows4);
                }
                else{
                  return callback(false);
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
}; // use

module.exports = db;
