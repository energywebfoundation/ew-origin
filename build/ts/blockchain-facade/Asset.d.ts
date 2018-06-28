import { BlockchainProperties } from './BlockchainProperties';
import { BlockchainDataModelEntity } from './BlockchainDataModelEntity';
export interface AssetProperties {
    smartMeter: string;
    owner: string;
    operationalSince: number;
    capacityWh: number;
    lastSmartMeterReadWh?: number;
    active: boolean;
    lastSmartMeterReadFileHash?: string;
    country: string;
    region: string;
    zip: string;
    city: string;
    street: string;
    houseNumber: string;
    gpsLatitude: string;
    gpsLongitude: string;
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
export declare abstract class Asset extends BlockchainDataModelEntity implements AssetProperties {
    id: number;
    smartMeter: string;
    owner: string;
    operationalSince: number;
    capacityWh: number;
    lastSmartMeterReadWh: number;
    active: boolean;
    lastSmartMeterReadFileHash: string;
    country: string;
    region: string;
    zip: string;
    city: string;
    street: string;
    houseNumber: string;
    gpsLatitude: string;
    gpsLongitude: string;
    initialized: boolean;
    blockchainProperties: BlockchainProperties;
    constructor(id: number, blockchainProperties: BlockchainProperties);
}
