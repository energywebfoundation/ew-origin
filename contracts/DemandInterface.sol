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
// @authors: slock.it GmbH, Martin Kuchler, martin.kuchler@slock.it

pragma solidity ^0.4.17;

/// @title The Database contract for the AgreementDB of Origin list
/// @notice This contract only provides getter and setter methods

import "./AssetRegistryDB.sol";
import "./DemandDb.sol";

interface DemandInterface {

//    function createDemand();

    /// certlogic ruft das auf 
    function matchDemand();

    function getAllDemandListLength() public view returns (uint);

   // function getDemandAt();

    function getActiveDemandListLength() public view returns (uint);

    function getActiveDemandIdAt(uint _index) public view returns (uint);

    // calc
    function currentPeriode(DemandDB.TimeFrame _tf) public view returns (uint);
    



    
}