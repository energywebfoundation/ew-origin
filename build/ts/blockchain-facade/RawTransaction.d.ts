import { BlockchainProperties } from './BlockchainProperties';
import { TransactionReceipt } from '../types/types';
export declare function sendRawTx(sender: string, nonce: number, gas: number, txdata: string, blockchainProperties: BlockchainProperties, to?: string): Promise<TransactionReceipt>;
