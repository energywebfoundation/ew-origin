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
// @authors: slock.it GmbH, Martin Kuechler, martin.kuchler@slock.it

var DemandLogic = artifacts.require("DemandLogic");
var CoO = artifacts.require("CoO");

var DemandDB = artifacts.require("DemandDB")

var AssetRegistryLogic = artifacts.require("AssetRegistryLogic");
var CertificateLogic = artifacts.require("CertificateLogic");

contract('DemandLogic', function (accounts) {

    var demandLogic, demandDb, assetLogic, certificateLogic

    it("should get the instances", async function () {
        demandLogic = await DemandLogic.deployed();
        coo = await CoO.deployed()
        demandDb = await DemandDB.deployed()
        assetLogic = await AssetRegistryLogic.deployed()
        certificateLogic = await CertificateLogic.deployed()

        assert.isNotNull(demandLogic)
        assert.isNotNull(coo)
    })

    it("should create a new Asset for testing", async function () {

        let tx = await assetLogic.registerAsset(accounts[9], accounts[0], 0, 1234567890, 100000, 0, 0, true, '0x0000000000000000000000000000000000000000000000000000000000000001', { from: accounts[2] })

    })

    it("should have 0 elements in the actvieDemands-List", async function () {
        assert.equal((await demandLogic.getActiveDemandListLength()).toNumber(), 0)
    })

    it("should have 0 elements in the allDemands-List", async function () {
        assert.equal((await demandLogic.getActiveDemandListLength()).toNumber(), 0)
    })


    it("should create a new GeneralDemand", async function () {

        await demandLogic.createDemand(web3.fromAscii('Test'), accounts[4], accounts[3],
            new Date().getMilliseconds(), new Date().getMilliseconds() - 1000000, new Date().getMilliseconds() + 200000000,
            10,
            0, false, 0, [], [])

    })

    it("should have 0 elements in the actvieDemands-List", async function () {
        assert.equal((await demandLogic.getActiveDemandListLength()).toNumber(), 0)
    })

    it("should have 0 elements in the allDemands-List", async function () {
        assert.equal((await demandLogic.getActiveDemandListLength()).toNumber(), 0)
    })

    it("should create a new priceDriving ", async function () {
        await demandLogic.createPriceDriving(web3.fromAscii('Test'),
            'Germany',
            'Saxony',
            0,
            100
        )
    })

    it("should have 0 elements in the actvieDemands-List", async function () {
        assert.equal((await demandLogic.getActiveDemandListLength()).toNumber(), 0)
    })

    it("should have 0 elements in the allDemands-List", async function () {
        assert.equal((await demandLogic.getActiveDemandListLength()).toNumber(), 0)
    })

    it("should create a new matcherProperty ", async function () {
        await demandLogic.createMatchProperties(web3.fromAscii('Test'),
            10000,
            0,
            accounts[8]
        )
    })

    it("should have 1 elements in the actvieDemands-List", async function () {
        assert.equal((await demandLogic.getActiveDemandListLength()).toNumber(), 1)
    })

    it("should have 1 elements in the allDemands-List", async function () {
        assert.equal((await demandLogic.getActiveDemandListLength()).toNumber(), 1)
    })

    it("should get GeneralInfo ", async function () {
        //  console.log(await demandLogic.getDemandGeneral(web3.fromAscii('Test')))
    })

    it("should get GeneralInfo ", async function () {
        /* console.log("Demand:")
         console.log(await demandLogic.getDemandPriceDriving(web3.fromAscii('Test')))
         */
    })

    it("should get full Demand ", async function () {
        // console.log("full demand:")
    })

    it("should produce 10000 watt ", async function () {
        // console.log("full demand:")
        assetLogic.saveSmartMeterRead(0, 20000, web3.fromAscii('newFileHash'), { from: accounts[9] })

    })


    it("should be possible to fullfill a demand", async function () {

        let lengthBefore = await certificateLogic.getCertificateListLength()

        let matchPropBefore = await demandLogic.getDemandMatcherProperties(web3.fromAscii('Test'))
        let tx = await demandLogic.matchDemand(web3.fromAscii('Test'), 10000, 0, web3.fromAscii('Datalog'), { from: accounts[8] })
        let matchPropAfter = await demandLogic.getDemandMatcherProperties(web3.fromAscii('Test'))

        let lengthAfter = await certificateLogic.getCertificateListLength()

        assert.equal(lengthBefore.toNumber(), 0)
        assert.equal(lengthAfter.toNumber(), 1)

        assert.equal(matchPropBefore[0].toNumber(), 10000)
        assert.equal(matchPropAfter[0].toNumber(), 10000)

        assert.equal(matchPropBefore[1].toNumber(), 0)
        assert.equal(matchPropAfter[1].toNumber(), 10000)

        assert.equal(matchPropBefore[2].toNumber(), 0)
        assert.equal(matchPropAfter[2].toNumber(), 1)

        assert.equal(matchPropBefore[3].toNumber(), 0)
        assert.equal(matchPropAfter[3].toNumber(), 0)

    })

    it("should not be possible to fullfill a demand again", async function () {

        let failed = false
        try {
            let tx = await demandLogic.matchDemand(web3.fromAscii('Test'), 10000, 0, web3.fromAscii('Datalog'), { from: accounts[8] })
            if (tx.receipt.status == '0x00') failed = true

        } catch (ex) {
            failed = true
        }

        assert.isTrue(failed)
    })


})