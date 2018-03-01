import { Asset } from '../blockchain-facade/Asset'
import { Demand } from '../blockchain-facade/Demand'
import { Matcher } from '../matching/Matcher'
import { networkInterfaces } from 'os';


export class MatchingManager {
    private assets: Asset[]
    private demands: Demand[]
    private matcher: Matcher


    constructor() {
        
        this.assets = []
        this.demands = []

    }

    setMatcher(matcher: Matcher) {
        this.matcher = matcher
    }

    async match(assetId: number, wh: number)  {
        
        console.log('\nTry to match ' + wh + ' Wh from asset ' + assetId)
        const asset = this.assets.find((asset: Asset) => asset.id == assetId)
        if(asset) {
            this.matcher.match(wh, asset, this.demands)
        } else {
            //TODO: get asset
        }
        
    }

    async registerAsset(newAsset: Asset) {
        const existingAsset = this.assets.find((asset: Asset) => newAsset.id === asset.id)

        if (existingAsset) {
            await existingAsset.syncWithBlockchain()
        } else {
            this.assets.push(newAsset)
            console.log('*> registered asset: ' + newAsset.id)
        }
    }

    async registerDemand(newDemand: Demand) {
        const existingDemand = this.demands.find((demand: Demand) => newDemand.id === demand.id)

        if (existingDemand) {
            await existingDemand.syncWithBlockchain()
        } else {
           
            this.demands.push(newDemand)
            console.log('*> registered demand: ' + newDemand.id)
        }
    }

    async removeAsset(assetId: number) {
        const assetIndex = this.assets.findIndex((asset: Asset) => assetId === asset.id)

        if(assetIndex !== -1) {
            this.assets.splice(assetIndex, 1)
            console.log('*> removed asset: ' + assetId)
        }
    }

    async removeDemand(demandId: number) {
        const demandIndex = this.demands.findIndex((demand: Demand) => demandId === demand.id)

        if(demandIndex !== -1) {
      
            this.demands.splice(demandIndex, 1)
          
            console.log('*> removed demand: ' + demandId)
        }
    }

    getAsset(assetId: number): Asset {
        return this.assets.find((asset: Asset) => asset.id === assetId)
    }
    
    getDemand(demandId: number): Demand {
        return this.demands.find((demand: Demand) => demand.id === demandId)
    }
}