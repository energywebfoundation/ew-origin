import Web3Type from '../types/web3';
export interface BlockchainProperties {
    web3: Web3Type;
    cooInstance?: any;
    demandLogicInstance?: any;
    producingAssetLogicInstance?: any;
    consumingAssetLogicInstance?: any;
    certificateLogicInstance?: any;
    userLogicInstance?: any;
    matcherAccount?: string;
    assetAdminAccount?: string;
    topAdminAccount?: string;
    agreementAdmin?: string;
    userAdmin?: string;
    privateKey?: string;
}
