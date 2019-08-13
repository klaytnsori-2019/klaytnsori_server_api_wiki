const Caver = require('caver-js');
const ca = new Caver('https://api.baobab.klaytn.net:8651/');
const Config = require('./KlaytnConfig');

var cav = {}

cav.initialize = function(){
    ca.klay.accounts.wallet.create();
    ca.klay.accounts.wallet.add(Config.feePayerPrivateKey);
};

cav.config = Config;
cav.caver = ca;

module.exports = cav;