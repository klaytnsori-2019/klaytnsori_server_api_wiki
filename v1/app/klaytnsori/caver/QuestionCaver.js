var cav = require('../../../../Klaytn');
var config = require('../../../../KlaytnConfig');

var questionCaver = {};

questionCaver.putReward = async function(_address, _privateKey, _value){

    var { rawTransaction: senderFeeRawTransaction } = await cav.caver.klay.accounts.signTransaction({
        type: 'FEE_DELEGATED_VALUE_TRANSFER',
        from: _address,
        to: config.feePayerAddress,
        gas: '300000',
        value: cav.caver.utils.toPeb(_value*0.001, 'KLAY'),
    }, _privateKey);

    var feeReceipt = await cav.caver.klay.sendTransaction({
        senderRawTransaction: senderFeeRawTransaction,
        feePayer: config.feePayerAddress,
    });

    var funcData = await cav.caver.klay.abi.encodeFunctionCall({
        name: 'deposit',
        type: 'function',
        inputs: [],
    }, []);

    var { rawTransaction: senderRawTransaction } = await cav.caver.klay.accounts.signTransaction({
        type: 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION',
        from: _address,
        to:   config.contractAddress,
        data: funcData,
        gas:  '300000',
        value: cav.caver.utils.toPeb(_value*0.999, 'KLAY'),
    }, _privateKey)

    var receipt = await cav.caver.klay.sendTransaction({
        senderRawTransaction: senderRawTransaction,
        feePayer: config.feePayerAddress,
    });

    var block = await cav.caver.klay.getBlock(receipt.blockNumber);

    var data = {
        receipt: receipt,
        timestamp: block.timestamp,
        feeReceipt: feeReceipt
    };

    return data;
};

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

    var { rawTransaction: senderRawTransaction } = await cav.caver.klay.accounts.signTransaction({
        type: 'FEE_DELEGATED_SMART_CONTRACT_EXECUTION',
        from: _address,
        to:   config.contractAddress,
        data: funcData,
        gas:  '300000',
    }, _privateKey);

    var receipt = await cav.caver.klay.sendTransaction({
        senderRawTransaction: senderRawTransaction,
        feePayer: config.feePayerAddress,
    });

    var block = await cav.caver.klay.getBlock(receipt.blockNumber);

    var data = {
        receipt: receipt,
        timestamp: block.timestamp
    }

    return data;
};

module.exports = questionCaver;
