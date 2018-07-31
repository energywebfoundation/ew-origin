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
import { ContractEventHandler } from './ContractEventHandler'
import { BlockchainProperties } from './BlockchainProperties'

export class EventHandlerManager {
    private contractEventHandlers: ContractEventHandler[]
    private tickTime: number
    private running: boolean
    private blockchainProperties: BlockchainProperties

    constructor(tickTime: number, blockchainProperties: BlockchainProperties) {
        this.tickTime = tickTime
        this.blockchainProperties = blockchainProperties
        this.contractEventHandlers = []
    }

    registerEventHandler(eventHandler: ContractEventHandler) {
        this.contractEventHandlers.push(eventHandler)
    }

    start() {
        this.running = true
        this.loop()
    
    }

    stop() {
        this.running = false
    }

    async loop() {
        while (this.running) {
            this.contractEventHandlers.forEach((eventHandler: ContractEventHandler) => eventHandler.tick(this.blockchainProperties))
            await this.sleep(this.tickTime)
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }

}