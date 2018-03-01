import Web3Type from './types/web3'
import * as AssetProducingLogicTruffleBuild from '../contracts/AssetProducingRegistryLogic.json'
import { BlockchainProperties } from './blockchain-facade/BlockchainProperties'
import { Asset, AssetProperties, AssetType, Compliance } from './blockchain-facade/Asset'
import { PrivateKeys } from './test-accounts'

const Web3 = require('web3')

const getInstanceFromTruffleBuild = (truffleBuild: any, web3: Web3Type) => {
    const address = Object.keys(truffleBuild.networks).length > 0 ? truffleBuild.networks[Object.keys(truffleBuild.networks)[0]].address : null
    return new web3.eth.Contract(truffleBuild.abi, address)
}

const main = async () => {
    const web3 = new Web3('http://localhost:8545')
    const assetAdminAccount = await web3.eth.accounts.wallet.add(PrivateKeys[2])
    const topAdminAccount = await web3.eth.accounts.wallet.add(PrivateKeys[0])


    const blockchainProperties: BlockchainProperties = {
        web3: web3,
        assetLogicInstance: await getInstanceFromTruffleBuild(AssetProducingLogicTruffleBuild, web3),
        assetAdminAccount: assetAdminAccount.address,
        topAdminAccount: topAdminAccount.address
    }

    const assetProps = {
        // GeneralInformation
        smartMeter: '0x59e67AE7934C37d3376ab9c8dE153D10E07AE8C9',
        owner: topAdminAccount.address,
        assetType: AssetType.BiomassGas,
        operationalSince: 0,
        capacityWh: 500,

        certificatesCreatedForWh: 0,
        active: true,
        complianceRegistry: Compliance.EEC,

        // Location
        country: 'DE',
        region: 'Saxony',
        zip: '1234',
        city: 'Springfield',
        street: 'No name street',
        houseNumber: '1',
        gpsLatitude: '0',
        gpsLongitude: '0'
    }

    const asset = await Asset.CREATE_ASSET(assetProps, blockchainProperties)

    console.log(asset.id)



}

main()