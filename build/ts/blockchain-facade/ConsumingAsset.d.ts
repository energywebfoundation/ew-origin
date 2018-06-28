import { BlockchainProperties } from './BlockchainProperties';
import { Asset, AssetProperties } from './Asset';
export interface ConsumingProperties extends AssetProperties {
    maxCapacitySet: boolean;
    certificatesUsedForWh: number;
}
export declare enum Compliance {
    none = 0,
    IREC = 1,
    EEC = 2,
    TIGR = 3,
}
export declare class ConsumingAsset extends Asset implements ConsumingProperties {
    certificatesUsedForWh: number;
    maxCapacitySet: boolean;
    static CREATE_ASSET(assetProperties: ConsumingProperties, blockchainProperties: BlockchainProperties): Promise<Asset>;
    static CREATE_ASSET_RAW(assetProperties: ConsumingProperties, blockchainProperties: BlockchainProperties): Promise<ConsumingAsset>;
    static GET_ASSET_LIST_LENGTH(blockchainProperties: BlockchainProperties): Promise<number>;
    static GET_ALL_ASSETS(blockchainProperties: BlockchainProperties): Promise<ConsumingAsset[]>;
    static GET_ALL_ASSET_OWNED_BY(owner: string, blockchainProperties: BlockchainProperties): Promise<ConsumingAsset[]>;
    saveSmartMeter(_newMeterRead: any, _lastSmartMeterReadFileHash: any, _smartMeterDown: any, blockchainProperties: any): Promise<any>;
    syncWithBlockchain(): Promise<ConsumingAsset>;
    getAssetEvents(): Promise<any>;
    getEventWithFileHash(fileHash: any): Promise<any>;
}
