var caver = require('../../../Klaytn')

var membershipCaver = {};

membershipCaver.addAccount = function(_privateKey){

    return true;
}

membershipCaver.removeAccount = function(_address){

    return true;
}

membershipCaver.createAccount = function(){

    return account;
}

module.exports = membershipCaver;
