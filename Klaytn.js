const Cav = require('caver-js');
const cav = new Cav('https://api.baobab.klaytn.net:8651/');
const Config = require('./KlaytnConfig');

var klaytn = {}

klaytn.initialize = function(){
    cav.klay.accounts.wallet.create();
    cav.klay.accounts.wallet.add(Config.feePayerPrivateKey);
};

klaytn.config = Config;
klaytn.caver = cav;

module.exports = klaytn;