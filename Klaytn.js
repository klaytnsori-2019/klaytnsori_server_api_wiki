const Caver = require('caver-js');
const caver = new Caver('https://api.baobab.klaytn.net:8651/');
const Config = require('./KlaytnConfig');

var cav = {}

cav.initialize = function(){
    caver.klay.accounts.wallet.create();
    caver.klay.accounts.wallet.add(config.feePayerPrivateKey);
};

cav.config = Config;

module.exports = cav;