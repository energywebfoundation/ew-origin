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
class Certificate {
    constructor(id, blockchainProperties) {
        this.id = id;
        this.blockchainProperties = blockchainProperties;
    }
    static GET_CERTIFICATE_LIST_LENGTH(blockchainProperties) {
        return __awaiter(this, void 0, void 0, function* () {
            return parseInt(yield blockchainProperties.certificateLogicInstance.methods.getCertificateListLength().call(), 10);
        });
    }
    static GET_ALL_CERTIFICATES(blockchainProperties) {
        return __awaiter(this, void 0, void 0, function* () {
            const assetsPromises = Array(yield Certificate.GET_CERTIFICATE_LIST_LENGTH(blockchainProperties))
                .fill(null)
                .map((item, index) => (new Certificate(index, blockchainProperties)).syncWithBlockchain());
            return Promise.all(assetsPromises);
        });
    }
    static GET_ALL_CERTIFICATES_OWNED_BY(owner, blockchainProperties) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield Certificate.GET_ALL_CERTIFICATES(blockchainProperties))
                .filter((certificate) => certificate.owner === owner);
        });
    }
    static GET_ALL_CERTIFICATES_WITH_ESCROW(escrow, blockchainProperties) {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield Certificate.GET_ALL_CERTIFICATES(blockchainProperties))
                .filter((certificate) => certificate.escrow === escrow);
        });
    }
    syncWithBlockchain() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.id != null) {
                const tx = yield this.blockchainProperties.certificateLogicInstance.methods.getCertificate(this.id).call();
                this.assetId = parseInt(tx._assetId, 10);
                this.owner = tx._owner;
                this.powerInW = parseInt(tx._powerInW, 10);
                this.retired = tx._retired;
                this.dataLog = tx._dataLog;
                this.coSaved = parseInt(tx._coSaved, 10);
                this.escrow = tx._escrow;
                this.creationTime = parseInt(tx._creationTime, 10);
            }
            return this;
        });
    }
    claim(account) {
        return __awaiter(this, void 0, void 0, function* () {
            const gasCreate = yield this.blockchainProperties.certificateLogicInstance.methods
                .retireCertificate(this.id)
                .estimateGas({ from: account });
            const txCreate = yield this.blockchainProperties.certificateLogicInstance.methods
                .retireCertificate(this.id)
                .send({ from: account, gas: Math.round(gasCreate * 1.5) });
        });
    }
    getCertificateEvents() {
        return __awaiter(this, void 0, void 0, function* () {
            return (yield this.blockchainProperties.certificateLogicInstance.getPastEvents('allEvents', {
                fromBlock: 0,
                toBlock: 'latest',
                topics: [null, this.blockchainProperties.web3.utils.padLeft(this.blockchainProperties.web3.utils.fromDecimal(this.id), 64, '0')]
            }));
        });
    }
}
exports.Certificate = Certificate;
//# sourceMappingURL=Certificate.js.map