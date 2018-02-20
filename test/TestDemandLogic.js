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

var UserLogic = artifacts.require("UserLogic");


contract('DemandLogic', function (accounts) {

    var demandLogic, demandDb, assetLogic, certificateLogic, startTime, endTime, agreementDate, userLogic

    it("should get the instances", async function () {
        demandLogic = await DemandLogic.deployed();
        coo = await CoO.deployed()
        demandDb = await DemandDB.deployed()
        assetLogic = await AssetRegistryLogic.deployed()
        certificateLogic = await CertificateLogic.deployed()
        userLogic = await UserLogic.deployed()

        assert.isNotNull(demandLogic)
        assert.isNotNull(coo)
    })

    it("should create a new Asset for testing", async function () {
        await assetLogic.createAsset()
        await assetLogic.initGeneral(0,
            accounts[9],
            accounts[0],
            0,
            1234567890,
            100000,
            true,
            { from: accounts[2] }
        )
        await assetLogic.initLocation(
            0,
            web3.fromAscii("Germany"),
            web3.fromAscii("Saxony"),
            web3.fromAscii("123412"),
            web3.fromAscii("Mittweida"),
            web3.fromAscii("Markt"),
            web3.fromAscii("16"),
            web3.fromAscii("0.1232423423"),
            web3.fromAscii("0.2342342445")
        )
    })

    it("should have 0 elements in the actvieDemands-List", async function () {
        assert.equal((await demandLogic.getActiveDemandListLength()).toNumber(), 0)
    })

    it("should have 0 elements in the allDemands-List", async function () {
        assert.equal((await demandLogic.getAllDemandListLength()).toNumber(), 0)
    })

    it("should create an empty demand", async function () {
        await demandLogic.createDemand()
    })
    it("should have 1 elements in the allDemands-List", async function () {
        assert.equal((await demandLogic.getAllDemandListLength()).toNumber(), 1)
    })

    it("should create a new GeneralDemand", async function () {

        agreementDate = (await web3.eth.getBlock('latest')).timestamp
        // agreementDate = Math.round(new Date().getTime() / 1000)
        startTime = agreementDate - 120
        endTime = agreementDate + 1200

        await demandLogic.initGeneralAndCoupling(
            0,
            0,// accounts[4],
            accounts[3],
            startTime,
            endTime,
            0,
            0,
            0,
            false,
            -1,
            -1
        )
    })

    it("should return the generalDemand correctly", async function () {
        let demand = await demandLogic.getDemandGeneral(0)

        assert.equal(demand[0], '0x0000000000000000000000000000000000000000')
        assert.equal(demand[1], accounts[3])
        assert.equal(demand[2].toNumber(), startTime)
        assert.equal(demand[3].toNumber(), endTime)
        assert.equal(demand[4], 0)
        assert.equal(demand[5], 0)
        assert.equal(demand[6], 0)
        assert.isFalse(demand[7])

    })

    it("should show the correct existing status", async function () {
        let demand = await demandLogic.getExistStatus(0)

        assert.isTrue(demand[0])
        assert.isFalse(demand[1])
        assert.isFalse(demand[2])
    })

    it("should return the couplinh correctly", async function () {
        let demand = await demandLogic.getDemandCoupling(0)

        assert.equal(demand[0].toNumber(), -1)
        assert.equal(demand[1].toNumber(), -1)
    })

    it("should have 0 elements in the actvieDemands-List", async function () {
        assert.equal((await demandLogic.getActiveDemandListLength()).toNumber(), 0)
    })

    it("should have 0 elements in the allDemands-List", async function () {
        assert.equal((await demandLogic.getAllDemandListLength()).toNumber(), 1)
    })

    it("should create a new priceDriving ", async function () {
        await demandLogic.initPriceDriving(0,
            web3.fromAscii("Germany"),
            web3.fromAscii("Saxony"),
            0,
            10
        )
    })

    it("should return the priceDriving correctly", async function () {
        let demand = await demandLogic.getDemandPriceDriving(0)

        assert.equal(web3.toAscii(demand[0]).replace(/\0/g, ''), 'Germany')
        assert.equal(web3.toAscii(demand[1]).replace(/\0/g, ''), 'Saxony')
        assert.equal(demand[2].toNumber(), 0)
        assert.equal(demand[3].toNumber(), 10)

    })


    it("should show the correct existing status", async function () {
        let demand = await demandLogic.getExistStatus(0)

        assert.isTrue(demand[0])
        assert.isTrue(demand[1])
        assert.isFalse(demand[2])
    })

    it("should have 0 elements in the actvieDemands-List", async function () {
        assert.equal((await demandLogic.getActiveDemandListLength()).toNumber(), 0)
    })

    it("should have 0 elements in the allDemands-List", async function () {
        assert.equal((await demandLogic.getAllDemandListLength()).toNumber(), 1)
    })

    it("should create a new matcherProperty ", async function () {
        await demandLogic.initMatchProperties(
            0,
            10000,
            0,
            accounts[8]
        )
    })

    it("should return the matcherProperty correctly", async function () {
        let demand = await demandLogic.getDemandMatcherProperties(0)

        assert.equal(demand[0].toNumber(), 10000)
        assert.equal(demand[1].toNumber(), 0)
        assert.equal(demand[2].toNumber(), 0)
        assert.equal(demand[3].toNumber(), 0)
        assert.equal(demand[4], accounts[8])
    })

    it("should show the correct existing status", async function () {
        let demand = await demandLogic.getExistStatus(0)

        assert.isTrue(demand[0])
        assert.isTrue(demand[1])
        assert.isTrue(demand[2])
    })

    it("should have 1 elements in the actvieDemands-List", async function () {
        assert.equal((await demandLogic.getActiveDemandListLength()).toNumber(), 1)
    })

    it("should have 1 elements in the allDemands-List", async function () {
        assert.equal((await demandLogic.getAllDemandListLength()).toNumber(), 1)
    })


    it("should add the buyer as trader ", async function () {
        userLogic.addTraderRole(accounts[3])
    })

    it("should add the buyer as trader ", async function () {
        userLogic.addTraderRole(accounts[9])
        userLogic.addAssetManagerRole(accounts[9])
        userLogic.addTraderRole(accounts[0])

    })

    it("should produce 20000 watt ", async function () {
        await assetLogic.saveSmartMeterRead(0, 100000, web3.fromAscii('newFileHash'), 10000, false, { from: accounts[9] })
    })

    it("should return false when using wrong the matcher ", async function () {
        let checkResult = await demandLogic.checkMatcher(0, 100)
        assert.equal(checkResult[0], 0)
        assert.equal(checkResult[1], 0)
        assert.equal(checkResult[2], 0)
        assert.isFalse(checkResult[3])
    })

    it("should return false when sending claiming too much energy", async function () {
        let checkResult = await demandLogic.checkMatcher(0, 10000000)
        assert.equal(checkResult[0], 0)
        assert.equal(checkResult[1], 0)
        assert.equal(checkResult[2], 0)
        assert.isFalse(checkResult[3])
    })

    it("should return true with matching inputs", async function () {
        let checkResult = await demandLogic.checkMatcher(0, 10000, { from: accounts[8] })
        assert.equal(checkResult[0], 10000)
        assert.equal(checkResult[1], 1)
        assert.equal(checkResult[2], 0)
        assert.isTrue(checkResult[3])

    })

    it("should be possible to fullfill a demand", async function () {

        let lengthBefore = await certificateLogic.getCertificateListLength()

        let matchPropBefore = await demandLogic.getDemandMatcherProperties(0)
        let tx = await demandLogic.matchDemand(0, 10000, 0, { from: accounts[8] })
        let matchPropAfter = await demandLogic.getDemandMatcherProperties(0)

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
            let tx = await demandLogic.matchDemand(0, 10000, 0, { from: accounts[8] })
            if (tx.receipt.status == '0x00') failed = true

        } catch (ex) {
            failed = true
        }

        assert.isTrue(failed)
    })

    it("should create a 2nd demand", async function () {
        await demandLogic.createDemand()
        await demandLogic.initGeneralAndCoupling(
            1,
            0,// accounts[4],
            accounts[3],
            startTime,
            endTime,
            0,
            00,
            0,
            false,
            -1,
            -1
        )
        await demandLogic.initPriceDriving(1,
            web3.fromAscii("Germany"),
            web3.fromAscii("Saxony"),
            0,
            10
        )
        await demandLogic.initMatchProperties(1,
            10000,
            0,
            accounts[8]
        )
    })


    it("should have 2 elements in the actvieDemands-List", async function () {
        assert.equal((await demandLogic.getActiveDemandListLength()).toNumber(), 2)
    })

    it("should have 2 elements in the allDemands-List", async function () {
        assert.equal((await demandLogic.getActiveDemandListLength()).toNumber(), 2)
    })

    it("should return the right active-Demands", async function () {
        assert.equal((await demandLogic.getActiveDemandIdAt(0)).toNumber(), 0)
        assert.equal((await demandLogic.getActiveDemandIdAt(1)).toNumber(), 1)

    })



    it("should be possible to nearly fullfill 2nd demand", async function () {

        let lengthBefore = await certificateLogic.getCertificateListLength()

        let matchPropBefore = await demandLogic.getDemandMatcherProperties(1)
        let tx = await demandLogic.matchDemand(1, 8000, 0, { from: accounts[8] })
        let matchPropAfter = await demandLogic.getDemandMatcherProperties(1)

        let lengthAfter = await certificateLogic.getCertificateListLength()

        assert.equal(lengthBefore.toNumber(), 1)
        assert.equal(lengthAfter.toNumber(), 2)

        assert.equal(matchPropBefore[0].toNumber(), 10000)
        assert.equal(matchPropAfter[0].toNumber(), 10000)

        assert.equal(matchPropBefore[1].toNumber(), 0)
        assert.equal(matchPropAfter[1].toNumber(), 8000)

        assert.equal(matchPropBefore[2].toNumber(), 0)
        assert.equal(matchPropAfter[2].toNumber(), 1)

        assert.equal(matchPropBefore[3].toNumber(), 0)
        assert.equal(matchPropAfter[3].toNumber(), 0)

    })

    it("should be possible to completly fullfill 2nd demand", async function () {

        let lengthBefore = await certificateLogic.getCertificateListLength()

        let matchPropBefore = await demandLogic.getDemandMatcherProperties(1)
        let tx = await demandLogic.matchDemand(1, 2000, 0, { from: accounts[8] })
        let matchPropAfter = await demandLogic.getDemandMatcherProperties(1)

        let lengthAfter = await certificateLogic.getCertificateListLength()

        assert.equal(lengthBefore.toNumber(), 2)
        assert.equal(lengthAfter.toNumber(), 3)

        assert.equal(matchPropBefore[0].toNumber(), 10000)
        assert.equal(matchPropAfter[0].toNumber(), 10000)

        assert.equal(matchPropBefore[1].toNumber(), 8000)
        assert.equal(matchPropAfter[1].toNumber(), 10000)

        assert.equal(matchPropBefore[2].toNumber(), 1)
        assert.equal(matchPropAfter[2].toNumber(), 2)

        assert.equal(matchPropBefore[3].toNumber(), 0)
        assert.equal(matchPropAfter[3].toNumber(), 0)
    })

    it("should not be possible to remove active demands when their endtime is not yet finished", async function () {

        let activeDemandsBefore = (await demandLogic.getActiveDemandListLength()).toNumber()
        try {
            await demandLogic.removeActiveDemand(0)
        }
        catch (ex) {

        }
        let actvieDemandsAfter = (await demandLogic.getActiveDemandListLength()).toNumber()

        assert.equal(activeDemandsBefore, actvieDemandsAfter)
    })

    it("should  be possible to remove active demands when their endtime is passed", async function () {

        await web3.currentProvider.send(
            {
                jsonrpc: '2.0',
                method: 'evm_increaseTime',
                params: [1500],
                id: 0
            })


        let activeDemandsBefore = (await demandLogic.getActiveDemandListLength()).toNumber()

        await demandLogic.removeActiveDemand(0)

        let actvieDemandsAfter = (await demandLogic.getActiveDemandListLength()).toNumber()

        assert.equal(activeDemandsBefore, 2)
        assert.equal(actvieDemandsAfter, 1)

    })

    it("should return the right active-Demand after removing the 1st one", async function () {
        assert.equal((await demandLogic.getActiveDemandIdAt(0)).toNumber(), 1)

    })

    it("should create a 3rd demand", async function () {
        await demandLogic.createDemand()
        await demandLogic.initGeneralAndCoupling(
            2,
            0,
            accounts[3],
            startTime,
            endTime,
            0,
            1,
            0,
            false,
            1,
            -1
        )
        await demandLogic.initPriceDriving(2,
            web3.fromAscii("Germany"),
            web3.fromAscii("Berlin"),
            0,
            10
        )
        await demandLogic.initMatchProperties(2,
            10000,
            0,
            accounts[8]
        )
    })

    it("should create a new Assets for testing", async function () {
        await assetLogic.createAsset()
        await assetLogic.initGeneral(1,
            accounts[9],
            accounts[0],
            1,
            1234567890,
            100000,
            true,
            { from: accounts[2] }
        )
        await assetLogic.initLocation(
            1,
            web3.fromAscii("Germany"),
            web3.fromAscii("Saxony"),
            web3.fromAscii("123412"),
            web3.fromAscii("Mittweida"),
            web3.fromAscii("Markt"),
            web3.fromAscii("16"),
            web3.fromAscii("0.1232423423"),
            web3.fromAscii("0.2342342445")
        )

        await assetLogic.createAsset()
        await assetLogic.initGeneral(2,
            accounts[9],
            accounts[0],
            0,
            1234567890,
            100000,
            true,
            { from: accounts[2] }
        )
        await assetLogic.initLocation(
            2,
            web3.fromAscii("Germany"),
            web3.fromAscii("Berlin"),
            web3.fromAscii("123412"),
            web3.fromAscii("Mittweida"),
            web3.fromAscii("Markt"),
            web3.fromAscii("16"),
            web3.fromAscii("0.1232423423"),
            web3.fromAscii("0.2342342445")
        )

        await assetLogic.createAsset()
        await assetLogic.initGeneral(3,
            accounts[9],
            accounts[0],
            0,
            1234567890,
            100000,
            true,
            { from: accounts[2] }
        )
        await assetLogic.initLocation(
            3,
            web3.fromAscii("USA"),
            web3.fromAscii("California"),
            web3.fromAscii("123412"),
            web3.fromAscii("Mittweida"),
            web3.fromAscii("Markt"),
            web3.fromAscii("16"),
            web3.fromAscii("0.1232423423"),
            web3.fromAscii("0.2342342445")
        )
    })


    it("should return false when using the wrong assetId", async function () {
        let demand = await demandLogic.checkDemandGeneral(2, 0)

        assert.equal(demand[0], '0x0000000000000000000000000000000000000000')
        assert.isFalse(demand[1])

    })


    it("should return false when the assetType is not matching", async function () {
        let demand = await demandLogic.checkPriceDriving(2, 1, 100)
        console.log(demand)
        assert.isFalse(demand[0])

    })

    it("should return false when the country is not matching", async function () {
        let demand = await demandLogic.checkPriceDriving(2, 3, 100)
        console.log(demand)
        assert.isFalse(demand[0])

    })

    /*
    it("should return false when the region is not matching", async function () {
        let demand
        try {
            demand = await demandLogic.checkPriceDriving(2, 2, 100)
        } catch (ex) { }
        console.log(demand)
        assert.isFalse(demand[0])

    })
    /*
        it("should return false when the region is not matching", async function () {
            let demand = await demandLogic.checkPriceDriving(2, 2, 100)
    
            assert.isFalse(demand[0])
    
        })
    */

})