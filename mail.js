var nodemailer = require('nodemailer');
var mail = {};

mail.transporter = nodemailer.createTransport({
  service:'gmail',
  auth:{
    user : 'klaytnsori@gmail.com',
    pass : 'klaytnsori2019'
  }
});

mail.mailOptionSignup = function(_email, _text){
  var mailcontent = function(_text){
    var head = "Hello! Thanks to join our service!\n";
    var mid = "Authorize code is ";
    var tail = "\nThanks you.";
    return head+mid+_text+tail;
  };
  var subjectContent = function(_email){
    var head = "Hello! "
  }
  return {
    from : 'klaytnsori@gmail.com',
    to : _email,
    subject: 'Hello! Wellcome to Klaytnsori!',
    text : mailcontent(_text)
  };
};

mail.mailOptionFindPw = function(_email, _text){
  var mailcontent = function(_text){
    var head = "Hello! You want to find Password!\n";
    var mid = "Authorize code is ";
    var tail = "\nThanks you.";
    return head+mid+_text+tail;
  };
  var subjectContent = function(_email){
    var head = "Hello! "
  }
  return {
    from : 'klaytnsori@gmail.com',
    to : _email,
    subject: 'Hello! Wellcome to Klaytnsori!',
    text : mailcontent(_text)
  };
}

module.exports = mail;
