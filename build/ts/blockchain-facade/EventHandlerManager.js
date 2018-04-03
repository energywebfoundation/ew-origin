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
class EventHandlerManager {
    constructor(tickTime, blockchainProperties) {
        this.tickTime = tickTime;
        this.blockchainProperties = blockchainProperties;
        this.contractEventHandlers = [];
    }
    registerEventHandler(eventHandler) {
        this.contractEventHandlers.push(eventHandler);
    }
    start() {
        this.running = true;
        this.loop();
    }
    stop() {
        this.running = false;
    }
    loop() {
        return __awaiter(this, void 0, void 0, function* () {
            while (this.running) {
                this.contractEventHandlers.forEach((eventHandler) => eventHandler.tick(this.blockchainProperties));
                yield this.sleep(this.tickTime);
            }
        });
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
exports.EventHandlerManager = EventHandlerManager;
//# sourceMappingURL=EventHandlerManager.js.map