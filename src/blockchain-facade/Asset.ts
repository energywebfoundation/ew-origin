import Web3Type from '../types/web3'
import { BlockchainProperties } from './BlockchainProperties'

export enum AssetType {
    Wind,
    Solar,
    RunRiverHydro,
    BiomassGas
}

export class Asset {
    id: number
    // GeneralInformation
    smartMeter: string
    owner: string
    assetType: AssetType
    operationalSince: number
    capacityWh: number
    lastSmartMeterReadWh: number
    certificatesCreatedForWh: number
    active: boolean
    lastSmartMeterReadFileHash: string
    lastSmartMeterCO2OffsetRead: number
    cO2UsedForCertificate: number
    // Location
    country: string
    region: string
    zip: string
    city: string
    street: string
    houseNumber: string
    gpsLatitude: string
    gpsLongitude: string

    blockchainProperties: BlockchainProperties

    constructor(id: number, blockchainProperties: BlockchainProperties) {
        this.id = id
        this.blockchainProperties = blockchainProperties
    }

    static async GET_ASSET_LIST_LENGTH(blockchainProperties: BlockchainProperties) {
 
        return parseInt(await blockchainProperties.assetLogicInstance.methods.getAssetListLength().call(), 10)
    }

    static async GET_ALL_ASSETS(blockchainProperties: BlockchainProperties) {

        const assetsPromises = Array(await Asset.GET_ASSET_LIST_LENGTH(blockchainProperties))
            .fill(null)
            .map((item, index) => (new Asset(index, blockchainProperties)).syncWithBlockchain())
        
        return Promise.all(assetsPromises)
    
    }

    async syncWithBlockchain(): Promise<Asset> {
        if (this.id != null) {
            const structDataPromises = []
            structDataPromises.push(this.blockchainProperties.assetLogicInstance.methods.getAssetGeneral(this.id).call())
            structDataPromises.push(this.blockchainProperties.assetLogicInstance.methods.getAssetLocation(this.id).call())
       
            const demandData = await Promise.all(structDataPromises)

            this.smartMeter = demandData[0]._smartMeter
            this.owner = demandData[0]._owner
            this.assetType =  parseInt(demandData[0]._assetType, 10)
            this.operationalSince =  parseInt(demandData[0]._operationalSince, 10)
            this.capacityWh =  parseInt(demandData[0]._capacityWh, 10)
            this.lastSmartMeterReadWh =  parseInt(demandData[0]._lastSmartMeterReadWh, 10)
            this.certificatesCreatedForWh =  parseInt(demandData[0]._certificatesCreatedForWh, 10)
            this.active = demandData[0]._active
            this.lastSmartMeterReadFileHash = demandData[0]._lastSmartMeterReadFileHash
            this.lastSmartMeterCO2OffsetRead =  parseInt(demandData[0]._lastCO2OffsetReading, 10)
            this.cO2UsedForCertificate =  parseInt(demandData[0]._cO2UsedForCertificate, 10)
            // Location
            this.country = this.blockchainProperties.web3.utils.hexToUtf8(demandData[1].country)
            this.region = this.blockchainProperties.web3.utils.hexToUtf8(demandData[1].region)
            this.zip = this.blockchainProperties.web3.utils.hexToUtf8(demandData[1].zip)
            this.city = this.blockchainProperties.web3.utils.hexToUtf8(demandData[1].city)
            this.street = this.blockchainProperties.web3.utils.hexToUtf8(demandData[1].street)
            this.houseNumber = this.blockchainProperties.web3.utils.hexToUtf8(demandData[1].houseNumber)
            this.gpsLatitude = this.blockchainProperties.web3.utils.hexToUtf8(demandData[1].gpsLatitude)
            this.gpsLongitude = this.blockchainProperties.web3.utils.hexToUtf8(demandData[1].gpsLongitude)
   
            
        }
        return this
    } 


}