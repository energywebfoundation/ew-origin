import { BlockchainProperties } from './BlockchainProperties';
export declare class ContractEventHandler {
    lastBlockChecked: number;
    unhandledEvents: any[];
    contractInstance: any;
    onEventRegistry: Function[][];
    onAnyContractEventRegistry: Function[];
    constructor(contractInstance: any, lastBlockChecked: number);
    tick(blockchainProperties: BlockchainProperties): Promise<void>;
    walkThroughUnhandledEvent(): void;
    onEvent(eventName: string, onEvent: Function): void;
    onAnyContractEvent(onEvent: Function): void;
}
