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

import Web3Type from './types/web3'
import { BlockchainProperties } from '../src/blockchain-facade//BlockchainProperties'
import * as fs from 'fs';
import { DemandLogicTruffleBuild, AssetProducingLogicTruffleBuild, AssetConsumingLogicTruffleBuild, CertificateLogicTruffleBuild, CoOTruffleBuild, UserLogicTruffleBuild } from '.'
import { DemandDBTruffleBuild, AssetProducingDBTruffleBuild, AssetConsumingDBTruffleBuild, CertificateDBTruffleBuild, UserDBTruffleBuild } from '.'
const EthereumTx = require('ethereumjs-tx')
const Web3 = require('web3')
const web3 = new Web3('http://localhost:8545')


let address = '0xd173313a51f8fc37bcf67569b463abd89d81844f'
let privateKey = 'd9066ff9f753a1898709b568119055660a77d9aae4d7a4ad677b8fb3d2a571e5'

const main = async () => {


    const CooAddress = await deployCoo()
    console.log('CoO deployed: ' + CooAddress)
    const assetConsumingLogicAddress = await deployContract(CooAddress, AssetConsumingLogicTruffleBuild)
    console.log('AssetConsumingLogic deployed: ' + assetConsumingLogicAddress)
    const assetConsumingDBAddress = await deployContract(assetConsumingLogicAddress, AssetConsumingDBTruffleBuild)
    console.log('AssetConsumingDB deployed: ' + assetConsumingDBAddress)
    const assetProducingLogicAddress = await deployContract(CooAddress, AssetProducingLogicTruffleBuild)
    console.log('AssetProducingLogic deployed: ' + assetProducingLogicAddress)
    const assetProducingDBAddress = await deployContract(assetProducingLogicAddress, AssetProducingDBTruffleBuild)
    console.log('AssetProducingDB deployed: ' + assetProducingDBAddress)
    const certificateLogicAddress = await deployContract(CooAddress, CertificateLogicTruffleBuild)
    console.log('CertificateLogic deployed: ' + certificateLogicAddress)
    const certificateDBAddress = await deployContract(certificateLogicAddress, CertificateDBTruffleBuild)
    console.log('CertificateDB deployed: ' + certificateLogicAddress)
    const demandLogicAddress = await deployContract(CooAddress, DemandLogicTruffleBuild)
    console.log('DemandLogic deployed: ' + demandLogicAddress)
    const demandDbAddress = await deployContract(demandLogicAddress, DemandDBTruffleBuild)
    console.log('DemandDB deployed: ' + demandDbAddress)
    const userLogicAddress = await deployContract(CooAddress, UserLogicTruffleBuild)
    console.log('UserLogic deployed: ' + userLogicAddress)
    const userDbAddress = await deployContract(userLogicAddress, UserDBTruffleBuild)
    console.log('UserDB deployed: ' + userDbAddress)

    console.log('init assetConsuming')
    await logicInit(assetConsumingLogicAddress, assetConsumingDBAddress)
    console.log('init assetProducing')
    await logicInit(assetProducingLogicAddress, assetProducingDBAddress)
    console.log('init certificate')
    await logicInit(certificateLogicAddress, certificateDBAddress)
    console.log('init demand')
    await logicInit(demandLogicAddress, demandDbAddress)
    console.log('init userlogic')
    await logicInit(userLogicAddress, userDbAddress)
    console.log('init coo')
    await initCoo(CooAddress, userLogicAddress, assetProducingLogicAddress, certificateLogicAddress, demandLogicAddress, assetConsumingLogicAddress)


}

export const deployContract = async (CoO, TruffleBuild, privateKeyAdmin?: string) => {

    if (privateKeyAdmin) {
        privateKey = privateKeyAdmin
        address = web3.eth.accounts.privateKeyToAccount('0x' + privateKey).address
    }

    let encode = web3.eth.abi.encodeParameters(['address'], [CoO]);

    encode = encode.substr(2)
    const txCount = await web3.eth.getTransactionCount(address)

    const txData = {
        nonce: web3.utils.toHex(txCount),
        gasLimit: web3.utils.toHex(7000000),
        gasPrice: web3.utils.toHex(0), // 10 Gwei
        data: TruffleBuild.bytecode + encode,
        from: address
    }

    const pk = Buffer.from(privateKey, 'hex')
    const transaction = new EthereumTx(txData)

    transaction.sign(Buffer.from(privateKey, 'hex'));
    const serializedTx = transaction.serialize().toString('hex')

    const tx = (await web3.eth.sendSignedTransaction('0x' + serializedTx))

    return tx.contractAddress
}

