import Web3Type from '../types/web3'
import { BlockchainProperties } from './BlockchainProperties'
import { Asset, AssetProperties } from './Asset'
import { access } from 'fs';
import { Transaction, TransactionReceipt } from '../types/types';
const EthereumTx = require('ethereumjs-tx')

export async function sendRawTx(sender: string, nonce: number, gas: number, txdata: string, blockchainProperties: BlockchainProperties, to?: string): Promise<TransactionReceipt> {
    const txData = {
        nonce: blockchainProperties.web3.utils.toHex(nonce),
        gasLimit: blockchainProperties.web3.utils.toHex(gas * 2),
        gasPrice: blockchainProperties.web3.utils.toHex(0), // 10 Gwei
        data: txdata,
        from: sender,
        to: to
    }

    const transaction = new EthereumTx(txData)
    const privateKey = Buffer.from(blockchainProperties.privateKey, 'hex')

    transaction.sign(privateKey);
    const serializedTx = transaction.serialize().toString('hex')

    return (await blockchainProperties.web3.eth.sendSignedTransaction('0x' + serializedTx))

} 