var cav = require('../../../../Klaytn');
var config = require('../../../../KlaytnConfig');

var questionCaver = {};

questionCaver.putReward = async function(_address, _privateKey, _value){

    var funcData = await cav.caver.klay.abi.encodeFunctionCall({
        name: 'deposit',
        type: 'function',
        inputs: [],
    }, []);

    var rawTransaction = await cav.caver.klay.accounts.signTransaction({
        type: 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION',
        from: _address,
        to:   config.contractAddress,
        data: funcData,
        gas:  '300000',
        value: cav.caver.utils.toPeb(_value, 'KLAY'),
    }, _privateKey)

    cav.caver.klay.sendTransaction({
        senderRawTransaction: rawTransaction,
        feePayer: config.feePayerAddress,
    }).then(function(receipt){
        return receipt;
    })
}

questionCaver.getReward = async function(_address, _privateKey, _questionerAddress,_value){

    var funcData = await cav.caver.klay.abi.encodeFunctionCall({
        name: 'transfer',
        type: 'function',
        inputs: [{
            type: 'address',
            name: '_questionerAddress'
        },{
            type: 'uint256',
            name: '_value'
        }]
    }, [_questionerAddress, cav.caver.utils.toPeb(_value,'KLAY')]);

    var rawTransaction = await cav.caver.klay.accounts.signTransaction({
        type: 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION',
        from: _address,
        to:   config.contractAddress,
        data: funcData,
        gas:  '300000',
    }, _privateKey);

    cav.caver.klay.sendTransaction({
        senderRawTransaction: rawTransaction,
        feePayer: config.feePayerAddress,
    }).then(function(receipt){
        return receipt;
    })
}

module.exports = questionCaver;
