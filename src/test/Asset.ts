import { expect } from 'chai';
import 'mocha';
import Web3Type from '../types/web3';
import * as fs from 'fs';
import { BlockchainProperties } from '../blockchain-facade/BlockchainProperties'
import { Asset, AssetProperties, AssetType, Compliance } from '../blockchain-facade/Asset'
import { ProducingAsset } from '../blockchain-facade/ProducingAsset'
import { PrivateKeys } from '../test-accounts'

const Web3 = require('web3')
const AssetProducingLogicTruffleBuild = JSON.parse(fs.readFileSync('build/contracts/AssetProducingRegistryLogic.json', 'utf-8').toString());

describe('Asset', () => {
  let web3;
  let assetAdminAccount;
  let topAdminAccount;
  let blockchainProperties : BlockchainProperties ;
 
  const getInstanceFromTruffleBuild = (truffleBuild: any, web3: Web3Type) => {
    const address = Object.keys(truffleBuild.networks).length > 0 ? truffleBuild.networks[Object.keys(truffleBuild.networks)[0]].address : null
    return new web3.eth.Contract(truffleBuild.abi, address)
  }

  const init = async () => {
    web3 = new Web3('http://localhost:8545')
    assetAdminAccount = await web3.eth.accounts.wallet.add(PrivateKeys[2])
    topAdminAccount = await web3.eth.accounts.wallet.add(PrivateKeys[0])
    blockchainProperties= {
      web3: web3,
      producingAssetLogicInstance: await getInstanceFromTruffleBuild(AssetProducingLogicTruffleBuild, web3),
      assetAdminAccount: assetAdminAccount.address,
      topAdminAccount: topAdminAccount.address
    }
  }

  

  before(async () => {
    await init();
  });


  it('asset should be created', async () => {
      
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

    const asset = await ProducingAsset.CREATE_ASSET(assetProps, blockchainProperties)
    expect(asset.id).to.equal(0);
  });

});