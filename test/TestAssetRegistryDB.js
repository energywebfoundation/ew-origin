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
var AssetRegistryDB = artifacts.require("AssetRegistryDB");

contract('AssetRegistryDB', function(accounts) {

  var assetLog,
    assetDb;

  it("should get the instances", async function() {
    assetLog = await AssetRegistryLogic.deployed();
    assetDb = await AssetRegistryDB.deployed();
  })

  it("should execute the constructor successfully", async function() {})

  it("should set the correct smart meter reading", async function() {})

  it("should get the correct smart meter reading", async function() {})

  it("should set the owner correctly", async function() {})

  it("should get the owner correctly", async function() {})

  it("should set the fuel type correctly", async function() {})

  it("should get the fuel type correctly", async function() {})

  it("should set the operational slice correctly", async function() {})

  it("should get the operational slice correctly", async function() {})

  it("should set the last meter read in wh correctly", async function() {})

  it("should get the last meter read in wh correctly", async function() {})

  it("should set the capacity in wh correctly", async function() {})

  it("should get the capacity in wh correctly", async function() {})

  it("should set the amount of wh for which the certificate was created correctly", async function() {})

  it("should get the amount of wh for which the certificate was created correctly", async function() {})

  it("should set an asset active", async function() {})

  it("should get if an asset is active", async function() {})

  it("should create an asset", async function() {})

})