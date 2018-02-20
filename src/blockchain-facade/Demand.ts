import Web3Type from '../types/web3'
import { BlockchainProperties } from './BlockchainProperties'

export enum TimeFrame {
    yearly,
    monthly,
    daily,
    hourly
}

export enum Currency {
    Euro,
    USD,
    SingaporeDollar,
    Ether
}

export enum FuelType {
    Water,
    Solar,
    Wind
}

export class Demand {
    id: number
    //MatcherProperties
    targetWhPerPeriod: number
    currentWhPerPeriod: number
    certInCurrentPeriod: number
    consumptionLastSetInPeriod: number
    matcher: string
    matcherPropertiesExists: boolean
    //PriceDriving
    locationCountry: string
    locationRegion: string
    assettype: FuelType
    minCO2Offset: number
    priceDrivingExists: boolean
    //GeneralInfo
    originator: string
    buyer: string
    agreementDate: number
    startTime: number
    endTime: number
    currency: Currency
    coupled: boolean
    generalInfoExists: boolean
    //Demand and Coupling
    enabled: boolean
    timeframe: TimeFrame
    productingAsset: number
    consumingAsset: number

    blockchainProperties: BlockchainProperties

    constructor(id: number, blockchainProperties: BlockchainProperties) {
        this.id = id
        this.blockchainProperties = blockchainProperties
    }

   
    static async GET_ALL_DEMAND_LIST_LENGTH(blockchainProperties: BlockchainProperties) {
        return parseInt(await blockchainProperties.demandLogicInstance.methods.getAllDemandListLength().call(), 10)
    }

    static async GET_ACTIVE_DEMAND_LIST_LENGTH(blockchainProperties: BlockchainProperties) {
        return parseInt(await blockchainProperties.demandLogicInstance.methods.getActiveDemandListLength().call(), 10)
    }

    static async GET_ACTIVE_DEMAND_ID_AT(index: number, blockchainProperties: BlockchainProperties) {

        return blockchainProperties.demandLogicInstance.methods.getActiveDemandIdAt(index).call()
    } 

    static async GET_ALL_ACTIVE_DEMANDS(blockchainProperties: BlockchainProperties) {

        const demandIdPromises = Array(await Demand.GET_ACTIVE_DEMAND_LIST_LENGTH(blockchainProperties))
            .fill(null)
            .map((item, index) => Demand.GET_ACTIVE_DEMAND_ID_AT(index, blockchainProperties))
   
        const demandIds = await Promise.all(demandIdPromises)
        
        const demandPromises = demandIds.map((id) => ((new Demand(id, blockchainProperties)).syncWithBlockchain()))
        
        return Promise.all(demandPromises)
    
    }

    async getCurrentPeriod() {
        return await this.blockchainProperties.demandLogicInstance.methods.getCurrentPeriod(this.timeframe, this.id).call()
    }

    async matchDemand(wh: number, assetId: number) {

        //console.log('! ' + this.id + ' ' + wh + ' ' + assetId + ' from: ' + this.blockchainProperties.matcherAccount)
 
        
        const gas = await this.blockchainProperties.demandLogicInstance.methods
            .matchDemand(this.id, wh, assetId)
            .estimateGas({from: this.blockchainProperties.matcherAccount})
        
        const tx = await this.blockchainProperties.demandLogicInstance.methods
             .matchDemand(this.id, wh, assetId)
             .send({from: this.blockchainProperties.matcherAccount, gas: Math.round(gas * 1.1)})

   
        return tx
    }


    async syncWithBlockchain(): Promise<Demand> {
        if (this.id != null) {
            const structDataPromises = []
            structDataPromises.push(this.blockchainProperties.demandLogicInstance.methods.getDemandGeneral(this.id).call())
            structDataPromises.push(this.blockchainProperties.demandLogicInstance.methods.getDemandPriceDriving(this.id).call())
            structDataPromises.push(this.blockchainProperties.demandLogicInstance.methods.getDemandMatcherProperties(this.id).call())
            structDataPromises.push(this.blockchainProperties.demandLogicInstance.methods.getDemandCoupling(this.id).call())

            const demandData = await Promise.all(structDataPromises)
         
            this.targetWhPerPeriod = parseInt(demandData[2].targetWhPerPeriod, 10)
            this.currentWhPerPeriod = parseInt(demandData[2].currentWhPerPeriod, 10)
            this.certInCurrentPeriod = parseInt(demandData[2].certInCurrentPeriod, 10)
            this.consumptionLastSetInPeriod = parseInt(demandData[2].consumptionLastSetInPeriod, 10)
            this.matcher = demandData[2].matcher

            //PriceDriving
            this.locationCountry = this.blockchainProperties.web3.utils.hexToUtf8(demandData[1].locationCountry)
            this.locationRegion = this.blockchainProperties.web3.utils.hexToUtf8(demandData[1].locationRegion)
            this.assettype = parseInt(demandData[1].assettype, 10)
            this.minCO2Offset = parseInt(demandData[1].minCO2Offset, 10)
            //GeneralInfo
            this.originator = demandData[0].originator
            this.buyer = demandData[0].buyer
            this.agreementDate = parseInt(demandData[0].agreementDate, 10)
            this.startTime = parseInt(demandData[0].startTime, 10)
            this.endTime = parseInt(demandData[0].endTime, 10)
            this.currency = parseInt(demandData[0].currency, 10)
            this.coupled  = demandData[0].coupled
            this.timeframe = parseInt(demandData[0].timeframe, 10)
            //Demand and Coupling
            
            this.productingAsset = parseInt(demandData[3].producingAssets, 10)
            this.consumingAsset = parseInt(demandData[3].consumingAssets, 10)
    
            
        }
        return this
    } 

}