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
require("mocha");
const fs = require("fs");
const Web3 = require('web3');
const CoOTruffleBuild = JSON.parse(fs.readFileSync('build/contracts/CoO.json', 'utf-8').toString());
const AssetProducingLogicTruffleBuild = JSON.parse(fs.readFileSync('build/contracts/AssetProducingRegistryLogic.json', 'utf-8').toString());
const AssetConsumingLogicTruffleBuild = JSON.parse(fs.readFileSync('build/contracts/AssetConsumingRegistryLogic.json', 'utf-8').toString());
const UserLogicTruffleBuild = JSON.parse(fs.readFileSync('build/contracts/UserLogic.json', 'utf-8').toString());
const DemandTruffleBuild = JSON.parse(fs.readFileSync('build/contracts/DemandLogic.json', 'utf-8').toString());
let web3;
let assetAdminAccount;
let topAdminAccount;
let blockchainProperties;
let assetProducingArray = [];
let assetConsumingArray = [];
let demandArray = [];
let userArray = [];
let pAssetLogicInstance;
let cAssetLogicInstance;
let uLogicInstance;
let dLogicInstance;
const getInstanceFromTruffleBuild = (truffleBuild, web3) => {
    const address = Object.keys(truffleBuild.networks).length > 0 ? truffleBuild.networks[Object.keys(truffleBuild.networks)[0]].address : null;
    return new web3.eth.Contract(truffleBuild.abi, address);
};
const init = () => __awaiter(this, void 0, void 0, function* () {
    blockchainProperties = {
        web3: web3,
        producingAssetLogicInstance: pAssetLogicInstance,
        consumingAssetLogicInstance: cAssetLogicInstance,
        userLogicInstance: uLogicInstance,
        demandLogicInstance: dLogicInstance,
        assetAdminAccount: "0xd173313a51f8fc37bcf67569b463abd89d81844f",
        topAdminAccount: "0xd173313a51f8fc37bcf67569b463abd89d81844f",
        userAdmin: "0xd173313a51f8fc37bcf67569b463abd89d81844f"
    };
});
const main = () => __awaiter(this, void 0, void 0, function* () {
    const cooAddress = process.argv[2];
    web3 = new Web3('http://localhost:8545');
    if (!cooAddress) {
        console.log("no coo-Address found, using the truffle-abi");
        pAssetLogicInstance = yield getInstanceFromTruffleBuild(AssetProducingLogicTruffleBuild, web3);
        cAssetLogicInstance = yield getInstanceFromTruffleBuild(AssetConsumingLogicTruffleBuild, web3);
        uLogicInstance = yield getInstanceFromTruffleBuild(UserLogicTruffleBuild, web3);
        dLogicInstance = yield getInstanceFromTruffleBuild(DemandTruffleBuild, web3);
    }
    else {
        console.log("cooAddress: " + cooAddress);
        const cooContractInstance = yield (new web3.eth.Contract(CoOTruffleBuild.abi, cooAddress));
        const assetProducingRegistryAddress = yield cooContractInstance.methods.assetProducingRegistry().call();
        const demandLogicAddress = yield cooContractInstance.methods.demandRegistry().call();
        const certificateLogicAddress = yield cooContractInstance.methods.certificateRegistry().call();
        const assetConsumingRegistryAddress = yield cooContractInstance.methods.assetConsumingRegistry().call();
        const userLogicAddress = yield cooContractInstance.methods.userRegistry().call();
        pAssetLogicInstance = new web3.eth.Contract(AssetProducingLogicTruffleBuild.abi, assetProducingRegistryAddress);
        cAssetLogicInstance = new web3.eth.Contract(AssetConsumingLogicTruffleBuild.abi, assetConsumingRegistryAddress);
        uLogicInstance = new web3.eth.Contract(UserLogicTruffleBuild.abi, userLogicAddress);
        dLogicInstance = new web3.eth.Contract(DemandTruffleBuild.abi, demandLogicAddress);
    }
    //   await fs.createReadStream('/Users/mkuechler/ewf/CoO/userData.csv').pipe(myParser);
    yield init();
});
main();
//# sourceMappingURL=meterReadings.js.map