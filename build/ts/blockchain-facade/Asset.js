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
const BlockchainDataModelEntity_1 = require("./BlockchainDataModelEntity");
var AssetType;
(function (AssetType) {
    AssetType[AssetType["Wind"] = 0] = "Wind";
    AssetType[AssetType["Solar"] = 1] = "Solar";
    AssetType[AssetType["RunRiverHydro"] = 2] = "RunRiverHydro";
    AssetType[AssetType["BiomassGas"] = 3] = "BiomassGas";
})(AssetType = exports.AssetType || (exports.AssetType = {}));
var Compliance;
(function (Compliance) {
    Compliance[Compliance["none"] = 0] = "none";
    Compliance[Compliance["IREC"] = 1] = "IREC";
    Compliance[Compliance["EEC"] = 2] = "EEC";
    Compliance[Compliance["TIGR"] = 3] = "TIGR";
})(Compliance = exports.Compliance || (exports.Compliance = {}));
class Asset extends BlockchainDataModelEntity_1.BlockchainDataModelEntity {
    constructor(id, blockchainProperties) {
        super(id, blockchainProperties);
        this.initialized = false;
    }
}
exports.Asset = Asset;
//# sourceMappingURL=Asset.js.map