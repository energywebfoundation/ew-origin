import { BlockchainProperties } from './BlockchainProperties';
export interface CertificateProperties {
    assetId: number;
    owner: string;
    powerInW: number;
    retired: boolean;
    dataLog: string;
    coSaved: number;
}
export declare class Certificate implements CertificateProperties {
    id: number;
    assetId: number;
    owner: string;
    powerInW: number;
    retired: boolean;
    dataLog: string;
    coSaved: number;
    creationTime: number;
    escrow: string;
    blockchainProperties: BlockchainProperties;
    constructor(id: number, blockchainProperties: BlockchainProperties);
    static GET_CERTIFICATE_LIST_LENGTH(blockchainProperties: BlockchainProperties): Promise<number>;
    static GET_ALL_CERTIFICATES(blockchainProperties: BlockchainProperties): Promise<Certificate[]>;
    static GET_ALL_CERTIFICATES_OWNED_BY(owner: string, blockchainProperties: BlockchainProperties): Promise<Certificate[]>;
    static GET_ALL_CERTIFICATES_WITH_ESCROW(escrow: string, blockchainProperties: BlockchainProperties): Promise<Certificate[]>;
    syncWithBlockchain(): Promise<Certificate>;
    claim(account: string): Promise<void>;
    getCertificateEvents(): Promise<any>;
}
