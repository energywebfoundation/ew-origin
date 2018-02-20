import { Asset } from '../blockchain-facade/Asset'
import { Demand } from '../blockchain-facade/Demand'
import { Matcher } from '../matching/Matcher'


export class MatchingManager {
    assets: Asset[]
    demands: Demand[]
    matcher: Matcher


    constructor(matcher: Matcher) {
        this.matcher = matcher

    }

    async match(assetId: number, wh: number)  {
        console.log('\nTry to match ' + wh + ' Wh from asset ' + assetId)
        const asset = this.assets.find((asset: Asset) => asset.id == assetId)
        this.matcher.match(wh, asset, this.demands)


    }
    
}