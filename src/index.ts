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

export { Asset, AssetProperties, AssetType, Compliance } from './blockchain-facade/Asset'
export { Certificate, CertificateProperties } from './blockchain-facade/Certificate'
export { ProducingAsset, ProducingAssetProperties } from './blockchain-facade/ProducingAsset'
export { ConsumingAsset, ConsumingProperties } from './blockchain-facade/ConsumingAsset'
export { Demand, TimeFrame, Currency, DemandProperties, FullDemandProperties } from './blockchain-facade/Demand'
export { BlockchainProperties } from './blockchain-facade/BlockchainProperties'
export { ContractEventHandler } from './blockchain-facade/ContractEventHandler'
export { EventHandlerManager } from './blockchain-facade/EventHandlerManager'
export { User } from './blockchain-facade/User'
export { General } from './blockchain-facade/General'
export { deployContract, deployCoo, logicInit, initCoo } from "./Deployment"

import * as DemandLogicTruffleBuild from '../contracts/DemandLogic.json';
import * as AssetProducingLogicTruffleBuild from '../contracts/AssetProducingRegistryLogic.json'
import * as AssetConsumingLogicTruffleBuild from '../contracts/AssetConsumingRegistryLogic.json'
import * as CertificateLogicTruffleBuild from '../contracts/CertificateLogic.json'
import * as CoOTruffleBuild from '../contracts/CoO.json'
import * as UserLogicTruffleBuild from '../contracts/UserLogic.json'

import * as DemandDBTruffleBuild from '../contracts/DemandDB.json';
import * as AssetProducingDBTruffleBuild from '../contracts/AssetProducingRegistryDB.json'
import * as AssetConsumingDBTruffleBuild from '../contracts/AssetConsumingRegistryDB.json'
import * as CertificateDBTruffleBuild from '../contracts/CertificateDB.json'
import * as UserDBTruffleBuild from '../contracts/UserDB.json'

export { DemandLogicTruffleBuild, AssetProducingLogicTruffleBuild, AssetConsumingLogicTruffleBuild, CertificateLogicTruffleBuild, CoOTruffleBuild, UserLogicTruffleBuild }
export { DemandDBTruffleBuild, AssetProducingDBTruffleBuild, AssetConsumingDBTruffleBuild, CertificateDBTruffleBuild, UserDBTruffleBuild }