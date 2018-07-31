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
const RawTransaction_1 = require("./RawTransaction");
var Roles;
(function (Roles) {
    Roles[Roles["TopAdmin"] = 0] = "TopAdmin";
    Roles[Roles["UserAdmin"] = 1] = "UserAdmin";
    Roles[Roles["AssetAdmin"] = 2] = "AssetAdmin";
    Roles[Roles["AgreementAdmin"] = 3] = "AgreementAdmin";
    Roles[Roles["AssetManager"] = 4] = "AssetManager";
    Roles[Roles["Trader"] = 5] = "Trader";
    Roles[Roles["Matcher"] = 6] = "Matcher";
})(Roles = exports.Roles || (exports.Roles = {}));
class User {
    constructor(accountAddress, blockchainProperties) {
        this.accountAddress = accountAddress;
        this.blockchainProperties = blockchainProperties;
    }
    static CREATE_USER(userProperties, blockchainProperties) {
        return __awaiter(this, void 0, void 0, function* () {
            const userData = [
                userProperties.accountAddress,
                blockchainProperties.web3.utils.fromUtf8(userProperties.firstName),
                blockchainProperties.web3.utils.fromUtf8(userProperties.surname),
                blockchainProperties.web3.utils.fromUtf8(userProperties.organization),
                blockchainProperties.web3.utils.fromUtf8(userProperties.street),
                blockchainProperties.web3.utils.fromUtf8(userProperties.number),
                blockchainProperties.web3.utils.fromUtf8(userProperties.zip),
                blockchainProperties.web3.utils.fromUtf8(userProperties.city),
                blockchainProperties.web3.utils.fromUtf8(userProperties.country),
                blockchainProperties.web3.utils.fromUtf8(userProperties.state)
            ];
            const gasCreate = yield blockchainProperties.userLogicInstance.methods
                .setUser(...userData)
                .estimateGas({ from: blockchainProperties.userAdmin });
            console.log(gasCreate);
            const txUserCreate = yield blockchainProperties.userLogicInstance.methods
                .setUser(...userData)
                .send({ from: blockchainProperties.userAdmin, gas: Math.round(gasCreate * 3.1) });
            const gasSetRole = yield blockchainProperties.userLogicInstance.methods
                .setRoles(userProperties.accountAddress, userProperties.roles)
                .estimateGas({ from: blockchainProperties.userAdmin });
            console.log(gasSetRole);
            const txSetRole = yield blockchainProperties.userLogicInstance.methods
                .setRoles(userProperties.accountAddress, userProperties.roles)
                .send({ from: blockchainProperties.userAdmin, gas: Math.round(gasCreate * 3.1) });
            return (new User(userProperties.accountAddress, blockchainProperties)).syncWithBlockchain();
        });
    }
    static CREATE_USER_RAW(userProperties, blockchainProperties) {
        return __awaiter(this, void 0, void 0, function* () {
            const userData = [
                userProperties.accountAddress,
                blockchainProperties.web3.utils.fromUtf8(userProperties.firstName),
                blockchainProperties.web3.utils.fromUtf8(userProperties.surname),
                blockchainProperties.web3.utils.fromUtf8(userProperties.organization),
                blockchainProperties.web3.utils.fromUtf8(userProperties.street),
                blockchainProperties.web3.utils.fromUtf8(userProperties.number),
                blockchainProperties.web3.utils.fromUtf8(userProperties.zip),
                blockchainProperties.web3.utils.fromUtf8(userProperties.city),
                blockchainProperties.web3.utils.fromUtf8(userProperties.country),
                blockchainProperties.web3.utils.fromUtf8(userProperties.state)
            ];
            const gasCreate = yield blockchainProperties.userLogicInstance.methods
                .setUser(...userData)
                .estimateGas({ from: blockchainProperties.userAdmin });
            const txUserCreate = yield blockchainProperties.userLogicInstance.methods
                .setUser(...userData)
                .encodeABI();
            const txSetRole = yield blockchainProperties.userLogicInstance.methods
                .setRoles(userProperties.accountAddress, userProperties.roles)
                .encodeABI();
            let txCount = yield blockchainProperties.web3.eth.getTransactionCount(blockchainProperties.userAdmin);
            yield RawTransaction_1.sendRawTx(blockchainProperties.userAdmin, txCount, Math.round(gasCreate * 1.5), txUserCreate, blockchainProperties, blockchainProperties.userLogicInstance._address);
            yield RawTransaction_1.sendRawTx(blockchainProperties.userAdmin, txCount + 1, 200000, txSetRole, blockchainProperties, blockchainProperties.userLogicInstance._address);
            return (new User(userProperties.accountAddress, blockchainProperties)).syncWithBlockchain();
        });
    }
    syncWithBlockchain() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.accountAddress) {
                const userData = yield this.blockchainProperties.userLogicInstance.methods.getFullUser(this.accountAddress).call();
                this.firstName = this.blockchainProperties.web3.utils.hexToUtf8(userData.firstName);
                this.surname = this.blockchainProperties.web3.utils.hexToUtf8(userData.surname);
                this.organization = this.blockchainProperties.web3.utils.hexToUtf8(userData.organization);
                this.street = this.blockchainProperties.web3.utils.hexToUtf8(userData.street);
                this.number = this.blockchainProperties.web3.utils.hexToUtf8(userData.number);
                this.zip = this.blockchainProperties.web3.utils.hexToUtf8(userData.zip);
                this.city = this.blockchainProperties.web3.utils.hexToUtf8(userData.city);
                this.country = this.blockchainProperties.web3.utils.hexToUtf8(userData.country);
                this.state = this.blockchainProperties.web3.utils.hexToUtf8(userData.state);
                this.roles = parseInt(userData.roles, 10);
                this.active = userData.active;
            }
            return this;
        });
    }
}
exports.User = User;
//# sourceMappingURL=User.js.map