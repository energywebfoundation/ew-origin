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


var AssetProducingRegistryLogic = artifacts.require("AssetProducingRegistryLogic");
var DemandLogic = artifacts.require("DemandLogic");

module.exports = async function (callback) {
    const sleep = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    const assetLogic = await AssetProducingRegistryLogic.deployed();
    const assetID = await createAsset(assetLogic, 'Saxony')
    const assetID2 = await createAsset(assetLogic, 'BW')
    const assetID3 = await createAsset(assetLogic, 'Berlin')
    let assetID4 = null

    await createDemand('BW', false, -1, 9000000)
    await createDemand('Saxony', false, -1, 380000)
    await createDemand('Saxony', true, 0, 9000000)
    await createDemand('Saxony', false, -1, 9000000)

   
    let i = 0;

    while (true) {
        
        console.log('\n# ' + i)
        const tx = await assetLogic.saveSmartMeterRead(assetID, 430 * i, '0x0000000000000000000000000000000000000000000000000000000000000001', 300 * i, false, { from: web3.eth.accounts[9] })
        console.log('- Saved new meter read for asset ' + assetID + ': ' + 430 * i + ' ' + 300 * i)
        await sleep(10000);

        if (i < 3) { 
            const tx2 = await assetLogic.saveSmartMeterRead(assetID2, 10 * i, '0x0000000000000000000000000000000000000000000000000000000000000001', 7 * i, false, { from: web3.eth.accounts[9] })
            console.log('- Saved new meter read for asset ' + assetID2 +': ' + 10 * i + ' ' + 7 * i)
            await sleep(10000);
        } else if ( i == 3 ) {
            console.log('- Asset ' + assetID2 + ' inactive')
            await assetLogic.setActive(
                assetID2,
                false,
                { from: web3.eth.accounts[2] }
            )
            await sleep(10000);
        }

        const tx3 = await assetLogic.saveSmartMeterRead(assetID3, 10 * i, '0x0000000000000000000000000000000000000000000000000000000000000001', 7 * i, false, { from: web3.eth.accounts[9] })
        console.log('- Saved new meter read for asset ' + assetID3 + ': ' + 10 * i + ' ' + 7 * i)
        await sleep(10000);

        if (i == 2) {
            assetID4 = await createAsset(assetLogic, 'Saxony')
            await sleep(10000);
        } else if (i > 2) {
            const tx4 = await assetLogic.saveSmartMeterRead(assetID4, 10 * i, '0x0000000000000000000000000000000000000000000000000000000000000001', 7 * i, false, { from: web3.eth.accounts[9] })
            console.log('- Saved new meter read for asset ' + assetID4 + ': ' + 10 * i + ' ' + 7 * i)
            await sleep(10000);
        }

        if (i == 3) {
            await createDemand('Berlin', false, -1, 9000000)
            await sleep(10000);

        }

        await web3.currentProvider.send(
            {
                jsonrpc: '2.0',
                method: 'evm_increaseTime',
                params: [86400],
                id: 0
            })
            
        const time = new Date((await web3.eth.getBlock('latest').timestamp + 86400) * 1000)
        console.log('# New time: ' + time)
        i++;
    }

    callback();

};

async function createDemand(region, coupled, coupledAsset, endTimeOffset) {
    const demandLogic = await DemandLogic.deployed();
    const createTx = await demandLogic.createDemand()

    //const agreementDate = Math.round(new Date().getTime() / 1000)
    const agreementDate = parseInt((await web3.eth.getBlock('latest')).timestamp, 10);

    const startTime = agreementDate - 12000000
    const endTime = agreementDate + endTimeOffset

    const id = createTx.logs.find((log) => log.event === 'createdEmptyDemand').args.id.toNumber();
    const generalAndCouplingTx = await demandLogic.initGeneralAndCoupling(
        id,
        0, // originator 
        web3.eth.accounts[9], // buyer
        startTime,
        endTime,
        3,
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
        1,
        0
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

    const id = createTx.logs.find((log) => log.event === 'LogAssetCreated').args.id.toNumber();

    const generalTx = await assetLogic.initGeneral(
        id,
        web3.eth.accounts[9], // smart meter
        web3.eth.accounts[0], // owner
        0,
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