export const deployCoo = async (privateKeyAdmin?: string) => {

    if (privateKeyAdmin) {
        privateKey = privateKeyAdmin
        address = web3.eth.accounts.privateKeyToAccount('0x' + privateKey).address
    }
    const txCount = await web3.eth.getTransactionCount(address)
    const txData = {
        nonce: web3.utils.toHex(txCount),
        gasLimit: web3.utils.toHex(7000000),
        gasPrice: web3.utils.toHex(0), // 10 Gwei
        data: (CoOTruffleBuild as any).bytecode,
        from: address
    }

    const pk = Buffer.from(privateKey, 'hex')
    const transaction = new EthereumTx(txData)

    transaction.sign(Buffer.from(privateKey, 'hex'));
    const serializedTx = transaction.serialize().toString('hex')

    const CooTx = (await web3.eth.sendSignedTransaction('0x' + serializedTx))

    return CooTx.contractAddress
}

export const logicInit = async (logicaddress, dbAddress, privateKeyAdmin?: string) => {
    if (privateKeyAdmin) {
        privateKey = privateKeyAdmin
        address = web3.eth.accounts.privateKeyToAccount('0x' + privateKey).address
    }
    const txCount = await web3.eth.getTransactionCount(address)

    const txdata = web3.eth.abi.encodeFunctionCall({
        name: 'init',
        type: 'function',
        inputs: [{
            "name": "_dbAddress",
            "type": "address"
        }]
    }, [dbAddress]);

    const txData = {
        nonce: web3.utils.toHex(txCount),
        gasLimit: web3.utils.toHex(7000000),
        gasPrice: web3.utils.toHex(0), // 10 Gwei
        data: txdata,
        from: address,
        to: logicaddress
    }

    const pk = Buffer.from(privateKey, 'hex')
    const transaction = new EthereumTx(txData)

    transaction.sign(Buffer.from(privateKey, 'hex'));
    const serializedTx = transaction.serialize().toString('hex')

    const tx = (await web3.eth.sendSignedTransaction('0x' + serializedTx))

}
export const initCoo = async (cooAddress, userlogic, assetProducingRegistryLogic, certificateLogic, demandLogics, assetConsumingRegistryLogic, privateKeyAdmin?: string) => {
    if (privateKeyAdmin) {
        privateKey = privateKeyAdmin
        address = web3.eth.accounts.privateKeyToAccount('0x' + privateKey).address
    }
    const txCount = await web3.eth.getTransactionCount(address)

    const txdata = web3.eth.abi.encodeFunctionCall({
        name: 'init',
        type: 'function',
        inputs: [
            {
                "name": "_userRegistry",
                "type": "address"
            },
            {
                "name": "_assetProducingRegistry",
                "type": "address"
            },
            {
                "name": "_certificateRegistry",
                "type": "address"
            },
            {
                "name": "_demandRegistry",
                "type": "address"
            },
            {
                "name": "_assetConsumingRegistry",
                "type": "address"
            }
        ]
    }, [userlogic, assetProducingRegistryLogic, certificateLogic, demandLogics, assetConsumingRegistryLogic]);

    const txData = {
        nonce: web3.utils.toHex(txCount),
        gasLimit: web3.utils.toHex(7000000),
        gasPrice: web3.utils.toHex(0), // 10 Gwei
        data: txdata,
        from: address,
        to: cooAddress
    }

    const pk = Buffer.from(privateKey, 'hex')
    const transaction = new EthereumTx(txData)

    transaction.sign(Buffer.from(privateKey, 'hex'));
    const serializedTx = transaction.serialize().toString('hex')

    const tx = (await web3.eth.sendSignedTransaction('0x' + serializedTx))
}


