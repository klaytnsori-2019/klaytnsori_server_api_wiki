var cav = require('../../../../Klaytn');
var decoder = require('../../../../Decoder');

var mypageCaver = {};

mypageCaver.showTransactions = async function(_blockNumList){

    var transactions = new Array;

    for(var txHash in _blockNumList){
        var receipt = await cav.caver.klay.getTransactionReceipt(txHash);
        var b_isReceived = false;
        var value = receipt.value;

        if(recepit.value == 0){
            b_isReceived = true;
            value = decoder(receipt.input);
        }

        var block = await cav.caver.klay.getBlock();

        var data = {
            "isReceived" : b_isReceived,
            "from" : receipt.from,
            "to" : receipt.to,
            "value" : value,
            "timestamp" : block.timestamp
        };

        transactions.push(data);
        
    }

    return transactions;
}

mypageCaver.showMyKlay = async function(_address){

    var balance = await cav.caver.klay.getBalance(_address);
    //return cav.caver.utils.fromPeb(balance, 'KLAY');
    
    return balance;
}

module.exports = mypageCaver;
