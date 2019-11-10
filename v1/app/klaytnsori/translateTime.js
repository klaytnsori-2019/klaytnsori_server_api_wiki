var translateTime = {};

translateTime.translateDate = function(unixTimeStamp){
  var date = new Date(unixTimeStamp*1000);
  var year = date.getFullYear();
  var month = "0" + (date.getMonth()+1);
  var day = "0" + date.getDate();
  var hour = "0" + date.getHours();
  var minute = "0" + date.getMinutes();
  var second = "0" + date.getSeconds();

  return year + "." + month.substr(-2) + "." + day.substr(-2) + " " + hour.substr(-2) + ":" + minute.substr(-2);
};

module.exports = translateTime;
