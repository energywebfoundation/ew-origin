import { Matcher } from './Matcher'
import { Asset } from '../blockchain-facade/Asset'
import { Demand } from '../blockchain-facade/Demand'
import { BlockchainProperties } from '../blockchain-facade/BlockchainProperties'

export class SimpleMatcher extends Matcher {
    blockchainProperties: BlockchainProperties

    constructor(blockchainProperties: BlockchainProperties) {
        super()
        this.blockchainProperties = blockchainProperties 
    }

    async match(wh: number, asset: Asset, demands: Demand[]) :Promise<number> {

        let i = 0

        const coupledDemands = demands.filter((demand: Demand) => {
            //console.log(demand.coupled + ' ' + demand.productingAsset + ' ' + asset.id)
            return demand.coupled && demand.productingAsset === asset.id
        })

        const uncoupledDemands = demands.filter((demand: Demand) => {
            return !demand.coupled
        })

        console.log('> Coupled demands (asset: ' + asset.id + '): ' + coupledDemands.length)
        console.log('> Uncoupled demands: ' + coupledDemands.length)

        const sortedDemandList = coupledDemands.concat(uncoupledDemands)

        while (wh > 0 && i < sortedDemandList.length) {
            const whFit = await this.tryToFitAssetAndDemand(wh, asset, sortedDemandList[i])
            if(whFit > 0) {
                try {
              
                    const match = await sortedDemandList[i].matchDemand(whFit, asset.id)
                    console.log('> Matched ' + whFit + ' Wh from asset ' + asset.id + ' to demand ' + sortedDemandList[i].id)
                    await sortedDemandList[i].syncWithBlockchain()
                    wh -= whFit
                } catch(e) {
                    console.log('> Error while matching ' + whFit + ' Wh from asset ' + asset.id + ' to demand ' + sortedDemandList[i].id)
                    console.log('  ' + e.message)
                }
             
            }
            i++;
            
        }
        if(wh > 0) {
            console.log('> No match found for ' + wh + ' Wh from asset ' + asset.id)
        }
        asset.syncWithBlockchain()

        return wh;
    }

    async tryToFitAssetAndDemand(wh: number, asset: Asset, demand: Demand): Promise<number> {
        //TODO: check
        //Timeframe

        if(asset.region !== demand.locationRegion) {
            
            return 0
        } 
        
        const currentPeriod = await demand.getCurrentPeriod()
        
        const notFulfilledWh =  currentPeriod > demand.consumptionLastSetInPeriod ? demand.targetWhPerPeriod : demand.targetWhPerPeriod - demand.currentWhPerPeriod

        return Math.min(wh, notFulfilledWh);
    }

    
}