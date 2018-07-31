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
const BlockchainDataModelEntity_1 = require("./BlockchainDataModelEntity");
const RawTransaction_1 = require("./RawTransaction");
var TimeFrame;
(function (TimeFrame) {
    TimeFrame[TimeFrame["yearly"] = 0] = "yearly";
    TimeFrame[TimeFrame["monthly"] = 1] = "monthly";
    TimeFrame[TimeFrame["daily"] = 2] = "daily";
    TimeFrame[TimeFrame["hourly"] = 3] = "hourly";
})(TimeFrame = exports.TimeFrame || (exports.TimeFrame = {}));
var Currency;
(function (Currency) {
    Currency[Currency["Euro"] = 0] = "Euro";
    Currency[Currency["USD"] = 1] = "USD";
    Currency[Currency["SingaporeDollar"] = 2] = "SingaporeDollar";
    Currency[Currency["Ether"] = 3] = "Ether";
})(Currency = exports.Currency || (exports.Currency = {}));
var DemandProperties;
(function (DemandProperties) {
    DemandProperties[DemandProperties["Originator"] = 0] = "Originator";
    DemandProperties[DemandProperties["AssetType"] = 1] = "AssetType";
    DemandProperties[DemandProperties["Compliance"] = 2] = "Compliance";
    DemandProperties[DemandProperties["Country"] = 3] = "Country";
    DemandProperties[DemandProperties["Region"] = 4] = "Region";
    DemandProperties[DemandProperties["MinCO2"] = 5] = "MinCO2";
    DemandProperties[DemandProperties["Producing"] = 6] = "Producing";
    DemandProperties[DemandProperties["Consuming"] = 7] = "Consuming";
})(DemandProperties = exports.DemandProperties || (exports.DemandProperties = {}));
class Demand extends BlockchainDataModelEntity_1.BlockchainDataModelEntity {
    constructor(id, blockchainProperties) {
        super(id, blockchainProperties);
        this.initialized = false;
    }
    static CREATE_DEMAND(demandProperties, blockchainProperties, account) {
        return __awaiter(this, void 0, void 0, function* () {
            const gasCreate = yield blockchainProperties.demandLogicInstance.methods
                .createDemand(demandProperties.enabledProperties)
                .estimateGas({ from: account });
            const txCreate = yield blockchainProperties.demandLogicInstance.methods
                .createDemand(demandProperties.enabledProperties)
                .send({ from: account, gas: Math.round(gasCreate * 1.1), gasPrice: 0 });
            const demandId = parseInt(txCreate.events.createdEmptyDemand.returnValues._demandId, 10);
            const initGeneralParams = [
                demandId,
                demandProperties.originator,
                demandProperties.buyer,
                demandProperties.startTime,
                demandProperties.endTime,
                demandProperties.timeframe,
                demandProperties.pricePerCertifiedWh,
                demandProperties.currency,
                demandProperties.productingAsset,
                demandProperties.consumingAsset
            ];
            const gasInitGeneral = yield blockchainProperties.demandLogicInstance.methods
                .initGeneralAndCoupling(...initGeneralParams)
                .estimateGas({ from: account });
            const txInitGeneral = yield blockchainProperties.demandLogicInstance.methods
                .initGeneralAndCoupling(...initGeneralParams)
                .send({ from: account, gas: Math.round(gasInitGeneral * 1.1), gasPrice: 0 });
            const initMatchPropertiesParams = [
                demandId,
                demandProperties.targetWhPerPeriod,
                0,
                demandProperties.matcher
            ];
            const gasInitMatcher = yield blockchainProperties.demandLogicInstance.methods
                .initMatchProperties(...initMatchPropertiesParams)
                .estimateGas({ from: account });
            const txInitMatcher = yield blockchainProperties.demandLogicInstance.methods
                .initMatchProperties(...initMatchPropertiesParams)
                .send({ from: account, gas: Math.round(gasInitMatcher * 1.1), gasPrice: 0 });
            const initPriceDrivingPropertiesParams = [
                demandId,
                blockchainProperties.web3.utils.fromUtf8(demandProperties.locationCountry),
                blockchainProperties.web3.utils.fromUtf8(demandProperties.locationRegion),
                demandProperties.assettype,
                demandProperties.minCO2Offset,
                demandProperties.registryCompliance,
                blockchainProperties.web3.utils.fromUtf8(demandProperties.otherGreenAttributes),
                blockchainProperties.web3.utils.fromUtf8(demandProperties.typeOfPublicSupport)
            ];
            const gasInitPriceDriving = yield blockchainProperties.demandLogicInstance.methods
                .initPriceDriving(...initPriceDrivingPropertiesParams)
                .estimateGas({ from: account });
            const txInitPriceDriving = yield blockchainProperties.demandLogicInstance.methods
                .initPriceDriving(...initPriceDrivingPropertiesParams)
                .send({ from: account, gas: Math.round(gasInitPriceDriving * 1.1), gasPrice: 0 });
            return (new Demand(demandId, blockchainProperties)).syncWithBlockchain();
        });
    }
    static CREATE_DEMAND_RAW(demandProperties, blockchainProperties, account) {
        return __awaiter(this, void 0, void 0, function* () {
            const gasCreate = yield blockchainProperties.demandLogicInstance.methods
                .createDemand(demandProperties.enabledProperties)
                .estimateGas({ from: account });
            const txCreate = yield blockchainProperties.demandLogicInstance.methods
                .createDemand(demandProperties.enabledProperties)
                .encodeABI();
            let tx = yield RawTransaction_1.sendRawTx(account, yield blockchainProperties.web3.eth.getTransactionCount(account), Math.round(gasCreate * 1.1), txCreate, blockchainProperties, blockchainProperties.demandLogicInstance._address);
            const demandId = Number(tx.logs[0].topics[1]);
            const initGeneralParams = [
                demandId,
                demandProperties.originator,
                demandProperties.buyer,
                demandProperties.startTime,
                demandProperties.endTime,
                demandProperties.timeframe,
                demandProperties.pricePerCertifiedWh,
                demandProperties.currency,
                demandProperties.productingAsset,
                demandProperties.consumingAsset
            ];
            const gasInitGeneral = yield blockchainProperties.demandLogicInstance.methods
                .initGeneralAndCoupling(...initGeneralParams)
                .estimateGas({ from: account });
            const txInitGeneral = yield blockchainProperties.demandLogicInstance.methods
                .initGeneralAndCoupling(...initGeneralParams)
                .encodeABI();
            const initMatchPropertiesParams = [
                demandId,
                demandProperties.targetWhPerPeriod,
                0,
                demandProperties.matcher
            ];
            const gasInitMatcher = yield blockchainProperties.demandLogicInstance.methods
                .initMatchProperties(...initMatchPropertiesParams)
                .estimateGas({ from: account });
            const txInitMatcher = yield blockchainProperties.demandLogicInstance.methods
                .initMatchProperties(...initMatchPropertiesParams)
                .encodeABI();
            const initPriceDrivingPropertiesParams = [
                demandId,
                blockchainProperties.web3.utils.fromUtf8(demandProperties.locationCountry),
                blockchainProperties.web3.utils.fromUtf8(demandProperties.locationRegion),
                demandProperties.assettype,
                demandProperties.minCO2Offset,
                demandProperties.registryCompliance,
                blockchainProperties.web3.utils.fromUtf8(demandProperties.otherGreenAttributes),
                blockchainProperties.web3.utils.fromUtf8(demandProperties.typeOfPublicSupport)
            ];
            const gasInitPriceDriving = yield blockchainProperties.demandLogicInstance.methods
                .initPriceDriving(...initPriceDrivingPropertiesParams)
                .estimateGas({ from: account });
            const txInitPriceDriving = yield blockchainProperties.demandLogicInstance.methods
                .initPriceDriving(...initPriceDrivingPropertiesParams)
                .encodeABI();
            const txCount = yield blockchainProperties.web3.eth.getTransactionCount(account);
            RawTransaction_1.sendRawTx(account, txCount, Math.round(gasInitMatcher * 1.1), txInitMatcher, blockchainProperties, blockchainProperties.demandLogicInstance._address);
            RawTransaction_1.sendRawTx(account, txCount + 1, Math.round(gasInitGeneral * 1.1), txInitGeneral, blockchainProperties, blockchainProperties.demandLogicInstance._address);
            yield RawTransaction_1.sendRawTx(account, txCount + 2, Math.round(gasInitPriceDriving * 1.1), txInitPriceDriving, blockchainProperties, blockchainProperties.demandLogicInstance._address);
            return (new Demand(demandId, blockchainProperties)).syncWithBlockchain();
        });
    }
    static GET_ALL_DEMAND_LIST_LENGTH(blockchainProperties) {
        return __awaiter(this, void 0, void 0, function* () {
            return parseInt(yield blockchainProperties.demandLogicInstance.methods.getAllDemandListLength().call(), 10);
        });
    }
    static GET_ACTIVE_DEMAND_LIST_LENGTH(blockchainProperties) {
        return __awaiter(this, void 0, void 0, function* () {
            return parseInt(yield blockchainProperties.demandLogicInstance.methods.getActiveDemandListLength().call(), 10);
        });
    }
    static GET_ACTIVE_DEMAND_ID_AT(index, blockchainProperties) {
        return __awaiter(this, void 0, void 0, function* () {
            return blockchainProperties.demandLogicInstance.methods.getActiveDemandIdAt(index).call();
        });
    }
    static GET_ALL_ACTIVE_DEMANDS(blockchainProperties) {
        return __awaiter(this, void 0, void 0, function* () {
            const demandIdPromises = Array(yield Demand.GET_ACTIVE_DEMAND_LIST_LENGTH(blockchainProperties))
                .fill(null)
                .map((item, index) => Demand.GET_ACTIVE_DEMAND_ID_AT(index, blockchainProperties));
            const demandIds = yield Promise.all(demandIdPromises);
            const demandPromises = demandIds.map((id) => ((new Demand(id, blockchainProperties)).syncWithBlockchain()));
            return Promise.all(demandPromises);
        });
    }
    getBitFromDemandMask(bitPosition) {
        return ((Math.pow(2, bitPosition)) & this.demandMask) !== 0;
    }
    getCurrentPeriod() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.blockchainProperties.demandLogicInstance.methods.getCurrentPeriod(this.id).call();
        });
    }
    matchDemand(wh, assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            //console.log('! ' + this.id + ' ' + wh + ' ' + assetId + ' from: ' + this.blockchainProperties.matcherAccount)
            const gas = yield this.blockchainProperties.demandLogicInstance.methods
                .matchDemand(this.id, wh, assetId)
                .estimateGas({ from: this.blockchainProperties.matcherAccount });
            const tx = yield this.blockchainProperties.demandLogicInstance.methods
                .matchDemand(this.id, wh, assetId)
                .send({ from: this.blockchainProperties.matcherAccount, gas: Math.round(gas * 1.1) });
            return tx;
        });
    }
    matchCertificate(certificateId) {
        return __awaiter(this, void 0, void 0, function* () {
            const gas = yield this.blockchainProperties.demandLogicInstance.methods
                .matchCertificate(this.id, certificateId)
                .estimateGas({ from: this.blockchainProperties.matcherAccount });
            const tx = yield this.blockchainProperties.demandLogicInstance.methods
                .matchCertificate(this.id, certificateId)
                .send({ from: this.blockchainProperties.matcherAccount, gas: Math.round(gas * 1.1) });
            return tx;
        });
    }
    syncWithBlockchain() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.id != null) {
                const structDataPromises = [];
                structDataPromises.push(this.blockchainProperties.demandLogicInstance.methods.getDemandGeneral(this.id).call());
                structDataPromises.push(this.blockchainProperties.demandLogicInstance.methods.getDemandPriceDriving(this.id).call());
                structDataPromises.push(this.blockchainProperties.demandLogicInstance.methods.getDemandMatcherProperties(this.id).call());
                structDataPromises.push(this.blockchainProperties.demandLogicInstance.methods.getDemandCoupling(this.id).call());
                const demandData = yield Promise.all(structDataPromises);
                this.targetWhPerPeriod = parseInt(demandData[2].targetWhPerPeriod, 10);
                this.currentWhPerPeriod = parseInt(demandData[2].currentWhPerPeriod, 10);
                this.certInCurrentPeriod = parseInt(demandData[2].certInCurrentPeriod, 10);
                this.productionLastSetInPeriod = parseInt(demandData[2].productionLastSetInPeriod, 10);
                this.matcher = demandData[2].matcher;
                //PriceDriving
                this.locationCountry = this.blockchainProperties.web3.utils.hexToUtf8(demandData[1].locationCountry);
                this.locationRegion = this.blockchainProperties.web3.utils.hexToUtf8(demandData[1].locationRegion);
                this.assettype = parseInt(demandData[1].assettype, 10);
                this.minCO2Offset = parseInt(demandData[1].minCO2Offset, 10);
                this.registryCompliance = parseInt(demandData[1].registryCompliance, 10);
                //GeneralInfo
                this.originator = demandData[0].originator;
                this.buyer = demandData[0].buyer;
                this.agreementDate = parseInt(demandData[0].agreementDate, 10);
                this.startTime = parseInt(demandData[0].startTime, 10);
                this.endTime = parseInt(demandData[0].endTime, 10);
                this.currency = parseInt(demandData[0].currency, 10);
                this.demandMask = parseInt(demandData[0].demandMask, 10);
                this.timeframe = parseInt(demandData[0].timeframe, 10);
                //Demand and Coupling
                this.productingAsset = parseInt(demandData[3].producingAssets, 10);
                this.consumingAsset = parseInt(demandData[3].consumingAssets, 10);
                this.initialized = true;
            }
            return this;
        });
    }
    checkDemandCoupling(demandId, prodAssetId, wCreated) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(yield this.blockchainProperties.demandLogicInstance.methods.checkDemandCoupling(demandId, prodAssetId, wCreated).call());
        });
    }
    checkDemandGeneral(demandId, prodAssetId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(yield this.blockchainProperties.demandLogicInstance.methods.asynccheckDemandGeneral(demandId, prodAssetId).call());
        });
    }
    checkMatcher(demandId, wCreated, matcher) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(yield this.blockchainProperties.demandLogicInstance.methods.checkMatcher(demandId, wCreated).call({ from: matcher }));
        });
    }
    checkPriceDriving(demandId, prodAssetId, wCreated, co2Saved) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(yield this.blockchainProperties.demandLogicInstance.methods.checkPriceDriving(demandId, prodAssetId, wCreated, co2Saved).call());
        });
    }
    getDemandEvents() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.blockchainProperties.demandLogicInstance.getPastEvents('allEvents', {
                fromBlock: 0,
                toBlock: 'latest',
                topics: [null, this.blockchainProperties.web3.utils.padLeft(this.blockchainProperties.web3.utils.fromDecimal(this.id), 64, '0')]
            }));
        });
    }
}
exports.Demand = Demand;
//# sourceMappingURL=Demand.js.map