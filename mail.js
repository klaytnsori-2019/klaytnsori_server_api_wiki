var nodemailer = require('nodemailer');
var mail = {};
mail.transporter = nodemailer.createTransport({
  service:'gmail',
  auth:{
    user : 'klaytnsori@gmail.com',
    pass : 'klaytnsori2019'
  }
});
mail.mailOption = function(_email, _text){
  var mailcontent = function(_text){
    var head = "Hello! Thanks to join our service!\n";
    var mid = "Authorize code is ";
    var tail = "\nThanks you.";
    return head+mid+_text+tail;
  };
  return {
    from : 'tyzlddy@gmail.com',
    to : _email,
    subject: 'nodemailer test',
    text : mailcontent(_text)
  };
};

module.exports = mail;
