var cav = require('../../../Klaytn')

var membershipCaver = {};

membershipCaver.addAccount = function(_privateKey){

    cav.caver.klay.accounts.wallet.add(_privateKey);

    return true;
}

membershipCaver.removeAccount = function(_address){

    cav.caver.klay.accounts.wallet.remove(_address);

    return true;
}

membershipCaver.createAccount = function(){

    var account = cav.caver.klay.accounts.create();

    return account;
}

module.exports = membershipCaver;
