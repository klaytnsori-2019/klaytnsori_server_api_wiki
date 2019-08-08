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
  return {
    from : 'tyzlddy@gmail.com',
    to : _email,
    subject: 'nodemailer test',
    text : _text
  };
};

module.exports = mail;
