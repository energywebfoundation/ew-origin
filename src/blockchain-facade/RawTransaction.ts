// Copyright 2018 Energy Web Foundation
//
// This file is part of the Origin Application brought to you by the Energy Web Foundation,
// a global non-profit organization focused on accelerating blockchain technology across the energy sector, 
// incorporated in Zug, Switzerland.
//
// The Origin Application is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// This is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY and without an implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details, at <http://www.gnu.org/licenses/>.
//

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