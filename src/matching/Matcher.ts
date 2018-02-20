import { Asset } from '../blockchain-facade/Asset'
import { Demand } from '../blockchain-facade/Demand'

export abstract class Matcher {

    abstract match(wh: number, asset: Asset, demands: Demand[]) :Promise<number>;
    



}