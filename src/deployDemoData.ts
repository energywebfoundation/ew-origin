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

import { expect } from 'chai';
import 'mocha';
import Web3Type from './types/web3';
import { BlockchainProperties } from './blockchain-facade/BlockchainProperties'

import * as fs from 'fs';
import { deployCoo, deployContract, logicInit, initCoo } from './Deployment';
import { User, UserProperties } from './blockchain-facade/User';
import { ProducingAssetProperties, AssetType, Compliance, ProducingAsset } from './blockchain-facade/ProducingAsset'
import { ConsumingProperties, ConsumingAsset } from './blockchain-facade/ConsumingAsset'
import { DemandProperties, TimeFrame, Currency, Demand, FullDemandProperties } from './blockchain-facade/Demand';

const configFile = JSON.parse(fs.readFileSync('config/ewf-config.json', 'utf-8').toString());
const CertificateRegistryTruffleBuild = JSON.parse(fs.readFileSync('build/contracts/CertificateLogic.json', 'utf-8').toString());
const CertificateDBTruffleBuild = JSON.parse(fs.readFileSync('build/contracts/CertificateDB.json', 'utf-8').toString());
const CoOTruffleBuild = JSON.parse(fs.readFileSync('build/contracts/CoO.json', 'utf-8').toString());
const AssetConsumingRegistryDbTruffleBuild = JSON.parse(fs.readFileSync('build/contracts/AssetConsumingRegistryDb.json', 'utf-8').toString());
const AssetConsumingRegistryLogicTruffleBuild = JSON.parse(fs.readFileSync('build/contracts/AssetConsumingRegistryLogic.json', 'utf-8').toString());
const AssetProducingRegistryDbTruffleBuild = JSON.parse(fs.readFileSync('build/contracts/AssetProducingRegistryDb.json', 'utf-8').toString());
const AssetProducingRegistryLogicTruffleBuild = JSON.parse(fs.readFileSync('build/contracts/AssetProducingRegistryLogic.json', 'utf-8').toString());
const DemandDbTruffleBuild = JSON.parse(fs.readFileSync('build/contracts/DemandDb.json', 'utf-8').toString());
const DemandLogicTruffleBuild = JSON.parse(fs.readFileSync('build/contracts/DemandLogic.json', 'utf-8').toString());
const UserdDbTruffleBuild = JSON.parse(fs.readFileSync('build/contracts/UserDb.json', 'utf-8').toString());
const UserLogicTruffleBuild = JSON.parse(fs.readFileSync('build/contracts/UserLogic.json', 'utf-8').toString());

let blockchainProperties: BlockchainProperties;

const Web3 = require('web3')
const web3 = new Web3('http://localhost:8545');

