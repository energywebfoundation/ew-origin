import Web3Type from '../types/web3'

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
    id: string
    //MatcherProperties
    kWAmountPerPeriode: number
    consumptionInCurrentPeriode: number
    certInCurrentPeriode: number
    currentPeriode: number
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
    productingAssets: number
    consumingAssets: number

    constructor(id: string) {
        this.id = id
    }

   
    static GET_ALL_DEMAND_LIST_LENGTH(demandLogicInstance: any): Promise<number> {
        return demandLogicInstance.methods.getAllDemandListLength().call()
    }


    async syncWithBlockchain(demandLogicInstance: any, web3: Web3Type): Promise<Demand> {
        if (this.id != null) {
            const structDataPromises = []
            structDataPromises.push(demandLogicInstance.methods.getDemandGeneral(this.id).call())
            structDataPromises.push(demandLogicInstance.methods.getDemandPriceDriving(this.id).call())
            structDataPromises.push(demandLogicInstance.methods.getDemandMatcherProperties(this.id).call())
       
     
            const demandData = await Promise.all(structDataPromises)
         
            this.kWAmountPerPeriode = parseInt(demandData[2].kWAmountPerPeriode, 10)
            this.consumptionInCurrentPeriode = parseInt(demandData[2].consumptionInCurrentPeriode, 10)
            this.certInCurrentPeriode = parseInt(demandData[2].certInCurrentPeriode, 10)
            this.currentPeriode = parseInt(demandData[2].currentPeriode, 10)
            this.matcher = demandData[2].matcher
            //PriceDriving
            this.locationCountry = web3.utils.hexToUtf8(demandData[1].locationCountry)
            this.locationRegion = web3.utils.hexToUtf8(demandData[1].locationRegion)
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
            //Demand and Coupling
    
            // this.timeframe: TimeFrame
            // this.productingAssets: number
            // this.consumingAssets: number
   
            
        }
        return this
    } 

    // async changeMemberHoldingPostition(newBoardMemberAdddress: string, web3Service: Web3Service) {
    //     const accounts = await web3Service.web3.eth.getAccounts()

    //     if (accounts.length > 0) {
    //         web3Service.applicationMasterContract.methods
    //             .replaceBoardMemberPosition(this.id, newBoardMemberAdddress).send({from: accounts[0]})
    //     }
    // }

}