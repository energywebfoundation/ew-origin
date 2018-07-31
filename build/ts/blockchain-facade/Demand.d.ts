import { BlockchainProperties } from './BlockchainProperties';
import { AssetType } from './Asset';
import { Compliance } from './Asset';
import { BlockchainDataModelEntity } from './BlockchainDataModelEntity';
export interface FullDemandProperties {
    enabledProperties?: boolean[];
    originator: string;
    buyer: string;
    startTime: number;
    endTime: number;
    timeframe: TimeFrame;
    pricePerCertifiedWh: number;
    currency: Currency;
    productingAsset: number;
    consumingAsset: number;
    locationCountry: string;
    locationRegion: string;
    assettype: AssetType;
    minCO2Offset: number;
    otherGreenAttributes: string;
    typeOfPublicSupport: string;
    targetWhPerPeriod: number;
    matcher: string;
    registryCompliance: Compliance;
}
export declare enum TimeFrame {
    yearly = 0,
    monthly = 1,
    daily = 2,
    hourly = 3,
}
export declare enum Currency {
    Euro = 0,
    USD = 1,
    SingaporeDollar = 2,
    Ether = 3,
}
export declare enum DemandProperties {
    Originator = 0,
    AssetType = 1,
    Compliance = 2,
    Country = 3,
    Region = 4,
    MinCO2 = 5,
    Producing = 6,
    Consuming = 7,
}
export declare class Demand extends BlockchainDataModelEntity implements FullDemandProperties {
    id: number;
    enabledProperties: boolean[];
    targetWhPerPeriod: number;
    currentWhPerPeriod: number;
    certInCurrentPeriod: number;
    productionLastSetInPeriod: number;
    matcher: string;
    matcherPropertiesExists: boolean;
    locationCountry: string;
    locationRegion: string;
    assettype: AssetType;
    minCO2Offset: number;
    priceDrivingExists: boolean;
    registryCompliance: Compliance;
    otherGreenAttributes: string;
    typeOfPublicSupport: string;
    originator: string;
    buyer: string;
    agreementDate: number;
    startTime: number;
    endTime: number;
    currency: Currency;
    generalInfoExists: boolean;
    enabled: boolean;
    timeframe: TimeFrame;
    productingAsset: number;
    consumingAsset: number;
    demandMask: number;
    pricePerCertifiedWh: number;
    initialized: boolean;
    blockchainProperties: BlockchainProperties;
    constructor(id: number, blockchainProperties: BlockchainProperties);
    static CREATE_DEMAND(demandProperties: FullDemandProperties, blockchainProperties: BlockchainProperties, account: string): Promise<Demand>;
    static CREATE_DEMAND_RAW(demandProperties: FullDemandProperties, blockchainProperties: BlockchainProperties, account: string): Promise<Demand>;
    static GET_ALL_DEMAND_LIST_LENGTH(blockchainProperties: BlockchainProperties): Promise<number>;
    static GET_ACTIVE_DEMAND_LIST_LENGTH(blockchainProperties: BlockchainProperties): Promise<number>;
    static GET_ACTIVE_DEMAND_ID_AT(index: number, blockchainProperties: BlockchainProperties): Promise<any>;
    static GET_ALL_ACTIVE_DEMANDS(blockchainProperties: BlockchainProperties): Promise<Demand[]>;
    getBitFromDemandMask(bitPosition: number): boolean;
    getCurrentPeriod(): Promise<any>;
    matchDemand(wh: number, assetId: number): Promise<any>;
    matchCertificate(certificateId: number): Promise<any>;
    syncWithBlockchain(): Promise<Demand>;
    checkDemandCoupling(demandId: number, prodAssetId: number, wCreated: number): Promise<void>;
    checkDemandGeneral(demandId: number, prodAssetId: number): Promise<void>;
    checkMatcher(demandId: number, wCreated: number, matcher: string): Promise<void>;
    checkPriceDriving(demandId: number, prodAssetId: number, wCreated: number, co2Saved: number): Promise<void>;
    getDemandEvents(): Promise<any>;
}