const deployContracts = async () => {

    const CooAddress = await deployCoo(configFile.topAdminPrivateKey)
    console.log("Coo deployed: " + CooAddress)
    const assetConsumingLogicAddress = await deployContract(CooAddress, AssetConsumingRegistryLogicTruffleBuild, configFile.topAdminPrivateKey)
    console.log('AssetConsumingLogic deployed: ' + assetConsumingLogicAddress)
    const assetConsumingDBAddress = await deployContract(assetConsumingLogicAddress, AssetConsumingRegistryDbTruffleBuild, configFile.topAdminPrivateKey)
    console.log('AssetConsumingDB deployed: ' + assetConsumingDBAddress)
    const assetProducingLogicAddress = await deployContract(CooAddress, AssetProducingRegistryLogicTruffleBuild, configFile.topAdminPrivateKey)
    console.log('AssetProducingLogic deployed: ' + assetProducingLogicAddress)
    const assetProducingDBAddress = await deployContract(assetProducingLogicAddress, AssetProducingRegistryDbTruffleBuild, configFile.topAdminPrivateKey)
    console.log('AssetProducingDB deployed: ' + assetProducingDBAddress)
    const certificateLogicAddress = await deployContract(CooAddress, CertificateRegistryTruffleBuild, configFile.topAdminPrivateKey)
    console.log('CertificateLogic deployed: ' + certificateLogicAddress)
    const certificateDBAddress = await deployContract(certificateLogicAddress, CertificateDBTruffleBuild, configFile.topAdminPrivateKey)
    console.log('CertificateDB deployed: ' + certificateLogicAddress)
    const demandLogicAddress = await deployContract(CooAddress, DemandLogicTruffleBuild, configFile.topAdminPrivateKey)
    console.log('DemandLogic deployed: ' + demandLogicAddress)
    const demandDbAddress = await deployContract(demandLogicAddress, DemandDbTruffleBuild, configFile.topAdminPrivateKey)
    console.log('DemandDB deployed: ' + demandDbAddress)
    const userLogicAddress = await deployContract(CooAddress, UserLogicTruffleBuild, configFile.topAdminPrivateKey)
    console.log('UserLogic deployed: ' + userLogicAddress)
    const userDbAddress = await deployContract(userLogicAddress, UserdDbTruffleBuild, configFile.topAdminPrivateKey)
    console.log('UserDB deployed: ' + userDbAddress)

    console.log('init assetConsuming')
    await logicInit(assetConsumingLogicAddress, assetConsumingDBAddress, configFile.topAdminPrivateKey)
    console.log('init assetProducing')
    await logicInit(assetProducingLogicAddress, assetProducingDBAddress, configFile.topAdminPrivateKey)
    console.log('init certificate')
    await logicInit(certificateLogicAddress, certificateDBAddress, configFile.topAdminPrivateKey)
    console.log('init demand')
    await logicInit(demandLogicAddress, demandDbAddress, configFile.topAdminPrivateKey)
    console.log('init userlogic')
    await logicInit(userLogicAddress, userDbAddress, configFile.topAdminPrivateKey)
    console.log('init coo')
    await initCoo(CooAddress, userLogicAddress, assetProducingLogicAddress, certificateLogicAddress, demandLogicAddress, assetConsumingLogicAddress, configFile.topAdminPrivateKey)

    console.log("")
    return blockchainProperties = {
        web3: web3,
        producingAssetLogicInstance: new web3.eth.Contract((AssetProducingRegistryLogicTruffleBuild as any).abi, assetProducingLogicAddress),
        consumingAssetLogicInstance: new web3.eth.Contract((AssetConsumingRegistryLogicTruffleBuild as any).abi, assetConsumingLogicAddress),
        userLogicInstance: new web3.eth.Contract((UserLogicTruffleBuild as any).abi, userLogicAddress),
        demandLogicInstance: new web3.eth.Contract((DemandLogicTruffleBuild as any).abi, demandLogicAddress),
        certificateLogicInstance: new web3.eth.Contract((CertificateRegistryTruffleBuild as any).abi, certificateLogicAddress),

        topAdminAccount: configFile.topAdminAddress,
        privateKey: configFile.topAdminPrivateKey,
        userAdmin: configFile.topAdminAddress,
        assetAdminAccount: configFile.topAdminAddress
    }
}

const onboardUsers = async (blockchainProperties) => {
    for (const accountdata in configFile.accounts) {
        const userProps: UserProperties = {
            firstName: configFile.accounts[accountdata].firstName,
            surname: configFile.accounts[accountdata].surname,
            organization: configFile.accounts[accountdata].organization,
            street: configFile.accounts[accountdata].street,
            number: configFile.accounts[accountdata].number,
            zip: configFile.accounts[accountdata].zip,
            city: configFile.accounts[accountdata].city,
            country: configFile.accounts[accountdata].country,
            state: configFile.accounts[accountdata].state,
            accountAddress: configFile.accounts[accountdata].address,
            roles: configFile.accounts[accountdata].rights
        }

        await User.CREATE_USER_RAW(userProps, blockchainProperties)
        console.log(configFile.accounts[accountdata].firstName + " " + configFile.accounts[accountdata].surname + " ( " + configFile.accounts[accountdata].organization + " )" + " onboarded")
    }
    console.log("")
}

