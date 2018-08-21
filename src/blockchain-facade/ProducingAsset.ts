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
import { Transaction } from '../types/types';
import { sendRawTx } from './RawTransaction'
export interface ProducingAssetProperties extends AssetProperties {
    // GeneralInformation

    assetType?: AssetType
    certificatesCreatedForWh?: number
    lastSmartMeterCO2OffsetRead?: number
    cO2UsedForCertificate?: number
    complianceRegistry?: Compliance
    otherGreenAttributes?: string
    typeOfPublicSupport?: string

}

export enum AssetType {
    Wind,
    Solar,
    RunRiverHydro,
    BiomassGas
}

export enum Compliance {
    none,
    IREC,
    EEC,
    TIGR
}


export class ProducingAsset extends Asset implements ProducingAssetProperties {

    assetType: AssetType
    certificatesCreatedForWh: number
    lastSmartMeterReadFileHash: string
    lastSmartMeterCO2OffsetRead: number
    cO2UsedForCertificate: number
    complianceRegistry: Compliance
    otherGreenAttributes: string
    typeOfPublicSupport: string

    static async GET_ASSET_LIST_LENGTH(blockchainProperties: BlockchainProperties) {

        return parseInt(await blockchainProperties.producingAssetLogicInstance.methods.getAssetListLength().call(), 10)
    }

    static async GET_ALL_ASSETS(blockchainProperties: BlockchainProperties) {

        const assetsPromises = Array(await ProducingAsset.GET_ASSET_LIST_LENGTH(blockchainProperties))
            .fill(null)
            .map((item, index) => (new ProducingAsset(index, blockchainProperties)).syncWithBlockchain())

        return Promise.all(assetsPromises)

    }

    static async GET_ALL_ASSET_OWNED_BY(owner: string, blockchainProperties: BlockchainProperties) {
        return (await ProducingAsset.GET_ALL_ASSETS(blockchainProperties))
            .filter((asset: ProducingAsset) => asset.owner.toLowerCase() === owner.toLowerCase())
    }

    static async CREATE_ASSET(assetProperties: ProducingAssetProperties, blockchainProperties: BlockchainProperties): Promise<ProducingAsset> {

        const gasCreate = await blockchainProperties.producingAssetLogicInstance.methods
            .createAsset()
            .estimateGas({ from: blockchainProperties.assetAdminAccount })
        const txCreate = await blockchainProperties.producingAssetLogicInstance.methods
            .createAsset()
            .send({ from: blockchainProperties.assetAdminAccount, gas: Math.round(gasCreate * 1.1) })

        const assetId = parseInt(txCreate.events.LogAssetCreated.returnValues._assetId, 10)

        const initGeneralParams = [
            assetId,
            assetProperties.smartMeter,
            assetProperties.owner,
            assetProperties.operationalSince,
            assetProperties.active
        ]


        const gasInitGeneral = await blockchainProperties.producingAssetLogicInstance.methods
            .initGeneral(...initGeneralParams)
            .estimateGas({ from: blockchainProperties.assetAdminAccount })

        const txInitGeneral = await blockchainProperties.producingAssetLogicInstance.methods
            .initGeneral(...initGeneralParams)
            .send({ from: blockchainProperties.assetAdminAccount, gas: Math.round(gasInitGeneral * 1.1) })

        const initProducingPrams = [
            assetId,
            assetProperties.assetType,
            assetProperties.capacityWh,
            assetProperties.complianceRegistry,
            blockchainProperties.web3.utils.fromUtf8(assetProperties.otherGreenAttributes),
            blockchainProperties.web3.utils.fromUtf8(assetProperties.typeOfPublicSupport)
        ]
        const gasInitProducing = await blockchainProperties.producingAssetLogicInstance.methods
            .initProducingProperties(...initProducingPrams)
            .estimateGas({ from: blockchainProperties.assetAdminAccount })

        const txInitProducing = await blockchainProperties.producingAssetLogicInstance.methods
            .initProducingProperties(...initProducingPrams)
            .send({ from: blockchainProperties.assetAdminAccount, gas: Math.round(gasInitProducing * 1.1) })

        const initLocationParams = [
            assetId,
            blockchainProperties.web3.utils.fromUtf8(assetProperties.country),
            blockchainProperties.web3.utils.fromUtf8(assetProperties.region),
            blockchainProperties.web3.utils.fromUtf8(assetProperties.zip),
            blockchainProperties.web3.utils.fromUtf8(assetProperties.city),
            blockchainProperties.web3.utils.fromUtf8(assetProperties.street),
            blockchainProperties.web3.utils.fromUtf8(assetProperties.houseNumber),
            blockchainProperties.web3.utils.fromUtf8(assetProperties.gpsLatitude),
            blockchainProperties.web3.utils.fromUtf8(assetProperties.gpsLongitude)
        ]

        const gasInitLocation = await blockchainProperties.producingAssetLogicInstance.methods
            .initLocation(...initLocationParams)
            .estimateGas({ from: blockchainProperties.assetAdminAccount })

        const txInitLocation = await blockchainProperties.producingAssetLogicInstance.methods
            .initLocation(...initLocationParams)
            .send({ from: blockchainProperties.assetAdminAccount, gas: Math.round(gasInitLocation * 1.1) })

        return (new ProducingAsset(assetId, blockchainProperties)).syncWithBlockchain()

    }

