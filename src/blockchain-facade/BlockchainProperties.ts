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

export interface BlockchainProperties {
    web3: Web3Type,
    cooInstance?: any,
    demandLogicInstance?: any,
    producingAssetLogicInstance?: any,
    consumingAssetLogicInstance?: any,
    certificateLogicInstance?: any,
    userLogicInstance?: any,
    matcherAccount?: string,
    assetAdminAccount?: string,
    topAdminAccount?: string,
    agreementAdmin?: string,
    userAdmin?: string,
    privateKey?: string
}