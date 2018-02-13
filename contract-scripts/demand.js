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

var DemandLogic = artifacts.require("DemandLogic");

module.exports = async function(callback) {

    const sleep = (ms) => {
      return new Promise(resolve => setTimeout(resolve, ms));
    }

    if (process.argv[4] === '--create') {
        const demandLogic = await DemandLogic.deployed();
        const tx = await demandLogic.createDemand(
          web3.fromAscii(process.argv[5]),
          web3.eth.accounts[process.argv[6]],
          web3.eth.accounts[process.argv[7]],
          parseInt(process.argv[8], 10),
          parseInt(process.argv[9], 10),
          parseInt(process.argv[10], 10),
          parseInt(process.argv[11], 10),
          process.argv[12] === 'true',
          parseInt(process.argv[13], 10),
          [],
          []
        )
        console.log(tx);
        callback();

      } else if(process.argv[4] === '--start-generator') {
        const demandLogic = await DemandLogic.deployed();
        
        while(true) {
          console.log(demandLogic.address)
          const txCd = await demandLogic.createDemand(web3.fromAscii('Test1'), web3.eth.accounts[4], web3.eth.accounts[3], new Date().getMilliseconds(), new Date().getMilliseconds(), new Date().getMilliseconds() + 2000, 0, false, 0, [], [])
          console.log(txCd);

          const txMp = await demandLogic.createMatchProperties(web3.fromAscii('Test1'),
            100,
            200,
            300,
            400,
            web3.eth.accounts[8]
          )
          console.log(txMp);

          const txPd = await demandLogic.createPriceDriving(web3.fromAscii('Test1'),
            'Germany',
            'Saxony',
            0,
            100
          )
          console.log(txPd);

          await sleep(4000);
        }
        callback();
      } else {
        console.log("Demand")
        console.log("e.g.: truffle exec create-demand.js --create Test 4 3 0 0 1 0 false 0\n")
        console.log("e.g.: truffle exec create-demand.js --start-generator\n")
        callback();
      }  
    


    while(true) {
        web3.eth.sendTransaction({ from: web3.eth.accounts[0], to: web3.eth.accounts[2], value: 1 });
        await sleep(4000);
    }
    callback();
  
};
