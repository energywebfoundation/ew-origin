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
const chai_1 = require("chai");
require("mocha");
const fs = require("fs");
const Asset_1 = require("../blockchain-facade/Asset");
const ProducingAsset_1 = require("../blockchain-facade/ProducingAsset");
const test_accounts_1 = require("../test-accounts");
const Web3 = require('web3');
const AssetProducingLogicTruffleBuild = JSON.parse(fs.readFileSync('build/contracts/AssetProducingRegistryLogic.json', 'utf-8').toString());
describe('Asset', () => {
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
            producingAssetLogicInstance: yield getInstanceFromTruffleBuild(AssetProducingLogicTruffleBuild, web3),
            assetAdminAccount: assetAdminAccount.address,
            topAdminAccount: topAdminAccount.address
        };
    });
    before(() => __awaiter(this, void 0, void 0, function* () {
        yield init();
    }));
    it('asset should be created', () => __awaiter(this, void 0, void 0, function* () {
        const assetProps = {
            // GeneralInformation
            smartMeter: '0x59e67AE7934C37d3376ab9c8dE153D10E07AE8C9',
            owner: topAdminAccount.address,
            assetType: Asset_1.AssetType.BiomassGas,
            operationalSince: 0,
            capacityWh: 500,
            certificatesCreatedForWh: 0,
            active: true,
            complianceRegistry: Asset_1.Compliance.EEC,
            // Location
            country: 'DE',
            region: 'Saxony',
            zip: '1234',
            city: 'Springfield',
            street: 'No name street',
            houseNumber: '1',
            gpsLatitude: '0',
            gpsLongitude: '0'
        };
        const asset = yield ProducingAsset_1.ProducingAsset.CREATE_ASSET(assetProps, blockchainProperties);
        chai_1.expect(asset.id).to.equal(0);
    }));
});
//# sourceMappingURL=Asset.js.map