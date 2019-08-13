var cav = require('../../../Klaytn');

var membershipCaver = {};

membershipCaver.addAccount = function(_privateKey){

    var account = cav.caver.klay.accounts.wallet.add(_privateKey);

    return account;
}

membershipCaver.removeAccount = function(_address){

    var result = cav.caver.klay.accounts.wallet.remove(_address);

    return result;
}

membershipCaver.createAccount = function(){

    var account = cav.caver.klay.accounts.create();

    return account;
}

module.exports = membershipCaver;
