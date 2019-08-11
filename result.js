var result = {};

result.successTrue = function(data){
  return{
    result:true,
    data:data
  };
};

result.successFalse = function(err, message){
  if(!err&&!message) message = 'data not found';
  return{
    result:false,
    message:message,
    errors:(err)? result.parseError(err):null,
  };
};

result.parseError = function(errors){
  var parsed = {};
  for(var name in errors.errors){
    var errorname = errors.errors[name];
    parsed[name] = { message: errorname.message};
  }
  return parsed;
};

module.exports = result;
