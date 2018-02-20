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
import * as AssetLogicTruffleBuild from '../contracts/AssetRegistryLogic.json'
import { Demand } from './blockchain-facade/Demand'
import { ContractEventHandler } from './blockchain-facade/ContractEventHandler'
import { Asset } from './blockchain-facade/Asset'
import { EventHandlerManager } from './blockchain-facade/EventHandlerManager'
import { MatchingManager } from './matching/MatchingManager'
import { SimpleMatcher } from './matching/SimpleMatcher';
import { BlockchainProperties } from './blockchain-facade/BlockchainProperties'
const Web3 = require('web3')


const web3 = new Web3('http://localhost:8545')
const demandLogicTruffleBuild = <any>DemandLogicTruffleBuild
const demandLogicAddress = Object.keys(demandLogicTruffleBuild.networks).length > 0 ? demandLogicTruffleBuild.networks[Object.keys(demandLogicTruffleBuild.networks)[0]].address : null

const demandLogicInstance = new web3.eth.Contract(demandLogicTruffleBuild.abi, demandLogicAddress)

const getInstanceFromTruffleBuild = (truffleBuild: any, web3: Web3Type) => {
    const address = Object.keys(truffleBuild.networks).length > 0 ? truffleBuild.networks[Object.keys(truffleBuild.networks)[0]].address : null
    return new web3.eth.Contract(truffleBuild.abi, address)
}

const main = async () => {
    const web3 = new Web3('http://localhost:8545')
    const wallet = await web3.eth.accounts.wallet.add('0x8ea9433b2427fd670f74f57f5e79b56df83bf4571e93003737ea8271d58b128a')
    console.log('# Machter wallet:')
    console.log(wallet)
    const blockchainProperties: BlockchainProperties = {
        web3: web3,
        demandLogicInstance: await getInstanceFromTruffleBuild(DemandLogicTruffleBuild, web3),
        assetLogicInstance: await getInstanceFromTruffleBuild(AssetLogicTruffleBuild, web3),
        matcherAccount: wallet.address
    }
   

    const matchingManager = new MatchingManager(new SimpleMatcher(blockchainProperties))
    console.log('# Getting all assets')
    matchingManager.assets = await Asset.GET_ALL_ASSETS(blockchainProperties)
    console.log('# Getting all active demands')
    matchingManager.demands = await Demand.GET_ALL_ACTIVE_DEMANDS(blockchainProperties)
   

    //const demandContractEventHandler = new ContractEventHandler(demandLogicInstance, 0)
    //demandContractEventHandler.onAnyContractEvent((event) => console.log(event))

    const assetContractEventHandler = new ContractEventHandler(blockchainProperties.assetLogicInstance, await web3.eth.getBlockNumber())
    assetContractEventHandler.onEvent('LogNewMeterRead', (event) => matchingManager.match(event.returnValues._assetId, event.returnValues._newMeterRead - event.returnValues._oldMeterRead))

    const eventHandlerManager = new EventHandlerManager(4000, blockchainProperties)
    //eventHandlerManager.registerEventHandler(demandContractEventHandler)
    eventHandlerManager.registerEventHandler(assetContractEventHandler)
    eventHandlerManager.start()
    

   // const asset = await (new Asset(0, blockchainProperties)).syncWithBlockchain()

    //console.log(await Demand.GET_ALL_DEMAND_LIST_LENGTH(demandLogicInstance))
    //console.log(await Demand.GET_ALL_ACTIVE_DEMANDS(demandLogicInstance, web3))
}


main()




