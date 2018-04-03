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