    async saveSmartMeterRead(_newMeterRead, _lastSmartMeterReadFileHash, _CO2OffsetMeterRead, blockchainProperties) {

        const account = blockchainProperties.web3.eth.accounts.privateKeyToAccount("0x" + blockchainProperties.privateKey).address;

        const txdata = this.blockchainProperties.producingAssetLogicInstance.methods.saveSmartMeterRead(this.id,
            _newMeterRead, false, _lastSmartMeterReadFileHash, _CO2OffsetMeterRead, false)
            .encodeABI()

        const txGas = await this.blockchainProperties.producingAssetLogicInstance.methods.saveSmartMeterRead(this.id,
            _newMeterRead, false, _lastSmartMeterReadFileHash, _CO2OffsetMeterRead, false)
            .estimateGas({ from: account })

        const tx = await sendRawTx(account, await blockchainProperties.web3.eth.getTransactionCount(
            account), Math.round(txGas * 1.1), txdata, blockchainProperties, blockchainProperties.producingAssetLogicInstance._address)

    }

    async syncWithBlockchain(): Promise<ProducingAsset> {
        if (this.id != null) {
            const structDataPromises = []
            structDataPromises.push(this.blockchainProperties.producingAssetLogicInstance.methods.getAssetGeneral(this.id).call())
            structDataPromises.push(this.blockchainProperties.producingAssetLogicInstance.methods.getAssetProducingProperties(this.id).call())
            structDataPromises.push(this.blockchainProperties.producingAssetLogicInstance.methods.getAssetLocation(this.id).call())


            const demandData = await Promise.all(structDataPromises)

            this.smartMeter = demandData[0]._smartMeter
            this.owner = demandData[0]._owner
            this.operationalSince = parseInt(demandData[0]._operationalSince, 10)
            this.lastSmartMeterReadWh = parseInt(demandData[0]._lastSmartMeterReadWh, 10)
            this.active = demandData[0]._active
            this.lastSmartMeterReadFileHash = demandData[0]._lastSmartMeterReadFileHash

            this.assetType = parseInt(demandData[1].assetType, 10)
            this.capacityWh = parseInt(demandData[1].capacityWh, 10)
            this.certificatesCreatedForWh = parseInt(demandData[1].certificatesCreatedForWh, 10)
            this.lastSmartMeterCO2OffsetRead = parseInt(demandData[1].lastSmartMeterCO2OffsetRead, 10)
            this.cO2UsedForCertificate = parseInt(demandData[1].cO2UsedForCertificate, 10)
            this.complianceRegistry = parseInt(demandData[1].registryCompliance, 10)
            this.otherGreenAttributes = this.blockchainProperties.web3.utils.hexToUtf8(demandData[1].otherGreenAttributes)
            this.typeOfPublicSupport = this.blockchainProperties.web3.utils.hexToUtf8(demandData[1].typeOfPublicSupport)

            // Location
            this.country = this.blockchainProperties.web3.utils.hexToUtf8(demandData[2].country)
            this.region = this.blockchainProperties.web3.utils.hexToUtf8(demandData[2].region)
            this.zip = this.blockchainProperties.web3.utils.hexToUtf8(demandData[2].zip)
            this.city = this.blockchainProperties.web3.utils.hexToUtf8(demandData[2].city)
            this.street = this.blockchainProperties.web3.utils.hexToUtf8(demandData[2].street)
            this.houseNumber = this.blockchainProperties.web3.utils.hexToUtf8(demandData[2].houseNumber)
            this.gpsLatitude = this.blockchainProperties.web3.utils.hexToUtf8(demandData[2].gpsLatitude)
            this.gpsLongitude = this.blockchainProperties.web3.utils.hexToUtf8(demandData[2].gpsLongitude)

            this.initialized = true


        }
        return this
    }

    getCoSaved(wh: number): number {
        const lastRead = this.lastSmartMeterReadWh
        const lastUsedWh = this.certificatesCreatedForWh
        const availableWh = lastRead - lastUsedWh


        if (availableWh == 0) {
            return 0
        }

        const coRead = this.lastSmartMeterCO2OffsetRead
        const coUsed = this.cO2UsedForCertificate
        const availableCo = coRead - coUsed

        return (availableCo * ((wh * 1000000) / availableWh)) / 1000000;
    }

