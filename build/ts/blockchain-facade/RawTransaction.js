"use strict";
// Copyright 2018 Energy Web Foundation
//
// This file is part of the Origin Application brought to you by the Energy Web Foundation,
// a global non-profit organization focused on accelerating blockchain technology across the energy sector, 
// incorporated in Zug, Switzerland.
//
// The Origin Application is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// This is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY and without an implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details, at <http://www.gnu.org/licenses/>.
//
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