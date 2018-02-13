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
import { Demand } from './blockchain-facade/Demand'
const Web3 = require('web3')

const web3 = new Web3('http://localhost:8545')
const demandLogicTruffleBuild = <any>DemandLogicTruffleBuild
const demandLogicAddress = Object.keys(demandLogicTruffleBuild.networks).length > 0 ? demandLogicTruffleBuild.networks[Object.keys(demandLogicTruffleBuild.networks)[0]].address : null

const demandLogicInstance = new web3.eth.Contract(demandLogicTruffleBuild.abi, demandLogicAddress)

const getAllDemandListLength = async () => {
    console.log(await Demand.GET_ALL_DEMAND_LIST_LENGTH(demandLogicInstance))
    const testDemand = new Demand(web3.utils.asciiToHex('Test1'))
    console.log(await testDemand.syncWithBlockchain(demandLogicInstance, web3))
}


getAllDemandListLength()




