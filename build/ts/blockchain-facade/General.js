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
var General;
(function (General) {
    function createCertificateForAssetOwner(blockchainProperties, wh, assetId) {
        return __awaiter(this, void 0, void 0, function* () {
            const gas = yield blockchainProperties.certificateLogicInstance.methods
                .createCertificateForAssetOwner(assetId, wh)
                .estimateGas({ from: blockchainProperties.matcherAccount });
            const tx = yield blockchainProperties.certificateLogicInstance.methods
                .createCertificateForAssetOwner(assetId, wh)
                .send({ from: blockchainProperties.matcherAccount, gas: Math.round(gas * 1.1) });
            return tx;
        });
    }
    General.createCertificateForAssetOwner = createCertificateForAssetOwner;
})(General = exports.General || (exports.General = {}));
//# sourceMappingURL=General.js.map