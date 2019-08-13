const abiDecoder = require('abi-decoder');
const config = require('./KlaytnConfig.js');

const ABI = config.ABI;
abiDecoder.addABI(ABI);

var decoder = function(data){
    return abiDecoder.decodeMethod(data);
}

module.exports = decoder;