var cav = require('../../../../Klaytn');

var membershipCaver = {};

membershipCaver.addAccount = function(_privateKey){

    try{
        cav.caver.klay.accounts.wallet.add(_privateKey);
        return true;
    }catch(e){
        return false;
    }
};

membershipCaver.removeAccount = function(_address){

    var result = cav.caver.klay.accounts.wallet.remove(_address);

    return result;
};

membershipCaver.createAccount = function(){

    var account = cav.caver.klay.accounts.create();

    return account;
};

// testing func
membershipCaver.clearWallet = function(){

    cav.caver.klay.accounts.wallet.clear();
};

module.exports = membershipCaver;
