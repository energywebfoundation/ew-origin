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
Object.defineProperty(exports, "__esModule", { value: true });
var Asset_1 = require("./blockchain-facade/Asset");
exports.Asset = Asset_1.Asset;
exports.AssetType = Asset_1.AssetType;
exports.Compliance = Asset_1.Compliance;
var Certificate_1 = require("./blockchain-facade/Certificate");
exports.Certificate = Certificate_1.Certificate;
var ProducingAsset_1 = require("./blockchain-facade/ProducingAsset");
exports.ProducingAsset = ProducingAsset_1.ProducingAsset;
var ConsumingAsset_1 = require("./blockchain-facade/ConsumingAsset");
exports.ConsumingAsset = ConsumingAsset_1.ConsumingAsset;
var Demand_1 = require("./blockchain-facade/Demand");
exports.Demand = Demand_1.Demand;
exports.TimeFrame = Demand_1.TimeFrame;
exports.Currency = Demand_1.Currency;
exports.DemandProperties = Demand_1.DemandProperties;
var ContractEventHandler_1 = require("./blockchain-facade/ContractEventHandler");
exports.ContractEventHandler = ContractEventHandler_1.ContractEventHandler;
var EventHandlerManager_1 = require("./blockchain-facade/EventHandlerManager");
exports.EventHandlerManager = EventHandlerManager_1.EventHandlerManager;
var User_1 = require("./blockchain-facade/User");
exports.User = User_1.User;
var General_1 = require("./blockchain-facade/General");
exports.General = General_1.General;
var Deployment_1 = require("./Deployment");
exports.deployContract = Deployment_1.deployContract;
exports.deployCoo = Deployment_1.deployCoo;
exports.logicInit = Deployment_1.logicInit;
exports.initCoo = Deployment_1.initCoo;
const DemandLogicTruffleBuild = require("../contracts/DemandLogic.json");
exports.DemandLogicTruffleBuild = DemandLogicTruffleBuild;
const AssetProducingLogicTruffleBuild = require("../contracts/AssetProducingRegistryLogic.json");
exports.AssetProducingLogicTruffleBuild = AssetProducingLogicTruffleBuild;
const AssetConsumingLogicTruffleBuild = require("../contracts/AssetConsumingRegistryLogic.json");
exports.AssetConsumingLogicTruffleBuild = AssetConsumingLogicTruffleBuild;
const CertificateLogicTruffleBuild = require("../contracts/CertificateLogic.json");
exports.CertificateLogicTruffleBuild = CertificateLogicTruffleBuild;
const CoOTruffleBuild = require("../contracts/CoO.json");
exports.CoOTruffleBuild = CoOTruffleBuild;
const UserLogicTruffleBuild = require("../contracts/UserLogic.json");
exports.UserLogicTruffleBuild = UserLogicTruffleBuild;
const DemandDBTruffleBuild = require("../contracts/DemandDB.json");
exports.DemandDBTruffleBuild = DemandDBTruffleBuild;
const AssetProducingDBTruffleBuild = require("../contracts/AssetProducingRegistryDB.json");
exports.AssetProducingDBTruffleBuild = AssetProducingDBTruffleBuild;
const AssetConsumingDBTruffleBuild = require("../contracts/AssetConsumingRegistryDB.json");
exports.AssetConsumingDBTruffleBuild = AssetConsumingDBTruffleBuild;
const CertificateDBTruffleBuild = require("../contracts/CertificateDB.json");
exports.CertificateDBTruffleBuild = CertificateDBTruffleBuild;
const UserDBTruffleBuild = require("../contracts/UserDB.json");
exports.UserDBTruffleBuild = UserDBTruffleBuild;
//# sourceMappingURL=index.js.map