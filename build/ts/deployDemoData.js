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
const Deployment_1 = require("./Deployment");
const User_1 = require("./blockchain-facade/User");
const ProducingAsset_1 = require("./blockchain-facade/ProducingAsset");
const ConsumingAsset_1 = require("./blockchain-facade/ConsumingAsset");
const Demand_1 = require("./blockchain-facade/Demand");
const configFile = JSON.parse(fs.readFileSync('config/ewf-config.json', 'utf-8').toString());
const CertificateRegistryTruffleBuild = JSON.parse(fs.readFileSync('build/contracts/CertificateLogic.json', 'utf-8').toString());
const CertificateDBTruffleBuild = JSON.parse(fs.readFileSync('build/contracts/CertificateDB.json', 'utf-8').toString());
const CoOTruffleBuild = JSON.parse(fs.readFileSync('build/contracts/CoO.json', 'utf-8').toString());
const AssetConsumingRegistryDbTruffleBuild = JSON.parse(fs.readFileSync('build/contracts/AssetConsumingRegistryDb.json', 'utf-8').toString());
const AssetConsumingRegistryLogicTruffleBuild = JSON.parse(fs.readFileSync('build/contracts/AssetConsumingRegistryLogic.json', 'utf-8').toString());
const AssetProducingRegistryDbTruffleBuild = JSON.parse(fs.readFileSync('build/contracts/AssetProducingRegistryDb.json', 'utf-8').toString());
const AssetProducingRegistryLogicTruffleBuild = JSON.parse(fs.readFileSync('build/contracts/AssetProducingRegistryLogic.json', 'utf-8').toString());
const DemandDbTruffleBuild = JSON.parse(fs.readFileSync('build/contracts/DemandDb.json', 'utf-8').toString());
const DemandLogicTruffleBuild = JSON.parse(fs.readFileSync('build/contracts/DemandLogic.json', 'utf-8').toString());
const UserdDbTruffleBuild = JSON.parse(fs.readFileSync('build/contracts/UserDb.json', 'utf-8').toString());
const UserLogicTruffleBuild = JSON.parse(fs.readFileSync('build/contracts/UserLogic.json', 'utf-8').toString());
let blockchainProperties;
const Web3 = require('web3');
const web3 = new Web3('http://localhost:8545');
const deployContracts = () => __awaiter(this, void 0, void 0, function* () {
    const CooAddress = yield Deployment_1.deployCoo(configFile.topAdminPrivateKey);
    console.log("Coo deployed: " + CooAddress);
    const assetConsumingLogicAddress = yield Deployment_1.deployContract(CooAddress, AssetConsumingRegistryLogicTruffleBuild, configFile.topAdminPrivateKey);
    console.log('AssetConsumingLogic deployed: ' + assetConsumingLogicAddress);
    const assetConsumingDBAddress = yield Deployment_1.deployContract(assetConsumingLogicAddress, AssetConsumingRegistryDbTruffleBuild, configFile.topAdminPrivateKey);
    console.log('AssetConsumingDB deployed: ' + assetConsumingDBAddress);
    const assetProducingLogicAddress = yield Deployment_1.deployContract(CooAddress, AssetProducingRegistryLogicTruffleBuild, configFile.topAdminPrivateKey);
    console.log('AssetProducingLogic deployed: ' + assetProducingLogicAddress);
    const assetProducingDBAddress = yield Deployment_1.deployContract(assetProducingLogicAddress, AssetProducingRegistryDbTruffleBuild, configFile.topAdminPrivateKey);
    console.log('AssetProducingDB deployed: ' + assetProducingDBAddress);
    const certificateLogicAddress = yield Deployment_1.deployContract(CooAddress, CertificateRegistryTruffleBuild, configFile.topAdminPrivateKey);
    console.log('CertificateLogic deployed: ' + certificateLogicAddress);
    const certificateDBAddress = yield Deployment_1.deployContract(certificateLogicAddress, CertificateDBTruffleBuild, configFile.topAdminPrivateKey);
    console.log('CertificateDB deployed: ' + certificateLogicAddress);
    const demandLogicAddress = yield Deployment_1.deployContract(CooAddress, DemandLogicTruffleBuild, configFile.topAdminPrivateKey);
    console.log('DemandLogic deployed: ' + demandLogicAddress);
    const demandDbAddress = yield Deployment_1.deployContract(demandLogicAddress, DemandDbTruffleBuild, configFile.topAdminPrivateKey);
    console.log('DemandDB deployed: ' + demandDbAddress);
    const userLogicAddress = yield Deployment_1.deployContract(CooAddress, UserLogicTruffleBuild, configFile.topAdminPrivateKey);
    console.log('UserLogic deployed: ' + userLogicAddress);
    const userDbAddress = yield Deployment_1.deployContract(userLogicAddress, UserdDbTruffleBuild, configFile.topAdminPrivateKey);
    console.log('UserDB deployed: ' + userDbAddress);
    console.log('init assetConsuming');
    yield Deployment_1.logicInit(assetConsumingLogicAddress, assetConsumingDBAddress, configFile.topAdminPrivateKey);
    console.log('init assetProducing');
    yield Deployment_1.logicInit(assetProducingLogicAddress, assetProducingDBAddress, configFile.topAdminPrivateKey);
    console.log('init certificate');
    yield Deployment_1.logicInit(certificateLogicAddress, certificateDBAddress, configFile.topAdminPrivateKey);
    console.log('init demand');
    yield Deployment_1.logicInit(demandLogicAddress, demandDbAddress, configFile.topAdminPrivateKey);
    console.log('init userlogic');
    yield Deployment_1.logicInit(userLogicAddress, userDbAddress, configFile.topAdminPrivateKey);
    console.log('init coo');
    yield Deployment_1.initCoo(CooAddress, userLogicAddress, assetProducingLogicAddress, certificateLogicAddress, demandLogicAddress, assetConsumingLogicAddress, configFile.topAdminPrivateKey);
    console.log("");
    return blockchainProperties = {
        web3: web3,
        producingAssetLogicInstance: new web3.eth.Contract(AssetProducingRegistryLogicTruffleBuild.abi, assetProducingLogicAddress),
        consumingAssetLogicInstance: new web3.eth.Contract(AssetConsumingRegistryLogicTruffleBuild.abi, assetConsumingLogicAddress),
        userLogicInstance: new web3.eth.Contract(UserLogicTruffleBuild.abi, userLogicAddress),
        demandLogicInstance: new web3.eth.Contract(DemandLogicTruffleBuild.abi, demandLogicAddress),
        certificateLogicInstance: new web3.eth.Contract(CertificateRegistryTruffleBuild.abi, certificateLogicAddress),
        topAdminAccount: configFile.topAdminAddress,
        privateKey: configFile.topAdminPrivateKey,
        userAdmin: configFile.topAdminAddress,
        assetAdminAccount: configFile.topAdminAddress
    };
});
const onboardUsers = (blockchainProperties) => __awaiter(this, void 0, void 0, function* () {
    for (const accountdata in configFile.accounts) {
        const userProps = {
            firstName: configFile.accounts[accountdata].firstName,
            surname: configFile.accounts[accountdata].surname,
            organization: configFile.accounts[accountdata].organization,
            street: configFile.accounts[accountdata].street,
            number: configFile.accounts[accountdata].number,
            zip: configFile.accounts[accountdata].zip,
            city: configFile.accounts[accountdata].city,
            country: configFile.accounts[accountdata].country,
            state: configFile.accounts[accountdata].state,
            accountAddress: configFile.accounts[accountdata].address,
            roles: configFile.accounts[accountdata].rights
        };
        yield User_1.User.CREATE_USER_RAW(userProps, blockchainProperties);
        console.log(configFile.accounts[accountdata].firstName + " " + configFile.accounts[accountdata].surname + " ( " + configFile.accounts[accountdata].organization + " )" + " onboarded");
    }
    console.log("");
});
const onboardProducingAssets = (blockchainProperties) => __awaiter(this, void 0, void 0, function* () {
    for (const producingAssets in configFile.producingAssets) {
        let assetTypeConfig;
        switch (configFile.producingAssets[producingAssets].assetType) {
            case "Wind":
                assetTypeConfig = ProducingAsset_1.AssetType.Wind;
                break;
            case "Solar":
                assetTypeConfig = ProducingAsset_1.AssetType.Solar;
                break;
            case "RunRiverHydro":
                assetTypeConfig = ProducingAsset_1.AssetType.RunRiverHydro;
                break;
            case "BiomassGas": assetTypeConfig = ProducingAsset_1.AssetType.BiomassGas;
        }
        let assetCompliance;
        switch (configFile.producingAssets[producingAssets].complianceRegistry) {
            case "IREC":
                assetCompliance = ProducingAsset_1.Compliance.IREC;
                break;
            case "EEC":
                assetCompliance = ProducingAsset_1.Compliance.EEC;
                break;
            case "TIGR":
                assetCompliance = ProducingAsset_1.Compliance.TIGR;
                break;
            default:
                assetCompliance = ProducingAsset_1.Compliance.none;
                break;
        }
        const assetProps = {
            smartMeter: configFile.producingAssets[producingAssets].smartMeter,
            owner: configFile.producingAssets[producingAssets].owner,
            operationalSince: configFile.producingAssets[producingAssets].operationalSince,
            capacityWh: configFile.producingAssets[producingAssets].capacityWh,
            lastSmartMeterReadWh: configFile.producingAssets[producingAssets].lastSmartMeterReadWh,
            active: configFile.producingAssets[producingAssets].active,
            lastSmartMeterReadFileHash: configFile.producingAssets[producingAssets].lastSmartMeterReadFileHash,
            country: configFile.producingAssets[producingAssets].country,
            region: configFile.producingAssets[producingAssets].region,
            zip: configFile.producingAssets[producingAssets].zip,
            city: configFile.producingAssets[producingAssets].city,
            street: configFile.producingAssets[producingAssets].street,
            houseNumber: configFile.producingAssets[producingAssets].houseNumber,
            gpsLatitude: configFile.producingAssets[producingAssets].gpsLatitude,
            gpsLongitude: configFile.producingAssets[producingAssets].gpsLongitude,
            assetType: assetTypeConfig,
            certificatesCreatedForWh: configFile.producingAssets[producingAssets].certificatesCreatedForWh,
            lastSmartMeterCO2OffsetRead: configFile.producingAssets[producingAssets].lastSmartMeterCO2OffsetRead,
            cO2UsedForCertificate: configFile.producingAssets[producingAssets].cO2UsedForCertificate,
            complianceRegistry: assetCompliance,
            otherGreenAttributes: configFile.producingAssets[producingAssets].otherGreenAttributes,
            typeOfPublicSupport: configFile.producingAssets[producingAssets].typeOfPublicSupport
        };
        const onboardedAsset = yield ProducingAsset_1.ProducingAsset.CREATE_ASSET_RAW(assetProps, blockchainProperties);
        console.log("Producingasset " + onboardedAsset.id + " onboarded");
    }
    console.log("");
});
const onboardConsumingAssets = (blockchainProperties) => __awaiter(this, void 0, void 0, function* () {
    for (const consumingAssets in configFile.consumingAssets) {
        const assetProps = {
            smartMeter: configFile.consumingAssets[consumingAssets].smartMeter,
            owner: configFile.consumingAssets[consumingAssets].owner,
            operationalSince: configFile.consumingAssets[consumingAssets].operationalSince,
            capacityWh: configFile.consumingAssets[consumingAssets].capacityWh,
            lastSmartMeterReadWh: configFile.consumingAssets[consumingAssets].lastSmartMeterReadWh,
            active: configFile.consumingAssets[consumingAssets].active,
            lastSmartMeterReadFileHash: configFile.consumingAssets[consumingAssets].lastSmartMeterReadFileHash,
            country: configFile.consumingAssets[consumingAssets].country,
            region: configFile.consumingAssets[consumingAssets].region,
            zip: configFile.consumingAssets[consumingAssets].zip,
            city: configFile.consumingAssets[consumingAssets].city,
            street: configFile.consumingAssets[consumingAssets].street,
            houseNumber: configFile.consumingAssets[consumingAssets].houseNumber,
            gpsLatitude: configFile.consumingAssets[consumingAssets].gpsLatitude,
            gpsLongitude: configFile.consumingAssets[consumingAssets].gpsLongitude,
            maxCapacitySet: configFile.consumingAssets[consumingAssets].maxCapacitySet,
            certificatesUsedForWh: configFile.consumingAssets[consumingAssets].certificatesUsedForWh
        };
        const onboardedAsset = yield ConsumingAsset_1.ConsumingAsset.CREATE_ASSET_RAW(assetProps, blockchainProperties);
        console.log("Consumingasset " + onboardedAsset.id + " onboarded");
    }
    console.log("");
});
const main = () => __awaiter(this, void 0, void 0, function* () {
    //  console.log(configFile)
    const blockchainProperties = yield deployContracts();
    yield onboardUsers(blockchainProperties);
    yield onboardProducingAssets(blockchainProperties);
    yield onboardConsumingAssets(blockchainProperties);
    yield onboardDemand(blockchainProperties, configFile.topAdminPrivateKey);
    yield meterreadings(blockchainProperties);
});
const onboardDemand = (blockchainProperties, privateKey) => __awaiter(this, void 0, void 0, function* () {
    for (const demandId in configFile.demands) {
        let timeFrameDemand;
        switch (configFile.demands[demandId].timeFrame) {
            case "yearly":
                timeFrameDemand = Demand_1.TimeFrame.yearly;
                break;
            case "monthly":
                timeFrameDemand = Demand_1.TimeFrame.monthly;
                break;
            default:
                timeFrameDemand = Demand_1.TimeFrame.daily;
                break;
        }
        let currencyDemand;
        switch (configFile.demands[demandId].currency) {
            case "Euro":
                currencyDemand = Demand_1.Currency.Euro;
                break;
            case "USD":
                currencyDemand = Demand_1.Currency.USD;
                break;
            case "SingaporeDollar":
                currencyDemand = Demand_1.Currency.SingaporeDollar;
                break;
            default:
                currencyDemand = Demand_1.Currency.Ether;
                break;
        }
        let assetTypeConfig;
        switch (configFile.demands[demandId].assettype) {
            case "Wind":
                assetTypeConfig = ProducingAsset_1.AssetType.Wind;
                break;
            case "Solar":
                assetTypeConfig = ProducingAsset_1.AssetType.Solar;
                break;
            case "RunRiverHydro":
                assetTypeConfig = ProducingAsset_1.AssetType.RunRiverHydro;
                break;
            case "BiomassGas": assetTypeConfig = ProducingAsset_1.AssetType.BiomassGas;
        }
        let assetCompliance;
        switch (configFile.demands[demandId].complianceRegistry) {
            case "IREC":
                assetCompliance = ProducingAsset_1.Compliance.IREC;
                break;
            case "EEC":
                assetCompliance = ProducingAsset_1.Compliance.EEC;
                break;
            case "TIGR":
                assetCompliance = ProducingAsset_1.Compliance.TIGR;
                break;
            default:
                assetCompliance = ProducingAsset_1.Compliance.none;
                break;
        }
        const demandProps = {
            enabledProperties: configFile.demands[demandId].enabledProperties,
            originator: configFile.demands[demandId].originator,
            buyer: configFile.demands[demandId].buyer,
            startTime: configFile.demands[demandId].startTime,
            endTime: configFile.demands[demandId].endTime,
            timeframe: timeFrameDemand,
            pricePerCertifiedWh: configFile.demands[demandId].pricePerCertifiedWh,
            currency: currencyDemand,
            productingAsset: configFile.demands[demandId].producingAsset,
            consumingAsset: configFile.demands[demandId].consumingAsset,
            locationCountry: configFile.demands[demandId].locationCountry,
            locationRegion: configFile.demands[demandId].locationRegion,
            assettype: assetTypeConfig,
            minCO2Offset: configFile.demands[demandId].minCO2Offset,
            otherGreenAttributes: configFile.demands[demandId].otherGreenAttributes,
            typeOfPublicSupport: configFile.demands[demandId].typeOfPublicSupport,
            targetWhPerPeriod: configFile.demands[demandId].targetWhPerPeriod,
            matcher: configFile.demands[demandId].matcher,
            registryCompliance: assetCompliance
        };
        const onboardedDemand = yield Demand_1.Demand.CREATE_DEMAND_RAW(demandProps, blockchainProperties, web3.eth.accounts.privateKeyToAccount('0x' + privateKey).address);
        console.log("Demand #" + onboardedDemand.id + " onboarded");
    }
    console.log("");
});
const meterreadings = (blockchainProperties) => __awaiter(this, void 0, void 0, function* () {
    for (const meterreading in configFile.energy) {
        const newBlockchainProps = Object.assign({}, blockchainProperties);
        newBlockchainProps.privateKey = configFile.energy[meterreading].smartMeterPK;
        const producingAsset = yield (new ProducingAsset_1.ProducingAsset(configFile.energy[meterreading].assetId, newBlockchainProps)).syncWithBlockchain();
        console.log("before: " + producingAsset.lastSmartMeterReadWh);
        yield producingAsset.saveSmartMeterRead(configFile.energy[meterreading].meterreading, configFile.energy[meterreading].filehash, configFile.energy[meterreading].co2Offset, newBlockchainProps);
        yield producingAsset.syncWithBlockchain();
        console.log("after: " + producingAsset.lastSmartMeterReadWh);
    }
});
main();
//# sourceMappingURL=deployDemoData.js.map