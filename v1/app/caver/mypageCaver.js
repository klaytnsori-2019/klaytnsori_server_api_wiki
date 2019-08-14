var cav = require('../../../Klaytn');
var decoder = require('../../../Decoder');

var mypageCaver = {};

mypageCaver.showTransactions = function(_blockNumList){

    var transactions = new Array;

    for(var txHash in _blockNumList){
        var receipt = cav.caver.klay.getTransactionReceipt(txHash);
        var b_isReceived = false;
        var value = receipt.value;

        if(recepit.value == 0){
            b_isReceived = true;
            value = decoder(receipt.input);
        }

        cav.caver.klay.getBlock().then((result)=>{
            var data = {
                "isReceived" : b_isReceived,
                "from" : receipt.from,
                "to" : receipt.to,
                "value" : value,
                "timestamp" : result.timestamp
            }
            transactions.push(data);
        });
    }

    return transactions;
}

mypageCaver.showMyKlay = function(_address){

    cav.caver.klay.getBalance(_address).then((result)=>{
        var balance = cav.caver.utils.fromPeb(result, 'KLAY');
        return balance;
    });
}

module.exports = mypageCaver;