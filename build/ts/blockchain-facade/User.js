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