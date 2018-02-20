// Copyright 2018 Energy Web Foundation
// This file is part of the Origin Application brought to you by the Energy Web Foundation,
// a global non-profit organization focused on accelerating blockchain technology across the energy sector, 
// incorporated in Zug, Switzerland.
//
// The Origin Application is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
// This is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY and without an implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details, at <http://www.gnu.org/licenses/>.
//
// @authors: slock.it GmbH, Heiko Burkhardt, heiko.burkhardt@slock.it


var AssetRegistryLogic = artifacts.require("AssetRegistryLogic");
var DemandLogic = artifacts.require("DemandLogic");

module.exports = async function(callback) {
    const sleep = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const assetLogic = await AssetRegistryLogic.deployed();
    await createDemand('BW', false, -1)
    await createDemand('Saxony', false, -1)
    await createDemand('Saxony', true, 0)
    await createDemand('Saxony', false, -1)
    
    const assetID = await createAsset(assetLogic, 'Saxony')
    const assetID2 = await createAsset(assetLogic, 'BW')
 
    let i = 0;
    
    while(true) {
        const tx = await assetLogic.saveSmartMeterRead(assetID, 20 * i, '0x0000000000000000000000000000000000000000000000000000000000000001', 9 * i, false, { from: web3.eth.accounts[9] })
        console.log('- Saved new meter Read: ' + 10 * i + ' ' + 7 * i)
        await sleep(10000);
        const tx2 = await assetLogic.saveSmartMeterRead(assetID2, 10 * i, '0x0000000000000000000000000000000000000000000000000000000000000001', 7 * i, false, { from: web3.eth.accounts[9] })
        await sleep(10000);
        i++;
    }

    callback();
    
};

async function createDemand(region, coupled, coupledAsset) {
    const demandLogic = await DemandLogic.deployed();
    const createTx = await demandLogic.createDemand()
    
    const agreementDate = Math.round(new Date().getTime() / 1000)
    const startTime = agreementDate - 120000
    const endTime = agreementDate + 120000

    const id = createTx.logs.find((log) => log.event === 'createdEmptyDemand' ).args.id.toNumber();
    const generalAndCouplingTx = await demandLogic.initGeneralAndCoupling(
      id,
      0, // originator 
      web3.eth.accounts[9], // buyer
      startTime,
      endTime,
      0,
      10,
      0,
      coupled,
      coupledAsset,
      -1
    )

    const txPd = await demandLogic.initPriceDriving(
        id,
        web3.fromAscii('Germany'),
        web3.fromAscii(region),
        0,
        1
      )

    const txMp = await demandLogic.initMatchProperties(
      id,
      100,
      0,
      web3.eth.accounts[8]
    )
    
    console.log('- Demand created id: ' + id)
    return id;
}

async function createAsset(assetLogic, region) {
    
    const createTx = await assetLogic.createAsset()
    
    const id = createTx.logs.find((log) => log.event === 'LogAssetCreated' ).args.id.toNumber();

    const generalTx = await assetLogic.initGeneral(
        id,
        web3.eth.accounts[9], // smart meter
        web3.eth.accounts[0], // owner
        0,
        0,
        100000,
        true,
        { from: web3.eth.accounts[2] }
    )

    const locationTx = await assetLogic.initLocation(
        id,
        web3.fromAscii('Germany'),
        web3.fromAscii(region),
        web3.fromAscii('12345'),
        web3.fromAscii('Mittweida'),
        web3.fromAscii('Markt'),
        web3.fromAscii('100000'),
        web3.fromAscii('0'),
        web3.fromAscii('0'),
        { from: web3.eth.accounts[2] }
    )
    console.log('- Asset created id: ' + id)
    return id;
}
