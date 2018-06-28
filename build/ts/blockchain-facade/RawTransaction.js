"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const EthereumTx = require('ethereumjs-tx');
function sendRawTx(sender, nonce, gas, txdata, blockchainProperties, to) {
    return __awaiter(this, void 0, void 0, function* () {
        const txData = {
            nonce: blockchainProperties.web3.utils.toHex(nonce),
            gasLimit: blockchainProperties.web3.utils.toHex(gas * 2),
            gasPrice: blockchainProperties.web3.utils.toHex(0),
            data: txdata,
            from: sender,
            to: to
        };
        const transaction = new EthereumTx(txData);
        const privateKey = Buffer.from(blockchainProperties.privateKey, 'hex');
        transaction.sign(privateKey);
        const serializedTx = transaction.serialize().toString('hex');
        return (yield blockchainProperties.web3.eth.sendSignedTransaction('0x' + serializedTx));
    });
}
exports.sendRawTx = sendRawTx;
//# sourceMappingURL=RawTransaction.js.map