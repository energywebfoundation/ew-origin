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
const Asset_1 = require("./Asset");
const RawTransaction_1 = require("./RawTransaction");
var Compliance;
(function (Compliance) {
    Compliance[Compliance["none"] = 0] = "none";
    Compliance[Compliance["IREC"] = 1] = "IREC";
    Compliance[Compliance["EEC"] = 2] = "EEC";
    Compliance[Compliance["TIGR"] = 3] = "TIGR";
})(Compliance = exports.Compliance || (exports.Compliance = {}));
class ConsumingAsset extends Asset_1.Asset {
    static CREATE_ASSET(assetProperties, blockchainProperties) {
        return __awaiter(this, void 0, void 0, function* () {
            const gasCreate = yield blockchainProperties.consumingAssetLogicInstance.methods
                .createAsset()
                .estimateGas({ from: blockchainProperties.assetAdminAccount });
            const txCreate = yield blockchainProperties.consumingAssetLogicInstance.methods
                .createAsset()
                .send({ from: blockchainProperties.assetAdminAccount, gas: Math.round(gasCreate * 1.1) });
            const assetId = parseInt(txCreate.events.LogAssetCreated.returnValues._assetId, 10);
            const initGeneralParams = [
                assetId,
                assetProperties.smartMeter,
                assetProperties.owner,
                assetProperties.operationalSince,
                assetProperties.capacityWh,
                assetProperties.maxCapacitySet,
                assetProperties.active
            ];
            const gasInitGeneral = yield blockchainProperties.consumingAssetLogicInstance.methods
                .initGeneral(...initGeneralParams)
                .estimateGas({ from: blockchainProperties.assetAdminAccount });
            const txInitGeneral = yield blockchainProperties.consumingAssetLogicInstance.methods
                .initGeneral(...initGeneralParams)
                .send({ from: blockchainProperties.assetAdminAccount, gas: Math.round(gasInitGeneral * 1.1) });
            const initLocationParams = [
                assetId,
                blockchainProperties.web3.utils.fromUtf8(assetProperties.country),
                blockchainProperties.web3.utils.fromUtf8(assetProperties.region),
                blockchainProperties.web3.utils.fromUtf8(assetProperties.zip),
                blockchainProperties.web3.utils.fromUtf8(assetProperties.city),
                blockchainProperties.web3.utils.fromUtf8(assetProperties.street),
                blockchainProperties.web3.utils.fromUtf8(assetProperties.houseNumber),
                blockchainProperties.web3.utils.fromUtf8(assetProperties.gpsLatitude),
                blockchainProperties.web3.utils.fromUtf8(assetProperties.gpsLongitude)
            ];
            const gasInitLocation = yield blockchainProperties.consumingAssetLogicInstance.methods
                .initLocation(...initLocationParams)
                .estimateGas({ from: blockchainProperties.assetAdminAccount });
            const txInitLocation = yield blockchainProperties.consumingAssetLogicInstance.methods
                .initLocation(...initLocationParams)
                .send({ from: blockchainProperties.assetAdminAccount, gas: Math.round(gasInitLocation * 1.1) });
            return (new ConsumingAsset(assetId, blockchainProperties)).syncWithBlockchain();
        });
    }
    static CREATE_ASSET_RAW(assetProperties, blockchainProperties) {
        return __awaiter(this, void 0, void 0, function* () {
            const gasCreate = yield blockchainProperties.consumingAssetLogicInstance.methods
                .createAsset()
                .estimateGas({ from: blockchainProperties.assetAdminAccount });
            const txCreate = yield blockchainProperties.consumingAssetLogicInstance.methods
                .createAsset()
                .encodeABI();
            const tx = yield RawTransaction_1.sendRawTx(blockchainProperties.assetAdminAccount, yield blockchainProperties.web3.eth.getTransactionCount(blockchainProperties.assetAdminAccount), Math.round(gasCreate * 1.1), txCreate, blockchainProperties, blockchainProperties.consumingAssetLogicInstance._address);
            const assetId = Number(tx.logs[0].topics[1]);
            const initGeneralParams = [
                assetId,
                assetProperties.smartMeter,
                assetProperties.owner,
                assetProperties.operationalSince,
                assetProperties.capacityWh,
                assetProperties.maxCapacitySet,
                assetProperties.active
            ];
            const gasInitGeneral = yield blockchainProperties.consumingAssetLogicInstance.methods
                .initGeneral(...initGeneralParams)
                .estimateGas({ from: blockchainProperties.assetAdminAccount });
            const txInitGeneral = yield blockchainProperties.consumingAssetLogicInstance.methods
                .initGeneral(...initGeneralParams)
                .encodeABI();
            const initLocationParams = [
                assetId,
                blockchainProperties.web3.utils.fromUtf8(assetProperties.country),
                blockchainProperties.web3.utils.fromUtf8(assetProperties.region),
                blockchainProperties.web3.utils.fromUtf8(assetProperties.zip),
                blockchainProperties.web3.utils.fromUtf8(assetProperties.city),
                blockchainProperties.web3.utils.fromUtf8(assetProperties.street),
                blockchainProperties.web3.utils.fromUtf8(assetProperties.houseNumber),
                blockchainProperties.web3.utils.fromUtf8(assetProperties.gpsLatitude),
                blockchainProperties.web3.utils.fromUtf8(assetProperties.gpsLongitude)
            ];
            const gasInitLocation = yield blockchainProperties.consumingAssetLogicInstance.methods
                .initLocation(...initLocationParams)
                .estimateGas({ from: blockchainProperties.assetAdminAccount });
            const txInitLocation = yield blockchainProperties.consumingAssetLogicInstance.methods
                .initLocation(...initLocationParams)
                .encodeABI();
            const txCount = yield blockchainProperties.web3.eth.getTransactionCount(blockchainProperties.assetAdminAccount);
            RawTransaction_1.sendRawTx(blockchainProperties.assetAdminAccount, txCount, Math.round(gasInitGeneral * 1.1), txInitGeneral, blockchainProperties, blockchainProperties.consumingAssetLogicInstance._address);
            yield RawTransaction_1.sendRawTx(blockchainProperties.assetAdminAccount, txCount + 1, Math.round(gasInitLocation * 1.1), txInitLocation, blockchainProperties, blockchainProperties.consumingAssetLogicInstance._address);
            return (new ConsumingAsset(assetId, blockchainProperties)).syncWithBlockchain();
        });
    }
    static GET_ASSET_LIST_LENGTH(blockchainProperties) {
        return __awaiter(this, void 0, void 0, function* () {
            return parseInt(yield blockchainProperties.consumingAssetLogicInstance.methods.getAssetListLength().call(), 10);
        });
    }
    static GET_ALL_ASSETS(blockchainProperties) {
        return __awaiter(this, void 0, void 0, function* () {
            const assetsPromises = Array(yield ConsumingAsset.GET_ASSET_LIST_LENGTH(blockchainProperties))
                .fill(null)
                .map((item, index) => (new ConsumingAsset(index, blockchainProperties)).syncWithBlockchain());
            return Promise.all(assetsPromises);
        });
    }
    static GET_ALL_ASSET_OWNED_BY(owner, blockchainProperties) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield ConsumingAsset.GET_ALL_ASSETS(blockchainProperties))
                .filter((asset) => asset.owner.toLowerCase() === owner.toLowerCase());
        });
    }
    saveSmartMeter(_newMeterRead, _lastSmartMeterReadFileHash, _smartMeterDown, blockchainProperties) {
        return __awaiter(this, void 0, void 0, function* () {
            const account = blockchainProperties.web3.eth.accounts.privateKeyToAccount("0x" + blockchainProperties.privateKey).address;
            const txdata = this.blockchainProperties.consumingAssetLogicInstance.methods.saveSmartMeterRead(this.id, _newMeterRead, _lastSmartMeterReadFileHash, _smartMeterDown)
                .encodeABI();
            const txGas = yield this.blockchainProperties.consumingAssetLogicInstance.methods.saveSmartMeterRead(this.id, _newMeterRead, _lastSmartMeterReadFileHash, _smartMeterDown)
                .estimateGas({ from: account });
            const tx = yield RawTransaction_1.sendRawTx(account, yield blockchainProperties.web3.eth.getTransactionCount(account), Math.round(txGas * 1.1), txdata, blockchainProperties, blockchainProperties.consumingAssetLogicInstance._address);
        });
    }
    syncWithBlockchain() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.id != null) {
                const structDataPromises = [];
                structDataPromises.push(this.blockchainProperties.consumingAssetLogicInstance.methods.getAssetGeneral(this.id).call());
                structDataPromises.push(this.blockchainProperties.consumingAssetLogicInstance.methods.getAssetLocation(this.id).call());
                const demandData = yield Promise.all(structDataPromises);
                this.smartMeter = demandData[0]._smartMeter;
                this.owner = demandData[0]._owner;
                this.operationalSince = parseInt(demandData[0]._operationalSince, 10);
                this.capacityWh = parseInt(demandData[0]._capacityWh, 10);
                this.lastSmartMeterReadWh = parseInt(demandData[0]._lastSmartMeterReadWh, 10);
                this.maxCapacitySet = demandData[0]._maxCapacitySet;
                this.active = demandData[0]._active;
                this.lastSmartMeterReadFileHash = demandData[0]._lastSmartMeterReadFileHash;
                this.certificatesUsedForWh = parseInt(demandData[0]._certificatesUsedForWh, 10);
                // Location
                this.country = this.blockchainProperties.web3.utils.hexToUtf8(demandData[1].country);
                this.region = this.blockchainProperties.web3.utils.hexToUtf8(demandData[1].region);
                this.zip = this.blockchainProperties.web3.utils.hexToUtf8(demandData[1].zip);
                this.city = this.blockchainProperties.web3.utils.hexToUtf8(demandData[1].city);
                this.street = this.blockchainProperties.web3.utils.hexToUtf8(demandData[1].street);
                this.houseNumber = this.blockchainProperties.web3.utils.hexToUtf8(demandData[1].houseNumber);
                this.gpsLatitude = this.blockchainProperties.web3.utils.hexToUtf8(demandData[1].gpsLatitude);
                this.gpsLongitude = this.blockchainProperties.web3.utils.hexToUtf8(demandData[1].gpsLongitude);
                this.initialized = true;
            }
            return this;
        });
    }
    getAssetEvents() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.blockchainProperties.consumingAssetLogicInstance.getPastEvents('allEvents', {
                fromBlock: 0,
                toBlock: 'latest',
                topics: [null, this.blockchainProperties.web3.utils.padLeft(this.blockchainProperties.web3.utils.fromDecimal(this.id), 64, '0')]
            }));
        });
    }
    getEventWithFileHash(fileHash) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.blockchainProperties.producingAssetLogicInstance.getPastEvents('allEvents', {
                fromBlock: 0,
                toBlock: 'latest',
                topics: [null, null, fileHash]
            }));
        });
    }
}
exports.ConsumingAsset = ConsumingAsset;
//# sourceMappingURL=ConsumingAsset.js.map