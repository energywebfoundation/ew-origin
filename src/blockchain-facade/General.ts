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

import { BlockchainProperties } from './BlockchainProperties'

export namespace General {


    export async function createCertificateForAssetOwner(blockchainProperties: BlockchainProperties, wh: number, assetId: number) { 

        const gas = await blockchainProperties.certificateLogicInstance.methods
            .createCertificateForAssetOwner(assetId, wh)
            .estimateGas({from: blockchainProperties.matcherAccount})
        
        const tx = await blockchainProperties.certificateLogicInstance.methods
             .createCertificateForAssetOwner(assetId, wh)
             .send({from: blockchainProperties.matcherAccount, gas: Math.round(gas * 1.1)})
   
        return tx
    }

}