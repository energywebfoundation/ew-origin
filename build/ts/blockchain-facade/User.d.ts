import { BlockchainProperties } from './BlockchainProperties';
export declare enum Roles {
    TopAdmin = 0,
    UserAdmin = 1,
    AssetAdmin = 2,
    AgreementAdmin = 3,
    AssetManager = 4,
    Trader = 5,
    Matcher = 6,
}
export interface UserProperties {
    accountAddress: string;
    firstName: string;
    surname: string;
    organization: string;
    street: string;
    number: string;
    zip: string;
    city: string;
    country: string;
    state: string;
    roles: number;
}
export declare class User implements UserProperties {
    accountAddress: string;
    firstName: string;
    surname: string;
    organization: string;
    street: string;
    number: string;
    zip: string;
    city: string;
    country: string;
    state: string;
    roles: number;
    active: boolean;
    blockchainProperties: BlockchainProperties;
    constructor(accountAddress: string, blockchainProperties: BlockchainProperties);
    static CREATE_USER(userProperties: UserProperties, blockchainProperties: BlockchainProperties): Promise<User>;
    static CREATE_USER_RAW(userProperties: UserProperties, blockchainProperties: BlockchainProperties): Promise<User>;
    syncWithBlockchain(): Promise<User>;
}
