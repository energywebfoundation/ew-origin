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
import { ProducingAsset } from './ProducingAsset'
import { ConsumingAsset } from './ConsumingAsset'
import { BlockchainDataModelEntity } from './BlockchainDataModelEntity'

export interface AssetProperties {
      // GeneralInformation
      smartMeter: string
      owner: string
      operationalSince: number
      capacityWh: number
      lastSmartMeterReadWh?: number
      active: boolean
      lastSmartMeterReadFileHash?: string
      country: string
      region: string
      zip: string
      city: string
      street: string
      houseNumber: string
      gpsLatitude: string
      gpsLongitude: string
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


export abstract class Asset extends BlockchainDataModelEntity implements AssetProperties{


    id: number
    // GeneralInformation
    smartMeter: string
    owner: string

    operationalSince: number
    capacityWh: number
    lastSmartMeterReadWh: number
    active: boolean

    lastSmartMeterReadFileHash: string


    // Location
    country: string
    region: string
    zip: string
    city: string
    street: string
    houseNumber: string
    gpsLatitude: string
    gpsLongitude: string

    initialized: boolean;

    blockchainProperties: BlockchainProperties

    constructor(id: number, blockchainProperties: BlockchainProperties) {
        super(id, blockchainProperties)

        this.initialized = false
    }



    



}