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
const Asset_1 = require("./blockchain-facade/Asset");
const ProducingAsset_1 = require("./blockchain-facade/ProducingAsset");
const ConsumingAsset_1 = require("./blockchain-facade/ConsumingAsset");
const User_1 = require("./blockchain-facade/User");
const Demand_1 = require("./blockchain-facade/Demand");
const fs = require("fs");
const parse = require('csv-parse');
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
let onboardingDone;
var parseUser = parse({ from: 2, delimiter: ';' }, function (err, allData) {
    return __awaiter(this, void 0, void 0, function* () { });
});
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
        userAdmin: "0xd173313a51f8fc37bcf67569b463abd89d81844f",
        privateKey: "d9066ff9f753a1898709b568119055660a77d9aae4d7a4ad677b8fb3d2a571e5"
    };
});
const parseUserCSV = () => __awaiter(this, void 0, void 0, function* () {
    return new Promise(resolve => {
        fs.createReadStream(process.cwd() + '/csv/userData.csv')
            .pipe(parse({ from: 2, delimiter: ';' }, function (err, allData) { }))
            .on('data', (data) => __awaiter(this, void 0, void 0, function* () {
            const userProps = {
                firstName: data[0],
                surname: data[1],
                organization: data[2],
                accountAddress: data[3],
                country: data[4],
                state: data[5],
                zip: data[6],
                city: data[7],
                street: data[8],
                number: data[9],
                roles: Number(data[10])
            };
            userArray.push(userProps);
        })).on('finish', function () {
            resolve();
        });
    });
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
    yield init();
    yield parseUserCSV();
    for (let i = 0; i < userArray.length; i++) {
        yield User_1.User.CREATE_USER_RAW(userArray[i], blockchainProperties);
        console.log(userArray[i].firstName + ' ' + userArray[i].surname + ' (' + userArray[i].organization + ') onboarded');
    }
    const assetProps_Engie1 = {
        smartMeter: "0x0074AD67550a8B0210EeE3E0CA44f406bEab678c",
        owner: "0x0072B6143cbFA0EEDfd814c1577465789e7f732d",
        operationalSince: 1388534400,
        capacityWh: 6000000,
        active: true,
        lastSmartMeterReadFileHash: "",
        country: "Belgium",
        region: "Wallonia",
        zip: "7911",
        city: "Frasnes-lez-Anvains",
        street: "Chemin de Communes",
        houseNumber: "0",
        gpsLatitude: "50.654188",
        gpsLongitude: "3.65156",
        assetType: Asset_1.AssetType.Wind,
        certificatesCreatedForWh: 0,
        lastSmartMeterCO2OffsetRead: 0,
        cO2UsedForCertificate: 0,
        complianceRegistry: Asset_1.Compliance.none,
        otherGreenAttributes: "N.A",
        typeOfPublicSupport: "N.A"
    };
    const assetProps_Engie2 = {
        smartMeter: "0x0030653eFE3961E2D090986E85bB52BF7b0FCcB2",
        owner: "0x0072B6143cbFA0EEDfd814c1577465789e7f732d",
        operationalSince: 891388800,
        capacityWh: 32600000,
        active: true,
        lastSmartMeterReadFileHash: "",
        country: "France",
        region: "Occitanie",
        zip: "65170",
        city: "Aragnouet",
        street: "L'usine",
        houseNumber: "0",
        gpsLatitude: "42.79155",
        gpsLongitude: "0.261505",
        assetType: Asset_1.AssetType.RunRiverHydro,
        certificatesCreatedForWh: 0,
        lastSmartMeterCO2OffsetRead: 0,
        cO2UsedForCertificate: 0,
        complianceRegistry: Asset_1.Compliance.none,
        otherGreenAttributes: "N.A",
        typeOfPublicSupport: "N.A"
    };
    const assetProps_Engie3 = {
        smartMeter: "0x00C4D3aaB56dC8Be0dFE3AD7B1d418210172C578",
        owner: "0x0072B6143cbFA0EEDfd814c1577465789e7f732d",
        operationalSince: 1520985600,
        capacityWh: 5000000,
        active: true,
        lastSmartMeterReadFileHash: "",
        country: "Netherlands",
        region: "Friesland",
        zip: "9251",
        city: "Burgum",
        street: "Lauermanstraat",
        houseNumber: "16E",
        gpsLatitude: "53.195898",
        gpsLongitude: "5.994979",
        assetType: Asset_1.AssetType.Solar,
        certificatesCreatedForWh: 0,
        lastSmartMeterCO2OffsetRead: 0,
        cO2UsedForCertificate: 0,
        complianceRegistry: Asset_1.Compliance.none,
        otherGreenAttributes: "N.A",
        typeOfPublicSupport: "N.A"
    };
    const assetProps_Engie4 = {
        smartMeter: "0x007d9539a2EeC14e5e75F2A0F030dE1BE1aCf0D2",
        owner: "0x0072B6143cbFA0EEDfd814c1577465789e7f732d",
        operationalSince: 0,
        capacityWh: 146000000,
        active: true,
        lastSmartMeterReadFileHash: "",
        country: "France",
        region: "Nouvelle-Aquitaine",
        zip: "19160",
        city: "	Liginiac",
        street: "Barrage de Mareges",
        houseNumber: "0",
        gpsLatitude: "45.391704",
        gpsLongitude: "2.364210",
        assetType: Asset_1.AssetType.RunRiverHydro,
        certificatesCreatedForWh: 0,
        lastSmartMeterCO2OffsetRead: 0,
        cO2UsedForCertificate: 0,
        complianceRegistry: Asset_1.Compliance.none,
        otherGreenAttributes: "N.A",
        typeOfPublicSupport: "N.A"
    };
    const assetProps_Kathrin = {
        smartMeter: "0x00cF3B87B5CFfe8E5149280b260B77851853Bc3C",
        owner: "0x00aA8fddb9bD787eA5a7Af83A5A73eABDb2B8032",
        operationalSince: 1396310400,
        capacityWh: 600,
        active: true,
        lastSmartMeterReadFileHash: "",
        country: "Germany",
        region: "Hessen",
        zip: "35037",
        city: "Lahntahl",
        street: "Biedenkopfer Strasse",
        houseNumber: "5",
        gpsLatitude: "50.872476",
        gpsLongitude: "8.771062",
        assetType: Asset_1.AssetType.Solar,
        certificatesCreatedForWh: 0,
        lastSmartMeterCO2OffsetRead: 0,
        cO2UsedForCertificate: 0,
        complianceRegistry: Asset_1.Compliance.none,
        otherGreenAttributes: "N.A",
        typeOfPublicSupport: "N.A"
    };
    const assetProps_Steffen = {
        smartMeter: "0x00263b8c3F075aeBfB5ba56dea044C764Edc02ee",
        owner: "0x3f8f4a9e1c14f4cd21b2de5b48bce165f1b0d52e",
        operationalSince: 1281052800,
        capacityWh: 2750,
        active: true,
        lastSmartMeterReadFileHash: "",
        country: "Germany",
        region: "Saxony",
        zip: "09648",
        city: "Mittweida",
        street: "Chemnitzer Strasse",
        houseNumber: "16e",
        gpsLatitude: "50.972835",
        gpsLongitude: "12.981946",
        assetType: Asset_1.AssetType.Solar,
        certificatesCreatedForWh: 0,
        lastSmartMeterCO2OffsetRead: 0,
        cO2UsedForCertificate: 0,
        complianceRegistry: Asset_1.Compliance.none,
        otherGreenAttributes: "N.A",
        typeOfPublicSupport: "N.A"
    };
    const assetProps_TWL1 = {
        smartMeter: "0x00d631c01eE47e256ffec4774FCf5818d8316D5F",
        owner: "0xa0feefe7e0c827c62730ddf3ed0de56660663079",
        operationalSince: 0,
        capacityWh: 400000,
        active: true,
        lastSmartMeterReadFileHash: "",
        country: "Germany",
        region: "European Union",
        zip: "67063",
        city: "Ludwigshafen am Rhein",
        street: "Industriestrasse ",
        houseNumber: "3",
        gpsLatitude: "49.486250",
        gpsLongitude: "8.421639",
        assetType: Asset_1.AssetType.Solar,
        certificatesCreatedForWh: 0,
        lastSmartMeterCO2OffsetRead: 0,
        cO2UsedForCertificate: 0,
        complianceRegistry: Asset_1.Compliance.none,
        otherGreenAttributes: "N.A",
        typeOfPublicSupport: "N.A"
    };
    const assetProps_TWL2 = {
        smartMeter: "0x00FE9Cc1FeC1B778623b19759293d828c333e4C0",
        owner: "0xa0feefe7e0c827c62730ddf3ed0de56660663079",
        operationalSince: 0,
        capacityWh: 400000,
        active: true,
        lastSmartMeterReadFileHash: "",
        country: "Germany",
        region: "European Union",
        zip: "67063",
        city: "Ludwigshafen am Rhein",
        street: "Industriestrasse ",
        houseNumber: "3",
        gpsLatitude: "49.48625",
        gpsLongitude: "8.42164",
        assetType: Asset_1.AssetType.Solar,
        certificatesCreatedForWh: 0,
        lastSmartMeterCO2OffsetRead: 0,
        cO2UsedForCertificate: 0,
        complianceRegistry: Asset_1.Compliance.none,
        otherGreenAttributes: "N.A",
        typeOfPublicSupport: "N.A"
    };
    const assetProps_TWL3 = {
        smartMeter: "0x00F9f869Dcf9169919852057b5D7e2aC5f6fB782",
        owner: "0xa0feefe7e0c827c62730ddf3ed0de56660663079",
        operationalSince: 0,
        capacityWh: 100000,
        active: true,
        lastSmartMeterReadFileHash: "",
        country: "Germany",
        region: "European Union",
        zip: "67063",
        city: "Ludwigshafen am Rhein",
        street: "Industriestrasse ",
        houseNumber: "3",
        gpsLatitude: "49.48625",
        gpsLongitude: "8.42164",
        assetType: Asset_1.AssetType.Solar,
        certificatesCreatedForWh: 0,
        lastSmartMeterCO2OffsetRead: 0,
        cO2UsedForCertificate: 0,
        complianceRegistry: Asset_1.Compliance.none,
        otherGreenAttributes: "N.A",
        typeOfPublicSupport: "N.A"
    };
    const assetProps_TWL4 = {
        smartMeter: "0x002EA88149599290C09f764c4038BfbeeE80798A",
        owner: "0xa0feefe7e0c827c62730ddf3ed0de56660663079",
        operationalSince: 0,
        capacityWh: 100000,
        active: true,
        lastSmartMeterReadFileHash: "",
        country: "Germany",
        region: "European Union",
        zip: "67063",
        city: "Ludwigshafen am Rhein",
        street: "Industriestrasse ",
        houseNumber: "3",
        gpsLatitude: "49.46640",
        gpsLongitude: "8.45310",
        assetType: Asset_1.AssetType.Solar,
        certificatesCreatedForWh: 0,
        lastSmartMeterCO2OffsetRead: 0,
        cO2UsedForCertificate: 0,
        complianceRegistry: Asset_1.Compliance.none,
        otherGreenAttributes: "N.A",
        typeOfPublicSupport: "N.A"
    };
    const assetProps_TWL5 = {
        smartMeter: "0x0071e0526041472494f710cFB36c71B219dF70ef",
        owner: "0xa0feefe7e0c827c62730ddf3ed0de56660663079",
        operationalSince: 0,
        capacityWh: 100000,
        active: true,
        lastSmartMeterReadFileHash: "",
        country: "Germany",
        region: "European Union",
        zip: "67063",
        city: "Ludwigshafen am Rhein",
        street: "Industriestrasse ",
        houseNumber: "3",
        gpsLatitude: "49.46640",
        gpsLongitude: "8.45310",
        assetType: Asset_1.AssetType.Solar,
        certificatesCreatedForWh: 0,
        lastSmartMeterCO2OffsetRead: 0,
        cO2UsedForCertificate: 0,
        complianceRegistry: Asset_1.Compliance.none,
        otherGreenAttributes: "N.A",
        typeOfPublicSupport: "N.A"
    };
    const assetProps_SP1 = {
        smartMeter: "0x00Cc98692308246ae56efFAcE5628f137fd8915b",
        owner: "0x25Ea0A62f43c0a9875c99790653038e157421a72",
        operationalSince: 1452470400,
        capacityWh: 135000,
        active: true,
        lastSmartMeterReadFileHash: "",
        country: "Singapore",
        region: "Singapore",
        zip: "349562",
        city: "Singapore",
        street: "Genting Ln",
        houseNumber: "54",
        gpsLatitude: "1.326977",
        gpsLongitude: "103.874539",
        assetType: Asset_1.AssetType.Solar,
        certificatesCreatedForWh: 0,
        lastSmartMeterCO2OffsetRead: 0,
        cO2UsedForCertificate: 0,
        complianceRegistry: Asset_1.Compliance.none,
        otherGreenAttributes: "N.A",
        typeOfPublicSupport: "N.A"
    };
    const assetProps_SP2 = {
        smartMeter: "0x00FdF1e7Db6b660f6c65c116d45f663B47b60a37",
        owner: "0x25Ea0A62f43c0a9875c99790653038e157421a72",
        operationalSince: 1452902400,
        capacityWh: 15000,
        active: true,
        lastSmartMeterReadFileHash: "",
        country: "Singapore",
        region: "Singapore",
        zip: "99447",
        city: "Singapore",
        street: "Kampong Bahru Road",
        houseNumber: "500",
        gpsLatitude: "1.2705539",
        gpsLongitude: "103.8172522",
        assetType: Asset_1.AssetType.Solar,
        certificatesCreatedForWh: 0,
        lastSmartMeterCO2OffsetRead: 0,
        cO2UsedForCertificate: 0,
        complianceRegistry: Asset_1.Compliance.none,
        otherGreenAttributes: "N.A",
        typeOfPublicSupport: "N.A"
    };
    const assetProps_SP3 = {
        smartMeter: "0x00F200e70917AEc896591b021871e6F9e17eC6CD",
        owner: "0x25Ea0A62f43c0a9875c99790653038e157421a72",
        operationalSince: 1474243200,
        capacityWh: 68000,
        active: true,
        lastSmartMeterReadFileHash: "",
        country: "Singapore",
        region: "Singapore",
        zip: "139645",
        city: "Singapore",
        street: "Dover Road",
        houseNumber: "20",
        gpsLatitude: "1.300158",
        gpsLongitude: "103.784235",
        assetType: Asset_1.AssetType.Solar,
        certificatesCreatedForWh: 0,
        lastSmartMeterCO2OffsetRead: 0,
        cO2UsedForCertificate: 0,
        complianceRegistry: Asset_1.Compliance.none,
        otherGreenAttributes: "N.A",
        typeOfPublicSupport: "N.A"
    };
    const assetProps_SP4 = {
        smartMeter: "0x001b2C1d667Bb334BAdAE6CDa8B18b0A7a2b4d8F",
        owner: "0x25Ea0A62f43c0a9875c99790653038e157421a72",
        operationalSince: 1479081600,
        capacityWh: 74730,
        active: true,
        lastSmartMeterReadFileHash: "",
        country: "Singapore",
        region: "Singapore",
        zip: "109257",
        city: "Singapore",
        street: "Telok Blangah Dr",
        houseNumber: "4",
        gpsLatitude: "1.272874",
        gpsLongitude: "103.811594",
        assetType: Asset_1.AssetType.Solar,
        certificatesCreatedForWh: 0,
        lastSmartMeterCO2OffsetRead: 0,
        cO2UsedForCertificate: 0,
        complianceRegistry: Asset_1.Compliance.none,
        otherGreenAttributes: "N.A",
        typeOfPublicSupport: "N.A"
    };
    const assetProps_SP5 = {
        smartMeter: "0x004D27ebD0105d55612cEA6F76384424F59d146e",
        owner: "0x25Ea0A62f43c0a9875c99790653038e157421a72",
        operationalSince: 1471132800,
        capacityWh: 21000,
        active: true,
        lastSmartMeterReadFileHash: "",
        country: "Singapore",
        region: "Singapore",
        zip: "677761",
        city: "Singapore",
        street: "Almond Ave",
        houseNumber: "20",
        gpsLatitude: "1.371463",
        gpsLongitude: "103.773370",
        assetType: Asset_1.AssetType.Solar,
        certificatesCreatedForWh: 0,
        lastSmartMeterCO2OffsetRead: 0,
        cO2UsedForCertificate: 0,
        complianceRegistry: Asset_1.Compliance.none,
        otherGreenAttributes: "N.A",
        typeOfPublicSupport: "N.A"
    };
    const assetProps_sonnen1 = {
        smartMeter: "0x00D6ebCE819241d39DF6Fc3Efc4210110f2ea22e",
        owner: "0x009c9889C060c551F26bE504bFeb426645387Bf3",
        operationalSince: 1522540800,
        capacityWh: 13200,
        active: true,
        lastSmartMeterReadFileHash: "",
        country: "Germany",
        region: "Bavaria",
        zip: "677761",
        city: "Wildpoldsried",
        street: "Am Riedbach",
        houseNumber: "1",
        gpsLatitude: "47.7735887",
        gpsLongitude: "10.4098062",
        assetType: Asset_1.AssetType.Solar,
        certificatesCreatedForWh: 0,
        lastSmartMeterCO2OffsetRead: 0,
        cO2UsedForCertificate: 0,
        complianceRegistry: Asset_1.Compliance.none,
        otherGreenAttributes: "N.A",
        typeOfPublicSupport: "N.A"
    };
    const assetProps_sonnen2 = {
        smartMeter: "0x00147a9cb19A46eF40bcfcAd256AD99d25A11FA1",
        owner: "0x009c9889C060c551F26bE504bFeb426645387Bf3",
        operationalSince: 1522540800,
        capacityWh: 13200,
        active: true,
        lastSmartMeterReadFileHash: "",
        country: "Germany",
        region: "Bavaria",
        zip: "677761",
        city: "Wildpoldsried",
        street: "Am Riedbach",
        houseNumber: "1",
        gpsLatitude: "47.7735887",
        gpsLongitude: "10.4098062",
        assetType: Asset_1.AssetType.Solar,
        certificatesCreatedForWh: 0,
        lastSmartMeterCO2OffsetRead: 0,
        cO2UsedForCertificate: 0,
        complianceRegistry: Asset_1.Compliance.none,
        otherGreenAttributes: "N.A",
        typeOfPublicSupport: "N.A"
    };
    assetProducingArray.push(assetProps_Engie1);
    assetProducingArray.push(assetProps_Engie2);
    assetProducingArray.push(assetProps_Engie3);
    assetProducingArray.push(assetProps_Engie4);
    assetProducingArray.push(assetProps_Kathrin);
    assetProducingArray.push(assetProps_Steffen);
    assetProducingArray.push(assetProps_TWL1);
    assetProducingArray.push(assetProps_TWL2);
    assetProducingArray.push(assetProps_TWL3);
    assetProducingArray.push(assetProps_TWL4);
    assetProducingArray.push(assetProps_TWL5);
    assetProducingArray.push(assetProps_SP1);
    assetProducingArray.push(assetProps_SP2);
    assetProducingArray.push(assetProps_SP3);
    assetProducingArray.push(assetProps_SP4);
    assetProducingArray.push(assetProps_SP5);
    assetProducingArray.push(assetProps_sonnen1);
    assetProducingArray.push(assetProps_sonnen2);
    const allAssets = yield ProducingAsset_1.ProducingAsset.GET_ALL_ASSETS(blockchainProperties);
    console.log("found " + allAssets.length + " existing producing assets");
    for (let i = 0; i < assetProducingArray.length; i++) {
        let foundAsset = allAssets.find((passet) => (passet.smartMeter === assetProducingArray[i].smartMeter));
        if (!foundAsset) {
            let asset = yield ProducingAsset_1.ProducingAsset.CREATE_ASSET_RAW(assetProducingArray[i], blockchainProperties);
            console.log("deploying producing asset #" + asset.id);
        }
    }
    const assetProps_consuming1 = {
        smartMeter: "0x7110d0f07be70fc2a6c84fe66bf128593b2102fb",
        owner: "0x3409c66069b3c4933c654beeaa136cc5ce6d7bd0",
        operationalSince: 1523318400,
        capacityWh: 100000,
        active: true,
        country: "Germany",
        region: "North Rhine-Westphalia",
        zip: "45131",
        city: "Essen",
        street: "Brüsseler Platz",
        houseNumber: "1",
        gpsLatitude: "51.424756",
        gpsLongitude: "6.993619",
        maxCapacitySet: false,
        certificatesUsedForWh: 0
    };
    const assetProps_consuming2 = {
        smartMeter: "0x7110d0f07be70fc2a6c84fe66bf128593b2102fb",
        owner: "0xaf9dde98b6aeb2225bf87c2cb91c58833fbab2ab",
        operationalSince: 1523318400,
        capacityWh: 100000,
        active: true,
        country: "USA",
        region: "Washington",
        zip: "98052",
        city: "Redmond",
        street: "98052",
        houseNumber: "16011",
        gpsLatitude: "47.641265",
        gpsLongitude: "-122.125588",
        maxCapacitySet: false,
        certificatesUsedForWh: 0
    };
    const assetCons_sonnen1 = {
        smartMeter: "0x0088fF114071cD11D910A3C4C999215DbbF320fF",
        owner: "0x009c9889C060c551F26bE504bFeb426645387Bf3",
        operationalSince: 1522540800,
        capacityWh: 13200,
        active: true,
        country: "Germany",
        region: "Bavaria",
        zip: "677761",
        city: "Wildpoldsried",
        street: "Am Riedbach",
        houseNumber: "1",
        gpsLatitude: "47.7735887",
        gpsLongitude: "10.4098062",
        maxCapacitySet: true,
        certificatesUsedForWh: 0
    };
    const assetCons_sonnen2 = {
        smartMeter: "0x0088fF114071cD11D910A3C4C999215DbbF320fF",
        owner: "0x009c9889C060c551F26bE504bFeb426645387Bf3",
        operationalSince: 1522540800,
        capacityWh: 13200,
        active: true,
        country: "Germany",
        region: "Bavaria",
        zip: "677761",
        city: "Wildpoldsried",
        street: "Am Riedbach",
        houseNumber: "1",
        gpsLatitude: "47.7735887",
        gpsLongitude: "10.4098062",
        maxCapacitySet: true,
        certificatesUsedForWh: 0
    };
    const assetCons_GridSing = {
        smartMeter: "0x006c31Db28c87d9D95aF60D57e0AF96E6C7cEc60",
        owner: "0x003E64c28CE66392b48A653c163dcf8879073371",
        operationalSince: 1522540800,
        capacityWh: 20000,
        active: true,
        country: "Germany",
        region: "Berlin",
        zip: "12047",
        city: "Berlin",
        street: "Schinkestraße",
        houseNumber: "20",
        gpsLatitude: "52.494393",
        gpsLongitude: "13.423081",
        maxCapacitySet: true,
        certificatesUsedForWh: 0
    };
    let allConsumingAssets = yield ConsumingAsset_1.ConsumingAsset.GET_ALL_ASSETS(blockchainProperties);
    if (allConsumingAssets.length === 0) {
        assetConsumingArray.push(assetProps_consuming1);
        assetConsumingArray.push(assetProps_consuming2);
    }
    assetConsumingArray.push(assetCons_sonnen1);
    assetConsumingArray.push(assetCons_sonnen2);
    assetConsumingArray.push(assetCons_GridSing);
    for (let i = 0; i < assetConsumingArray.length; i++) {
        let foundAsset = allConsumingAssets.find((casset) => (casset.smartMeter === assetConsumingArray[i].smartMeter));
        if (!foundAsset) {
            let asset = yield ConsumingAsset_1.ConsumingAsset.CREATE_ASSET_RAW(assetConsumingArray[i], blockchainProperties);
            console.log("deploying consumingasset #" + asset.id);
        }
    }
    const demandMS = {
        buyer: '0x82f43BEc871167d0794860bAc5A7D945e96682Bf',
        enabledProperties: [true, false, false, false, false, false, false, false, false, false],
        originator: '0x0072B6143cbFA0EEDfd814c1577465789e7f732d',
        locationCountry: '',
        locationRegion: '',
        minCO2Offset: 0,
        otherGreenAttributes: '',
        typeOfPublicSupport: '',
        productingAsset: 0,
        consumingAsset: 0,
        targetWhPerPeriod: 10000000,
        pricePerCertifiedWh: 0,
        assettype: Asset_1.AssetType.Wind,
        registryCompliance: Asset_1.Compliance.none,
        timeframe: Demand_1.TimeFrame.daily,
        currency: Demand_1.Currency.Euro,
        startTime: (new Date(2018, 4 - 1, 12).getTime() / 1000),
        endTime: ((new Date(2018, 5 - 1, 12)).getTime() / 1000),
        matcher: '0x343854A430653571B4De6bF2b8C475F828036C30'
    };
    demandArray.push(demandMS);
    const demandDBS = {
        buyer: '0x6345DC9FaC9d0662103ab05e4545B833a6a7992C',
        enabledProperties: [true, false, false, false, false, false, false, false, false, false],
        originator: '0x25Ea0A62f43c0a9875c99790653038e157421a72',
        locationCountry: '',
        locationRegion: '',
        minCO2Offset: 0,
        otherGreenAttributes: '',
        typeOfPublicSupport: '',
        productingAsset: 0,
        consumingAsset: 0,
        targetWhPerPeriod: 500000,
        pricePerCertifiedWh: 0,
        assettype: Asset_1.AssetType.Wind,
        registryCompliance: Asset_1.Compliance.none,
        timeframe: Demand_1.TimeFrame.daily,
        currency: Demand_1.Currency.Euro,
        startTime: (new Date(2018, 4 - 1, 12).getTime() / 1000),
        endTime: ((new Date(2018, 4 - 1, 26)).getTime() / 1000),
        matcher: '0x343854A430653571B4De6bF2b8C475F828036C30'
    };
    demandArray.push(demandDBS);
    const demandGrid1 = {
        buyer: '0x003E64c28CE66392b48A653c163dcf8879073371',
        enabledProperties: [false, false, false, false, false, false, true, true, false, false],
        originator: '0x0000000000000000000000000000000000000000',
        locationCountry: '',
        locationRegion: '',
        minCO2Offset: 0,
        otherGreenAttributes: '',
        typeOfPublicSupport: '',
        productingAsset: 5,
        consumingAsset: 4,
        targetWhPerPeriod: 20000,
        pricePerCertifiedWh: 0,
        assettype: Asset_1.AssetType.Wind,
        registryCompliance: Asset_1.Compliance.none,
        timeframe: Demand_1.TimeFrame.daily,
        currency: Demand_1.Currency.Euro,
        startTime: (new Date(2018, 4 - 1, 12).getTime() / 1000),
        endTime: ((new Date(2018, 12 - 1, 31)).getTime() / 1000),
        matcher: '0x343854A430653571B4De6bF2b8C475F828036C30'
    };
    demandArray.push(demandGrid1);
    const demandGrid2 = {
        buyer: '0x003E64c28CE66392b48A653c163dcf8879073371',
        enabledProperties: [false, false, false, false, false, false, true, true, false, false],
        originator: '0x0000000000000000000000000000000000000000',
        locationCountry: '',
        locationRegion: '',
        minCO2Offset: 0,
        otherGreenAttributes: '',
        typeOfPublicSupport: '',
        productingAsset: 4,
        consumingAsset: 4,
        targetWhPerPeriod: 20000,
        pricePerCertifiedWh: 0,
        assettype: Asset_1.AssetType.Wind,
        registryCompliance: Asset_1.Compliance.none,
        timeframe: Demand_1.TimeFrame.daily,
        currency: Demand_1.Currency.Euro,
        startTime: (new Date(2018, 4 - 1, 12).getTime() / 1000),
        endTime: ((new Date(2018, 12 - 1, 31)).getTime() / 1000),
        matcher: '0x343854A430653571B4De6bF2b8C475F828036C30'
    };
    demandArray.push(demandGrid2);
    const demandEON = {
        buyer: '0x3409c66069b3c4933c654beeaa136cc5ce6d7bd0',
        enabledProperties: [true, false, false, false, false, false, false, true, false, false],
        originator: '0xa0feefe7e0c827c62730ddf3ed0de56660663079',
        locationCountry: '',
        locationRegion: '',
        minCO2Offset: 0,
        otherGreenAttributes: '',
        typeOfPublicSupport: '',
        productingAsset: 0,
        consumingAsset: 0,
        targetWhPerPeriod: 1100000,
        pricePerCertifiedWh: 0,
        assettype: Asset_1.AssetType.Wind,
        registryCompliance: Asset_1.Compliance.none,
        timeframe: Demand_1.TimeFrame.daily,
        currency: Demand_1.Currency.Euro,
        startTime: (new Date(2018, 4 - 1, 12).getTime() / 1000),
        endTime: ((new Date(2018, 5 - 1, 12)).getTime() / 1000),
        matcher: '0x343854A430653571B4De6bF2b8C475F828036C30'
    };
    demandArray.push(demandEON);
    const allDemands = yield Demand_1.Demand.GET_ALL_ACTIVE_DEMANDS(blockchainProperties);
    for (let i = 0; i < demandArray.length; i++) {
        let foundDemand = allDemands.find((d) => (d.buyer.toLowerCase() === demandArray[i].buyer.toLowerCase()
            && d.targetWhPerPeriod === demandArray[i].targetWhPerPeriod
            && d.productingAsset === demandArray[i].productingAsset
            && d.consumingAsset === demandArray[i].consumingAsset
            && d.startTime === demandArray[i].startTime
            && d.endTime === demandArray[i].endTime));
        if (!foundDemand) {
            const newD = allDemands[5];
            let demand = yield Demand_1.Demand.CREATE_DEMAND_RAW(demandArray[i], blockchainProperties, "0xd173313a51f8fc37bcf67569b463abd89d81844f");
            console.log("created demand #" + demand.id);
        }
    }
});
main();
//# sourceMappingURL=addData.js.map