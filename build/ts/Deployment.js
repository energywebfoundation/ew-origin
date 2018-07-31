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
const _1 = require(".");
const _2 = require(".");
const EthereumTx = require('ethereumjs-tx');
const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545');
let address = '0xd173313a51f8fc37bcf67569b463abd89d81844f';
let privateKey = 'd9066ff9f753a1898709b568119055660a77d9aae4d7a4ad677b8fb3d2a571e5';
const main = () => __awaiter(this, void 0, void 0, function* () {
    const CooAddress = yield exports.deployCoo();
    console.log('CoO deployed: ' + CooAddress);
    const assetConsumingLogicAddress = yield exports.deployContract(CooAddress, _1.AssetConsumingLogicTruffleBuild);
    console.log('AssetConsumingLogic deployed: ' + assetConsumingLogicAddress);
    const assetConsumingDBAddress = yield exports.deployContract(assetConsumingLogicAddress, _2.AssetConsumingDBTruffleBuild);
    console.log('AssetConsumingDB deployed: ' + assetConsumingDBAddress);
    const assetProducingLogicAddress = yield exports.deployContract(CooAddress, _1.AssetProducingLogicTruffleBuild);
    console.log('AssetProducingLogic deployed: ' + assetProducingLogicAddress);
    const assetProducingDBAddress = yield exports.deployContract(assetProducingLogicAddress, _2.AssetProducingDBTruffleBuild);
    console.log('AssetProducingDB deployed: ' + assetProducingDBAddress);
    const certificateLogicAddress = yield exports.deployContract(CooAddress, _1.CertificateLogicTruffleBuild);
    console.log('CertificateLogic deployed: ' + certificateLogicAddress);
    const certificateDBAddress = yield exports.deployContract(certificateLogicAddress, _2.CertificateDBTruffleBuild);
    console.log('CertificateDB deployed: ' + certificateLogicAddress);
    const demandLogicAddress = yield exports.deployContract(CooAddress, _1.DemandLogicTruffleBuild);
    console.log('DemandLogic deployed: ' + demandLogicAddress);
    const demandDbAddress = yield exports.deployContract(demandLogicAddress, _2.DemandDBTruffleBuild);
    console.log('DemandDB deployed: ' + demandDbAddress);
    const userLogicAddress = yield exports.deployContract(CooAddress, _1.UserLogicTruffleBuild);
    console.log('UserLogic deployed: ' + userLogicAddress);
    const userDbAddress = yield exports.deployContract(userLogicAddress, _2.UserDBTruffleBuild);
    console.log('UserDB deployed: ' + userDbAddress);
    console.log('init assetConsuming');
    yield exports.logicInit(assetConsumingLogicAddress, assetConsumingDBAddress);
    console.log('init assetProducing');
    yield exports.logicInit(assetProducingLogicAddress, assetProducingDBAddress);
    console.log('init certificate');
    yield exports.logicInit(certificateLogicAddress, certificateDBAddress);
    console.log('init demand');
    yield exports.logicInit(demandLogicAddress, demandDbAddress);
    console.log('init userlogic');
    yield exports.logicInit(userLogicAddress, userDbAddress);
    console.log('init coo');
    yield exports.initCoo(CooAddress, userLogicAddress, assetProducingLogicAddress, certificateLogicAddress, demandLogicAddress, assetConsumingLogicAddress);
});
exports.deployContract = (CoO, TruffleBuild, privateKeyAdmin) => __awaiter(this, void 0, void 0, function* () {
    if (privateKeyAdmin) {
        privateKey = privateKeyAdmin;
        address = web3.eth.accounts.privateKeyToAccount('0x' + privateKey).address;
    }
    let encode = web3.eth.abi.encodeParameters(['address'], [CoO]);
    encode = encode.substr(2);
    const txCount = yield web3.eth.getTransactionCount(address);
    const txData = {
        nonce: web3.utils.toHex(txCount),
        gasLimit: web3.utils.toHex(7000000),
        gasPrice: web3.utils.toHex(0),
        data: TruffleBuild.bytecode + encode,
        from: address
    };
    const pk = Buffer.from(privateKey, 'hex');
    const transaction = new EthereumTx(txData);
    transaction.sign(Buffer.from(privateKey, 'hex'));
    const serializedTx = transaction.serialize().toString('hex');
    const tx = (yield web3.eth.sendSignedTransaction('0x' + serializedTx));
    return tx.contractAddress;
});
exports.deployCoo = (privateKeyAdmin) => __awaiter(this, void 0, void 0, function* () {
    if (privateKeyAdmin) {
        privateKey = privateKeyAdmin;
        address = web3.eth.accounts.privateKeyToAccount('0x' + privateKey).address;
    }
    const txCount = yield web3.eth.getTransactionCount(address);
    const txData = {
        nonce: web3.utils.toHex(txCount),
        gasLimit: web3.utils.toHex(7000000),
        gasPrice: web3.utils.toHex(0),
        data: _1.CoOTruffleBuild.bytecode,
        from: address
    };
    const pk = Buffer.from(privateKey, 'hex');
    const transaction = new EthereumTx(txData);
    transaction.sign(Buffer.from(privateKey, 'hex'));
    const serializedTx = transaction.serialize().toString('hex');
    const CooTx = (yield web3.eth.sendSignedTransaction('0x' + serializedTx));
    return CooTx.contractAddress;
});
exports.logicInit = (logicaddress, dbAddress, privateKeyAdmin) => __awaiter(this, void 0, void 0, function* () {
    if (privateKeyAdmin) {
        privateKey = privateKeyAdmin;
        address = web3.eth.accounts.privateKeyToAccount('0x' + privateKey).address;
    }
    const txCount = yield web3.eth.getTransactionCount(address);
    const txdata = web3.eth.abi.encodeFunctionCall({
        name: 'init',
        type: 'function',
        inputs: [{
                "name": "_dbAddress",
                "type": "address"
            }]
    }, [dbAddress]);
    const txData = {
        nonce: web3.utils.toHex(txCount),
        gasLimit: web3.utils.toHex(7000000),
        gasPrice: web3.utils.toHex(0),
        data: txdata,
        from: address,
        to: logicaddress
    };
    const pk = Buffer.from(privateKey, 'hex');
    const transaction = new EthereumTx(txData);
    transaction.sign(Buffer.from(privateKey, 'hex'));
    const serializedTx = transaction.serialize().toString('hex');
    const tx = (yield web3.eth.sendSignedTransaction('0x' + serializedTx));
});
exports.initCoo = (cooAddress, userlogic, assetProducingRegistryLogic, certificateLogic, demandLogics, assetConsumingRegistryLogic, privateKeyAdmin) => __awaiter(this, void 0, void 0, function* () {
    if (privateKeyAdmin) {
        privateKey = privateKeyAdmin;
        address = web3.eth.accounts.privateKeyToAccount('0x' + privateKey).address;
    }
    const txCount = yield web3.eth.getTransactionCount(address);
    const txdata = web3.eth.abi.encodeFunctionCall({
        name: 'init',
        type: 'function',
        inputs: [
            {
                "name": "_userRegistry",
                "type": "address"
            },
            {
                "name": "_assetProducingRegistry",
                "type": "address"
            },
            {
                "name": "_certificateRegistry",
                "type": "address"
            },
            {
                "name": "_demandRegistry",
                "type": "address"
            },
            {
                "name": "_assetConsumingRegistry",
                "type": "address"
            }
        ]
    }, [userlogic, assetProducingRegistryLogic, certificateLogic, demandLogics, assetConsumingRegistryLogic]);
    const txData = {
        nonce: web3.utils.toHex(txCount),
        gasLimit: web3.utils.toHex(7000000),
        gasPrice: web3.utils.toHex(0),
        data: txdata,
        from: address,
        to: cooAddress
    };
    const pk = Buffer.from(privateKey, 'hex');
    const transaction = new EthereumTx(txData);
    transaction.sign(Buffer.from(privateKey, 'hex'));
    const serializedTx = transaction.serialize().toString('hex');
    const tx = (yield web3.eth.sendSignedTransaction('0x' + serializedTx));
});
//# sourceMappingURL=Deployment.js.map