const onboardProducingAssets = async (blockchainProperties) => {
    for (const producingAssets in configFile.producingAssets) {

        let assetTypeConfig

        switch (configFile.producingAssets[producingAssets].assetType) {
            case "Wind": assetTypeConfig = AssetType.Wind
                break
            case "Solar": assetTypeConfig = AssetType.Solar
                break
            case "RunRiverHydro": assetTypeConfig = AssetType.RunRiverHydro
                break
            case "BiomassGas": assetTypeConfig = AssetType.BiomassGas
        }

        let assetCompliance

        switch (configFile.producingAssets[producingAssets].complianceRegistry) {
            case "IREC": assetCompliance = Compliance.IREC
                break
            case "EEC": assetCompliance = Compliance.EEC
                break
            case "TIGR": assetCompliance = Compliance.TIGR
                break
            default:
                assetCompliance = Compliance.none
                break
        }

        const assetProps: ProducingAssetProperties = {
            smartMeter: configFile.producingAssets[producingAssets].smartMeter,
            owner: configFile.producingAssets[producingAssets].owner,
            operationalSince: configFile.producingAssets[producingAssets].operationalSince,
            capacityWh: configFile.producingAssets[producingAssets].capacityWh,
            lastSmartMeterReadWh: configFile.producingAssets[producingAssets].lastSmartMeterReadWh,
            active: configFile.producingAssets[producingAssets].active,
            lastSmartMeterReadFileHash: configFile.producingAssets[producingAssets].lastSmartMeterReadFileHash,
            country: configFile.producingAssets[producingAssets].country,
            region: configFile.producingAssets[producingAssets].region,
            zip: configFile.producingAssets[producingAssets].zip,
            city: configFile.producingAssets[producingAssets].city,
            street: configFile.producingAssets[producingAssets].street,
            houseNumber: configFile.producingAssets[producingAssets].houseNumber,
            gpsLatitude: configFile.producingAssets[producingAssets].gpsLatitude,
            gpsLongitude: configFile.producingAssets[producingAssets].gpsLongitude,
            assetType: assetTypeConfig,
            certificatesCreatedForWh: configFile.producingAssets[producingAssets].certificatesCreatedForWh,
            lastSmartMeterCO2OffsetRead: configFile.producingAssets[producingAssets].lastSmartMeterCO2OffsetRead,
            cO2UsedForCertificate: configFile.producingAssets[producingAssets].cO2UsedForCertificate,
            complianceRegistry: assetCompliance,
            otherGreenAttributes: configFile.producingAssets[producingAssets].otherGreenAttributes,
            typeOfPublicSupport: configFile.producingAssets[producingAssets].typeOfPublicSupport
        }
        const onboardedAsset = await ProducingAsset.CREATE_ASSET_RAW(assetProps, blockchainProperties)
        console.log("Producingasset " + onboardedAsset.id + " onboarded")
    }

    console.log("")

}

const onboardConsumingAssets = async (blockchainProperties) => {
    for (const consumingAssets in configFile.consumingAssets) {
        const assetProps: ConsumingProperties = {
            smartMeter: configFile.consumingAssets[consumingAssets].smartMeter,
            owner: configFile.consumingAssets[consumingAssets].owner,
            operationalSince: configFile.consumingAssets[consumingAssets].operationalSince,
            capacityWh: configFile.consumingAssets[consumingAssets].capacityWh,
            lastSmartMeterReadWh: configFile.consumingAssets[consumingAssets].lastSmartMeterReadWh,
            active: configFile.consumingAssets[consumingAssets].active,
            lastSmartMeterReadFileHash: configFile.consumingAssets[consumingAssets].lastSmartMeterReadFileHash,
            country: configFile.consumingAssets[consumingAssets].country,
            region: configFile.consumingAssets[consumingAssets].region,
            zip: configFile.consumingAssets[consumingAssets].zip,
            city: configFile.consumingAssets[consumingAssets].city,
            street: configFile.consumingAssets[consumingAssets].street,
            houseNumber: configFile.consumingAssets[consumingAssets].houseNumber,
            gpsLatitude: configFile.consumingAssets[consumingAssets].gpsLatitude,
            gpsLongitude: configFile.consumingAssets[consumingAssets].gpsLongitude,
            maxCapacitySet: configFile.consumingAssets[consumingAssets].maxCapacitySet,
            certificatesUsedForWh: configFile.consumingAssets[consumingAssets].certificatesUsedForWh
        }
        const onboardedAsset = await ConsumingAsset.CREATE_ASSET_RAW(assetProps, blockchainProperties)
        console.log("Consumingasset " + onboardedAsset.id + " onboarded")
    }
    console.log("")

}



