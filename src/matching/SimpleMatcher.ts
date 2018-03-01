import { Matcher } from './Matcher'
import { Asset } from '../blockchain-facade/Asset'
import { Demand } from '../blockchain-facade/Demand'
import { BlockchainProperties } from '../blockchain-facade/BlockchainProperties'
import { General } from '../blockchain-facade/General'
import { MatchingManager } from './MatchingManager'

export class SimpleMatcher extends Matcher {
    blockchainProperties: BlockchainProperties
    matchingManager: MatchingManager
    

    constructor(blockchainProperties: BlockchainProperties, matchingManager: MatchingManager) {
        super()
        this.blockchainProperties = blockchainProperties
        this.matchingManager = matchingManager
    }

    async match(wh: number, asset: Asset, demands: Demand[]) :Promise<number> {
        const blockTimestamp = (await this.blockchainProperties.web3.eth.getBlock('latest')).timestamp
        console.log('- Time: ' + new Date(blockTimestamp*1000))
     

        if (!asset.initialized) {
            console.log('- Asset not initialized yet')
            return wh
        }

        const sortedDemandList = this.buildDemandList(demands, asset.id)

        let i = 0
        while (wh > 0 && i < sortedDemandList.length) {
            const whFit = await this.tryToFitAssetAndDemand(wh, asset, sortedDemandList[i])
            if (whFit > 0) {
                wh -= await this.sendMatchTx(sortedDemandList[i], asset.id, whFit)
            }
            i++;

        }

        if (wh > 0) {
            this.creatAssetOwnerCertificate(wh, asset.id)
        }

        asset.syncWithBlockchain()

        return wh;
    }

    private buildDemandList(demands: Demand[], assetId: number) {
        const coupledDemands = demands.filter((demand: Demand) => {
            //console.log(demand.coupled + ' ' + demand.productingAsset + ' ' + asset.id)
            return demand.coupled && demand.productingAsset === assetId && demand.initialized
        })

        const uncoupledDemands = demands.filter((demand: Demand) => {
            return !demand.coupled && demand.initialized
        })

        console.log('- Coupled demands: ' + coupledDemands.length)
        console.log('- Uncoupled demands: ' + uncoupledDemands.length)

        return coupledDemands.concat(uncoupledDemands)
    }

    private async sendMatchTx(demand: Demand, assetId: number, whFit: number) {
        try {

            await demand.matchDemand(whFit, assetId)
            console.log('> Matched ' + whFit + ' Wh to demand ' + demand.id)
            await demand.syncWithBlockchain()
            return whFit
        } catch (e) {
            console.log('! Error while matching ' + whFit + ' Wh from asset ' + assetId + ' to demand ' + demand.id)
            console.log('  ' + e.message)

            return 0
        }
    }

    private async creatAssetOwnerCertificate(wh: number, assetId: number) {
        console.log('> No match found for ' + wh + ' Wh')
        try {
            await General.createCertificateForAssetOwner(this.blockchainProperties, wh, assetId)
            console.log('> Created certificate for asset owner with ' + wh + ' Wh')
        } catch (e) {
            console.log('! Error while creating certificate for asset owner with ' + wh + ' Wh from asset ' + assetId)
            console.log('  ' + e.message)
        }
    }

    private async tryToFitAssetAndDemand(wh: number, asset: Asset, demand: Demand): Promise<number> {
        
        
        //TODO: check
        //Timeframe

        const blockTimestamp = (await this.blockchainProperties.web3.eth.getBlock('latest')).timestamp

        if(demand.endTime <= blockTimestamp || demand.startTime > blockTimestamp) {
            this.matchingManager.removeDemand(demand.id)
            return 0
        }

        if (demand.locationRegion !== asset.region
            || demand.assettype !== asset.assetType
            || demand.locationCountry !== asset.country
            || demand.matcher !== this.blockchainProperties.matcherAccount
            || demand.registryCompliance !== asset.complianceRegistry

        ) {

            return 0
        }

        const currentPeriod = await demand.getCurrentPeriod()

        const notFulfilledWh = currentPeriod > demand.productionLastSetInPeriod ? demand.targetWhPerPeriod : demand.targetWhPerPeriod - demand.currentWhPerPeriod

        return Math.min(wh, notFulfilledWh);
    }


}