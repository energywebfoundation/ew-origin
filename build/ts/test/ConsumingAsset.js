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
const chai_1 = require("chai");
require("mocha");
const fs = require("fs");
const test_accounts_1 = require("../test-accounts");
const ConsumingAsset_1 = require("../blockchain-facade/ConsumingAsset");
const Web3 = require('web3');
const AssetConsumingLogicTruffleBuild = JSON.parse(fs.readFileSync('build/contracts/AssetConsumingRegistryLogic.json', 'utf-8').toString());
describe('ConsumingAsset', () => {
    let web3;
    let assetAdminAccount;
    let topAdminAccount;
    let blockchainProperties;
    const getInstanceFromTruffleBuild = (truffleBuild, web3) => {
        const address = Object.keys(truffleBuild.networks).length > 0 ? truffleBuild.networks[Object.keys(truffleBuild.networks)[0]].address : null;
        return new web3.eth.Contract(truffleBuild.abi, address);
    };
    const init = () => __awaiter(this, void 0, void 0, function* () {
        web3 = new Web3('http://localhost:8545');
        assetAdminAccount = yield web3.eth.accounts.wallet.add(test_accounts_1.PrivateKeys[2]);
        topAdminAccount = yield web3.eth.accounts.wallet.add(test_accounts_1.PrivateKeys[0]);
        blockchainProperties = {
            web3: web3,
            consumingAssetLogicInstance: yield getInstanceFromTruffleBuild(AssetConsumingLogicTruffleBuild, web3),
            assetAdminAccount: topAdminAccount.address,
            topAdminAccount: topAdminAccount.address
        };
    });
    before(() => __awaiter(this, void 0, void 0, function* () {
        yield init();
    }));
    it('should not have any assets', () => __awaiter(this, void 0, void 0, function* () {
        chai_1.expect(yield ConsumingAsset_1.ConsumingAsset.GET_ASSET_LIST_LENGTH(blockchainProperties)).to.equal(0);
    }));
    let asset;
    it('should create an asset', () => __awaiter(this, void 0, void 0, function* () {
        const assetProps = {
            smartMeter: "0x00f4af465162c05843ea38d203d37f7aad2e2c17",
            owner: "0x3b07f15efb10f29b3fc222fb7e717e9af0cc4243",
            operationalSince: 2342343242,
            capacityWh: 100000,
            active: true,
            country: "Germany",
            region: "Saxony",
            zip: "09648",
            city: "Mittweida",
            street: "Markt",
            houseNumber: "16",
            gpsLatitude: "49.000000",
            gpsLongitude: "11.00000",
            maxCapacitySet: false,
            certificatesUsedForWh: 0
        };
        asset = (yield ConsumingAsset_1.ConsumingAsset.CREATE_ASSET(assetProps, blockchainProperties));
        /*      expect(asset.id).to.equal(0);
              expect(asset.initialized).to.be.true
              expect(asset.smartMeter.toLocaleLowerCase()).to.equal("0x00f4af465162c05843ea38d203d37f7aad2e2c17")
              expect(asset.owner.toLocaleLowerCase()).to.equal("0x3b07f15efb10f29b3fc222fb7e717e9af0cc4243")
              expect(asset.operationalSince).to.equal(2423423422342)
              expect(asset.lastSmartMeterReadWh).to.equal(0)
              expect(asset.active).to.be.true
              expect(asset.lastSmartMeterReadFileHash).to.equal("0x0000000000000000000000000000000000000000000000000000000000000000")
              expect(asset.assetType).to.equal(1)
              expect(asset.capacityWh).to.equal(1000000000)
              expect(asset.certificatesCreatedForWh).to.equal(0)
              expect(asset.lastSmartMeterCO2OffsetRead).to.equal(0)
              expect(asset.cO2UsedForCertificate).to.equal(0)
              expect(asset.complianceRegistry).to.equal(1)
              expect(asset.otherGreenAttributes).to.equal("N.A")
              expect(asset.typeOfPublicSupport).to.equal("N.A")
              expect(asset.country).to.equal("Germany")
              expect(asset.region).to.equal("Saxony")
              expect(asset.zip).to.equal("09648")
              expect(asset.city).to.equal("Mittweida")
              expect(asset.street).to.equal("Markt")
              expect(asset.houseNumber).to.equal("16")
              expect(asset.gpsLatitude).to.equal("49.000000")
              expect(asset.gpsLongitude).to.equal("11.00000")
              */
    }));
    it('should have one asset in asset list', () => __awaiter(this, void 0, void 0, function* () {
        chai_1.expect(yield ConsumingAsset_1.ConsumingAsset.GET_ASSET_LIST_LENGTH(blockchainProperties)).to.equal(1);
    }));
    it('should return all assets', () => __awaiter(this, void 0, void 0, function* () {
        const allAssets = yield ConsumingAsset_1.ConsumingAsset.GET_ALL_ASSETS(blockchainProperties);
        chai_1.expect(allAssets.length).to.be.equal(1);
        chai_1.expect(allAssets[0]).to.deep.equal(asset);
    }));
    it('should return no assets when using different owner', () => __awaiter(this, void 0, void 0, function* () {
        chai_1.expect((yield ConsumingAsset_1.ConsumingAsset.GET_ALL_ASSET_OWNED_BY("0x71c31ff1faa17b1cb5189fd845e0cca650d215d3", blockchainProperties)).length).to.equal(0);
    }));
    it('should return right assets when using correct owner', () => __awaiter(this, void 0, void 0, function* () {
        const allAssets = yield ConsumingAsset_1.ConsumingAsset.GET_ALL_ASSET_OWNED_BY("0x3b07f15efb10f29b3fc222fb7e717e9af0cc4243", blockchainProperties);
        chai_1.expect(allAssets.length).to.be.equal(1);
        chai_1.expect(allAssets[0]).to.deep.equal(asset);
    }));
});
//# sourceMappingURL=ConsumingAsset.js.map