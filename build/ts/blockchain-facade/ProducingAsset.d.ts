import { BlockchainProperties } from './BlockchainProperties';
import { Asset, AssetProperties } from './Asset';
export interface ProducingAssetProperties extends AssetProperties {
    assetType?: AssetType;
    certificatesCreatedForWh?: number;
    lastSmartMeterCO2OffsetRead?: number;
    cO2UsedForCertificate?: number;
    complianceRegistry?: Compliance;
    otherGreenAttributes?: string;
    typeOfPublicSupport?: string;
}
export declare enum AssetType {
    Wind = 0,
    Solar = 1,
    RunRiverHydro = 2,
    BiomassGas = 3,
}
export declare enum Compliance {
    none = 0,
    IREC = 1,
    EEC = 2,
    TIGR = 3,
}
export declare class ProducingAsset extends Asset implements ProducingAssetProperties {
    assetType: AssetType;
    certificatesCreatedForWh: number;
    lastSmartMeterReadFileHash: string;
    lastSmartMeterCO2OffsetRead: number;
    cO2UsedForCertificate: number;
    complianceRegistry: Compliance;
    otherGreenAttributes: string;
    typeOfPublicSupport: string;
    static GET_ASSET_LIST_LENGTH(blockchainProperties: BlockchainProperties): Promise<number>;
    static GET_ALL_ASSETS(blockchainProperties: BlockchainProperties): Promise<ProducingAsset[]>;
    static GET_ALL_ASSET_OWNED_BY(owner: string, blockchainProperties: BlockchainProperties): Promise<ProducingAsset[]>;
    static CREATE_ASSET(assetProperties: ProducingAssetProperties, blockchainProperties: BlockchainProperties): Promise<ProducingAsset>;
    saveSmartMeterRead(_newMeterRead: any, _lastSmartMeterReadFileHash: any, _CO2OffsetMeterRead: any, blockchainProperties: any): Promise<void>;
    syncWithBlockchain(): Promise<ProducingAsset>;
    getCoSaved(wh: number): number;
    getAssetEvents(): Promise<any>;
    getEventWithFileHash(fileHash: any): Promise<any>;
    static CREATE_ASSET_RAW(assetProperties: ProducingAssetProperties, blockchainProperties: BlockchainProperties): Promise<ProducingAsset>;
}
