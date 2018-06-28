import { BlockchainProperties } from './BlockchainProperties';
export declare abstract class BlockchainDataModelEntity {
    id: number;
    blockchainProperties: BlockchainProperties;
    constructor(id: number, blockchainProperties: BlockchainProperties);
    abstract syncWithBlockchain(): Promise<BlockchainDataModelEntity>;
}
