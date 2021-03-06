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
class ContractEventHandler {
    constructor(contractInstance, lastBlockChecked) {
        this.contractInstance = contractInstance;
        this.lastBlockChecked = lastBlockChecked;
        this.unhandledEvents = [];
        this.walkThroughUnhandledEvent = this.walkThroughUnhandledEvent.bind(this);
        this.onEventRegistry = [];
        this.onAnyContractEventRegistry = [];
    }
    tick(blockchainProperties) {
        return __awaiter(this, void 0, void 0, function* () {
            const blockNumber = yield blockchainProperties.web3.eth.getBlockNumber();
            const events = yield this.contractInstance.getPastEvents('allEvents', { fromBlock: this.lastBlockChecked + 1, toBlock: blockNumber });
            this.unhandledEvents = events.reverse().concat(this.unhandledEvents);
            this.lastBlockChecked = blockNumber > this.lastBlockChecked ? blockNumber : this.lastBlockChecked;
            this.walkThroughUnhandledEvent();
        });
    }
    walkThroughUnhandledEvent() {
        if (this.unhandledEvents.length > 0) {
            const event = this.unhandledEvents.pop();
            if (this.onEventRegistry[event.event]) {
                this.onEventRegistry[event.event].forEach(onEvent => onEvent(event));
            }
            this.onAnyContractEventRegistry.forEach(onEvent => onEvent(event));
            this.walkThroughUnhandledEvent();
        }
    }
    onEvent(eventName, onEvent) {
        if (!this.onEventRegistry[eventName]) {
            this.onEventRegistry[eventName] = [];
        }
        this.onEventRegistry[eventName].push(onEvent);
    }
    onAnyContractEvent(onEvent) {
        this.onAnyContractEventRegistry.push(onEvent);
    }
}
exports.ContractEventHandler = ContractEventHandler;
//# sourceMappingURL=ContractEventHandler.js.map