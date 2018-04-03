"use strict";
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