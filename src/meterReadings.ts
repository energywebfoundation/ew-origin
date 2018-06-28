import { expect } from 'chai';
import 'mocha';
import Web3Type from './types/web3';
import * as fs from 'fs';
import { BlockchainProperties } from './blockchain-facade/BlockchainProperties'
import { Asset, AssetProperties, AssetType, Compliance } from './blockchain-facade/Asset'
import { ProducingAsset, ProducingAssetProperties } from './blockchain-facade/ProducingAsset'
import { PrivateKeys } from './test-accounts'
import { ConsumingAsset } from './blockchain-facade/ConsumingAsset';
import { User, UserProperties } from './blockchain-facade/User';
import { Demand, TimeFrame, Currency } from './blockchain-facade/Demand'




const Web3 = require('web3')
const CoOTruffleBuild = JSON.parse(fs.readFileSync('build/contracts/CoO.json', 'utf-8').toString());
const AssetProducingLogicTruffleBuild = JSON.parse(fs.readFileSync('build/contracts/AssetProducingRegistryLogic.json', 'utf-8').toString());
const AssetConsumingLogicTruffleBuild = JSON.parse(fs.readFileSync('build/contracts/AssetConsumingRegistryLogic.json', 'utf-8').toString());
const UserLogicTruffleBuild = JSON.parse(fs.readFileSync('build/contracts/UserLogic.json', 'utf-8').toString());
const DemandTruffleBuild = JSON.parse(fs.readFileSync('build/contracts/DemandLogic.json', 'utf-8').toString());

let web3;
let assetAdminAccount;
let topAdminAccount;
let blockchainProperties: BlockchainProperties;

let assetProducingArray = []
let assetConsumingArray = []
let demandArray = []
let userArray = []

let pAssetLogicInstance
let cAssetLogicInstance
let uLogicInstance
let dLogicInstance



const getInstanceFromTruffleBuild = (truffleBuild: any, web3: Web3Type) => {
    const address = Object.keys(truffleBuild.networks).length > 0 ? truffleBuild.networks[Object.keys(truffleBuild.networks)[0]].address : null
    return new web3.eth.Contract(truffleBuild.abi, address)
}

const init = async () => {
    blockchainProperties = {
        web3: web3,
        producingAssetLogicInstance: pAssetLogicInstance,
        consumingAssetLogicInstance: cAssetLogicInstance,
        userLogicInstance: uLogicInstance,
        demandLogicInstance: dLogicInstance,

        assetAdminAccount: "0xd173313a51f8fc37bcf67569b463abd89d81844f",
        topAdminAccount: "0xd173313a51f8fc37bcf67569b463abd89d81844f",
        userAdmin: "0xd173313a51f8fc37bcf67569b463abd89d81844f"
    }
}

const main = async () => {

    const cooAddress = process.argv[2]
    web3 = new Web3('http://localhost:8545')

    if (!cooAddress) {
        console.log("no coo-Address found, using the truffle-abi")
        pAssetLogicInstance = await getInstanceFromTruffleBuild(AssetProducingLogicTruffleBuild, web3)
        cAssetLogicInstance = await getInstanceFromTruffleBuild(AssetConsumingLogicTruffleBuild, web3)
        uLogicInstance = await getInstanceFromTruffleBuild(UserLogicTruffleBuild, web3)
        dLogicInstance = await getInstanceFromTruffleBuild(DemandTruffleBuild, web3)
    }
    else {
        console.log("cooAddress: " + cooAddress)
        const cooContractInstance = await (new web3.eth.Contract((CoOTruffleBuild as any).abi, cooAddress))

        const assetProducingRegistryAddress = await cooContractInstance.methods.assetProducingRegistry().call()
        const demandLogicAddress = await cooContractInstance.methods.demandRegistry().call()
        const certificateLogicAddress = await cooContractInstance.methods.certificateRegistry().call()
        const assetConsumingRegistryAddress = await cooContractInstance.methods.assetConsumingRegistry().call()
        const userLogicAddress = await cooContractInstance.methods.userRegistry().call()


        pAssetLogicInstance = new web3.eth.Contract((AssetProducingLogicTruffleBuild as any).abi, assetProducingRegistryAddress)
        cAssetLogicInstance = new web3.eth.Contract((AssetConsumingLogicTruffleBuild as any).abi, assetConsumingRegistryAddress)
        uLogicInstance = new web3.eth.Contract((UserLogicTruffleBuild as any).abi, userLogicAddress)
        dLogicInstance = new web3.eth.Contract((DemandTruffleBuild as any).abi, demandLogicAddress)

    }
    //   await fs.createReadStream('/Users/mkuechler/ewf/CoO/userData.csv').pipe(myParser);

    await init()

}


main()