const main = async () => {
    //  console.log(configFile)

    const blockchainProperties = await deployContracts()

    await onboardUsers(blockchainProperties)
    await onboardProducingAssets(blockchainProperties)
    await onboardConsumingAssets(blockchainProperties)
    await onboardDemand(blockchainProperties, configFile.topAdminPrivateKey)
    await meterreadings(blockchainProperties)
}

const onboardDemand = async (blockchainProperties: BlockchainProperties, privateKey: string) => {
    for (const demandId in configFile.demands) {

        let timeFrameDemand: TimeFrame
        switch (configFile.demands[demandId].timeFrame) {
            case "yearly": timeFrameDemand = TimeFrame.yearly
                break
            case "monthly": timeFrameDemand = TimeFrame.monthly
                break
            default:
                timeFrameDemand = TimeFrame.daily
                break
        }

        let currencyDemand: Currency
        switch (configFile.demands[demandId].currency) {
            case "Euro": currencyDemand = Currency.Euro
                break
            case "USD": currencyDemand = Currency.USD
                break
            case "SingaporeDollar": currencyDemand = Currency.SingaporeDollar
                break
            default: currencyDemand = Currency.Ether
                break
        }

        let assetTypeConfig

        switch (configFile.demands[demandId].assettype) {
            case "Wind": assetTypeConfig = AssetType.Wind
                break
            case "Solar": assetTypeConfig = AssetType.Solar
                break
            case "RunRiverHydro": assetTypeConfig = AssetType.RunRiverHydro
                break
            case "BiomassGas": assetTypeConfig = AssetType.BiomassGas
        }

        let assetCompliance

        switch (configFile.demands[demandId].complianceRegistry) {
            case "IREC": assetCompliance = Compliance.IREC
                break
            case "EEC": assetCompliance = Compliance.EEC
                break
            case "TIGR": assetCompliance = Compliance.TIGR
                break
            default:
                assetCompliance = Compliance.none
                break
        }

        const demandProps: FullDemandProperties = {
            enabledProperties: configFile.demands[demandId].enabledProperties,
            originator: configFile.demands[demandId].originator,
            buyer: configFile.demands[demandId].buyer,
            startTime: configFile.demands[demandId].startTime,
            endTime: configFile.demands[demandId].endTime,
            timeframe: timeFrameDemand,
            pricePerCertifiedWh: configFile.demands[demandId].pricePerCertifiedWh,
            currency: currencyDemand,
            productingAsset: configFile.demands[demandId].producingAsset,
            consumingAsset: configFile.demands[demandId].consumingAsset,
            locationCountry: configFile.demands[demandId].locationCountry,
            locationRegion: configFile.demands[demandId].locationRegion,
            assettype: assetTypeConfig,
            minCO2Offset: configFile.demands[demandId].minCO2Offset,
            otherGreenAttributes: configFile.demands[demandId].otherGreenAttributes,
            typeOfPublicSupport: configFile.demands[demandId].typeOfPublicSupport,
            targetWhPerPeriod: configFile.demands[demandId].targetWhPerPeriod,
            matcher: configFile.demands[demandId].matcher,
            registryCompliance: assetCompliance
        }

        const onboardedDemand = await Demand.CREATE_DEMAND_RAW(demandProps, blockchainProperties, web3.eth.accounts.privateKeyToAccount('0x' + privateKey).address)
        console.log("Demand #" + onboardedDemand.id + " onboarded")
    }
    console.log("")



}

const meterreadings = async (blockchainProperties) => {

    for (const meterreading in configFile.energy) {

        const newBlockchainProps = { ...blockchainProperties }
        newBlockchainProps.privateKey = configFile.energy[meterreading].smartMeterPK

        const producingAsset = await (new ProducingAsset(configFile.energy[meterreading].assetId, newBlockchainProps)).syncWithBlockchain()
        console.log("before: " + producingAsset.lastSmartMeterReadWh)
        await producingAsset.saveSmartMeterRead(configFile.energy[meterreading].meterreading, configFile.energy[meterreading].filehash, configFile.energy[meterreading].co2Offset, newBlockchainProps)

        await producingAsset.syncWithBlockchain()
        console.log("after: " + producingAsset.lastSmartMeterReadWh)

    }

}

main()
