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
// @authors: slock.it GmbH, Jonas Bentke, jonas.bentke@slock.it

var CertificateLogic = artifacts.require("CertificateLogic");
var CertificateDB = artifacts.require("CertificateDB");
var CoO = artifacts.require("CoO")

contract('CertificateLogic', function(accounts) {

  var certLog,
    certDb;

  it("should get the instances", async function() {
    certLog = await CertificateLogic.deployed();
    certDb = await CertificateDB.deployed();
  })

  it("should have executed the constructor successfully", async function() {
    //coo contract in this contract should be the same as the deployed one
    assert.equal(await certLog.cooContract.call(), CoO.address, "should be equal")
  })

  it("should have been initialized successfully", async function() {
    assert.equal(await certLog.certificateDb.call(), CertificateDB.address, "should be equal")
  })

  /// @dev done by asset
  it.skip("should create a certificate", async function() {})

  /// @dev done by asset
  it.skip("should retire a certificate", async function() {
    //create an certificate through the asset contract
    //retire that same certificate
    //check
  })

  /// @dev done by asset
  it.skip("should change certificate owner", async function() {
    //
  })

  /// @dev done by asset
  it.skip("should set the asset contract correctly", async function() {})

})