    async getAssetEvents() {

        return (await this.blockchainProperties.producingAssetLogicInstance.getPastEvents('allEvents', {
            fromBlock: 0,
            toBlock: 'latest',
            //     topics: [null, this.blockchainProperties.web3.utils.padLeft(this.blockchainProperties.web3.utils.fromDecimal(this.id), 64, '0'), null]
            topics: [null, this.blockchainProperties.web3.utils.padLeft(this.blockchainProperties.web3.utils.fromDecimal(this.id), 64, '0')]
        }))
    }

    async getEventWithFileHash(fileHash) {

        return (await this.blockchainProperties.producingAssetLogicInstance.getPastEvents('allEvents', {
            fromBlock: 0,
            toBlock: 'latest',
            topics: [null, this.blockchainProperties.web3.utils.padLeft(this.blockchainProperties.web3.utils.fromDecimal(this.id), 64, '0'), fileHash]
        }))
    }

    static async CREATE_ASSET_RAW(assetProperties: ProducingAssetProperties, blockchainProperties: BlockchainProperties): Promise<ProducingAsset> {

        const gasCreate = await blockchainProperties.producingAssetLogicInstance.methods
            .createAsset()
            .estimateGas({ from: blockchainProperties.assetAdminAccount })
        const txCreate = await blockchainProperties.producingAssetLogicInstance.methods
            .createAsset()
            .encodeABI()

        const tx = await sendRawTx(blockchainProperties.assetAdminAccount, await blockchainProperties.web3.eth.getTransactionCount(blockchainProperties.assetAdminAccount), Math.round(gasCreate * 1.1), txCreate, blockchainProperties, blockchainProperties.producingAssetLogicInstance._address)


        const assetId = Number(tx.logs[0].topics[1])


        const initGeneralParams = [
            assetId,
            assetProperties.smartMeter,
            assetProperties.owner,
            assetProperties.operationalSince,
            assetProperties.active
        ]

        const gasInitGeneral = await blockchainProperties.producingAssetLogicInstance.methods
            .initGeneral(...initGeneralParams)
            .estimateGas({ from: blockchainProperties.assetAdminAccount })

        const txInitGeneral = await blockchainProperties.producingAssetLogicInstance.methods
            .initGeneral(...initGeneralParams)
            .encodeABI()

        const initProducingPrams = [
            assetId,
            assetProperties.assetType,
            assetProperties.capacityWh,
            assetProperties.complianceRegistry,
            blockchainProperties.web3.utils.fromUtf8(assetProperties.otherGreenAttributes),
            blockchainProperties.web3.utils.fromUtf8(assetProperties.typeOfPublicSupport)
        ]
        const gasInitProducing = await blockchainProperties.producingAssetLogicInstance.methods
            .initProducingProperties(...initProducingPrams)
            .estimateGas({ from: blockchainProperties.assetAdminAccount })

        const txInitProducing = await blockchainProperties.producingAssetLogicInstance.methods
            .initProducingProperties(...initProducingPrams)
            .encodeABI()


        const initLocationParams = [
            assetId,
            blockchainProperties.web3.utils.fromUtf8(assetProperties.country),
            blockchainProperties.web3.utils.fromUtf8(assetProperties.region),
            blockchainProperties.web3.utils.fromUtf8(assetProperties.zip),
            blockchainProperties.web3.utils.fromUtf8(assetProperties.city),
            blockchainProperties.web3.utils.fromUtf8(assetProperties.street),
            blockchainProperties.web3.utils.fromUtf8(assetProperties.houseNumber),
            blockchainProperties.web3.utils.fromUtf8(assetProperties.gpsLatitude),
            blockchainProperties.web3.utils.fromUtf8(assetProperties.gpsLongitude)
        ]

        const gasInitLocation = await blockchainProperties.producingAssetLogicInstance.methods
            .initLocation(...initLocationParams)
            .estimateGas({ from: blockchainProperties.assetAdminAccount })
        const txInitLocation = await blockchainProperties.producingAssetLogicInstance.methods
            .initLocation(...initLocationParams)
            .encodeABI()

        const txCount = await blockchainProperties.web3.eth.getTransactionCount(blockchainProperties.assetAdminAccount)
        await sendRawTx(blockchainProperties.assetAdminAccount, txCount, Math.round(gasInitGeneral * 1.1), txInitGeneral, blockchainProperties, blockchainProperties.producingAssetLogicInstance._address)
        await sendRawTx(blockchainProperties.assetAdminAccount, txCount + 1, Math.round(gasInitProducing * 1.1), txInitProducing, blockchainProperties, blockchainProperties.producingAssetLogicInstance._address)
        await sendRawTx(blockchainProperties.assetAdminAccount, txCount + 2, Math.round(gasInitLocation * 1.1), txInitLocation, blockchainProperties, blockchainProperties.producingAssetLogicInstance._address)

        return (new ProducingAsset(assetId, blockchainProperties)).syncWithBlockchain()

    }



}