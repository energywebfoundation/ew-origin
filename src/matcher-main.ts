// Copyright 2018 Energy Web Foundation
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
// @authors: slock.it GmbH, Heiko Burkhardt, heiko.burkhardt@slock.it

import Web3Type from './types/web3'
import * as fs from 'fs'
import * as DemandLogicTruffleBuild from '../contracts/DemandLogic.json';
import * as AssetProducingLogicTruffleBuild from '../contracts/AssetProducingRegistryLogic.json'
import * as CertificateLogicTruffleBuild from '../contracts/CertificateLogic.json'
import { Demand } from './blockchain-facade/Demand'
import { ContractEventHandler } from './blockchain-facade/ContractEventHandler'
import { Asset } from './blockchain-facade/Asset'
import { EventHandlerManager } from './blockchain-facade/EventHandlerManager'
import { MatchingManager } from './matching/MatchingManager'
import { SimpleMatcher } from './matching/SimpleMatcher';
import { BlockchainProperties } from './blockchain-facade/BlockchainProperties'
import { PrivateKeys } from './test-accounts'
const Web3 = require('web3')



const getInstanceFromTruffleBuild = (truffleBuild: any, web3: Web3Type) => {
    const address = Object.keys(truffleBuild.networks).length > 0 ? truffleBuild.networks[Object.keys(truffleBuild.networks)[0]].address : null
    return new web3.eth.Contract(truffleBuild.abi, address)
}

const initEventHandling = async (matchingManager: MatchingManager, blockchainProperties: BlockchainProperties) => {
    const demandContractEventHandler = new ContractEventHandler(blockchainProperties.demandLogicInstance, await blockchainProperties.web3.eth.getBlockNumber())

    demandContractEventHandler.onEvent('LogDemandFullyCreated', async (event) => {
        console.log('\n* Event: LogDemandFullyCreated demand: ' + event.returnValues.id)
        const newDemand = await new Demand(event.returnValues.id, blockchainProperties).syncWithBlockchain()
        matchingManager.registerDemand(newDemand)

    })

    demandContractEventHandler.onEvent('LogDemandExpired', async (event) => {
        console.log('\n* Event: LogDemandExpired demand: ' + event.returnValues._index)
        matchingManager.removeDemand(event.returnValues._index)

    })

    const assetContractEventHandler = new ContractEventHandler(blockchainProperties.assetLogicInstance, await blockchainProperties.web3.eth.getBlockNumber())

    assetContractEventHandler.onEvent('LogNewMeterRead', (event) => 
        matchingManager.match(event.returnValues._assetId, event.returnValues._newMeterRead - event.returnValues._oldMeterRead))

    assetContractEventHandler.onEvent('LogAssetFullyInitialized', async (event) => {
        console.log('\n* Event: LogAssetFullyInitialized asset: ' + event.returnValues.id)
        const newAsset = await new Asset(event.returnValues.id, blockchainProperties).syncWithBlockchain()
        matchingManager.registerAsset(newAsset)

    })

    assetContractEventHandler.onEvent('LogAssetSetActive' , async (event) => {
        console.log('\n* Event: LogAssetSetActive  asset: ' + event.returnValues._assetId)
   
        const asset = await (new Asset(event.returnValues._assetId, blockchainProperties)).syncWithBlockchain()
        matchingManager.registerAsset(asset)

  
    })

    assetContractEventHandler.onEvent('LogAssetSetInactive' , async (event) => {
        console.log('\n* Event: LogAssetSetInactive asset: ' + event.returnValues._assetId)

        matchingManager.removeAsset(event.returnValues._assetId)
        
    })
    
    const eventHandlerManager = new EventHandlerManager(4000, blockchainProperties)
    eventHandlerManager.registerEventHandler(demandContractEventHandler)
    eventHandlerManager.registerEventHandler(assetContractEventHandler)
    eventHandlerManager.start()
}

const initMatchingManager = async (blockchainProperties: BlockchainProperties) => {
    const matchingManager = new MatchingManager()
    matchingManager.setMatcher(new SimpleMatcher(blockchainProperties, matchingManager))
    console.log('\n* Getting all assets')
    const assetList = (await Asset.GET_ALL_ASSETS(blockchainProperties))
    assetList.forEach(async (asset: Asset) => matchingManager.registerAsset(asset))
    console.log('\n* Getting all active demands')
    const demandList = await Demand.GET_ALL_ACTIVE_DEMANDS(blockchainProperties)

    demandList.forEach(async (demand: Demand) => matchingManager.registerDemand(demand))
    
    return matchingManager
}

const main = async () => {
    const web3 = new Web3('http://localhost:8545')
    const wallet = await web3.eth.accounts.wallet.add(PrivateKeys[8])
    
    console.log('* Machter address: ' + wallet.address)

    const blockchainProperties: BlockchainProperties = {
        web3: web3,
        demandLogicInstance: await getInstanceFromTruffleBuild(DemandLogicTruffleBuild, web3),
        assetLogicInstance: await getInstanceFromTruffleBuild(AssetProducingLogicTruffleBuild, web3),
        certificateLogicInstance: await getInstanceFromTruffleBuild(CertificateLogicTruffleBuild, web3),
        matcherAccount: wallet.address
    }
   
    const matchingManager = await initMatchingManager(blockchainProperties)

    await initEventHandling(matchingManager, blockchainProperties)

}


main()




