import { ContractEventHandler } from './ContractEventHandler';
import { BlockchainProperties } from './BlockchainProperties';
export declare class EventHandlerManager {
    private contractEventHandlers;
    private tickTime;
    private running;
    private blockchainProperties;
    constructor(tickTime: number, blockchainProperties: BlockchainProperties);
    registerEventHandler(eventHandler: ContractEventHandler): void;
    start(): void;
    stop(): void;
    loop(): Promise<void>;
    sleep(ms: any): Promise<{}>;
}
