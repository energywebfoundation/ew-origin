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
pragma solidity ^0.4.19;

import "./AssetRegistryDB.sol";
import "./Owned.sol";

/// @title The Database contract for the AgreementDB of Origin list
/// @notice This contract only provides getter and setter methods and only its logic-contract is able to call the functions
contract DemandDB is Owned {

    enum TimeFrame{
        yearly,
        monthly,
        daily,
        hourly
    }   

    enum Currency{
        Euro,
        USD,
        SingaporeDollar,
        Ether
    }

    /// @notice struct for all the data belonging to the matcher
    struct MatcherProperties {
        uint targetWhPerPeriode;
        uint currentWhPerPeriode;
        uint certInCurrentPeriode;
        uint consumptionLastSetInPeriode;
        // simple address of privateKey-keypair
        address matcher; 
        bool exists;
    }

    /// @notice struct for all the information belonging to the coupling, can be 0
    struct Coupling {
        TimeFrame timeframe;
        uint[] producingAssets;
        uint[] consumingAssets;
    }

    /// @notice struct for all the information that can affect a price
    struct PriceDriving {
        bytes32 locationCountry;
        bytes32 locationRegion;
        AssetRegistryDB.FuelType assettype;
        uint minCO2Offset; 
        bool exists;
    }

    /// @notice struct for all the general information about a demand
    struct GeneralInfo {
        address originator;
        address buyer;
        uint agreementDate;
        uint startTime;
        uint endTime;
        uint pricePerCertifiedKWh;
        Currency currency;
        bool coupled;
        bool exists;

    }
    
    /// @notice struct for gather all information
    struct Demand {
        GeneralInfo general;
        Coupling couple;
        PriceDriving priceDriving;
        MatcherProperties matchProp; 
        bool enabled;
        uint created;
    }

    /// @notice list with all currenty active Demands
    bytes32[] private activeDemands; 

    uint private startEpoche;

    /// @notice list with all created demands
    bytes32[] private allDemands;

    /// @notice mapping for fast access to Demands
    mapping(bytes32 => Demand) demandMap;

    /// @notice Constructor
    /// @param _owner The owner of the contract
    function DemandDB(address _owner) 
        public
        Owned(_owner) 
    {
    } 

    function getStartEpoche(bytes32 _id)
        public
        view 
        onlyOwner 
        returns (uint)
    {    
        return demandMap[_id].created;
    }

    function getActiveDemandListLength()
        public
        view 
        onlyOwner
        returns (uint)
    {
        return activeDemands.length;
    }

    function getAllDemandListLength() 
        public
        view
        onlyOwner
        returns (uint)
    {
        return allDemands.length;
    }

    function getDemandGeneral(bytes32 _index)
        public
        view 
        onlyOwner 
        returns(
            address originator,
            address buyer,
            uint agreementDate,
            uint startTime,
            uint endTime,
            Currency currency,
            bool coupled
        ) 
    {
        Demand storage d = demandMap[_index];
        GeneralInfo storage g = d.general;
        return (g.originator, g.buyer, g.agreementDate, g.startTime, g.endTime, g.currency, g.coupled);
    }

    function createGeneralDemand(
        bytes32 _index,
        address _originator,
        address _buyer,
        uint _agreementDate,
        uint _startTime,
        uint _endTime,
        uint _pricePerCertifiedKWh,
        Currency _currency,
        bool _coupled
    )
        public
        onlyOwner 
    {

        Demand storage d = demandMap[_index];

        GeneralInfo storage g = d.general;
        g.originator = _originator;
        g.buyer = _buyer;
        g.agreementDate = _agreementDate;
        g.startTime = _startTime;
        g.endTime = _endTime;
        g.pricePerCertifiedKWh = _pricePerCertifiedKWh;
        g.currency = _currency;
        g.coupled = _coupled;
        g.exists = true;
    }


    function createCoupling(
        bytes32 _index,
        TimeFrame _tf,
        uint[] _prodAssets,
        uint[] _consAssets
    )
        public 
        onlyOwner
    {

        Demand storage d = demandMap[_index];

        Coupling storage c = d.couple;
        c.timeframe = _tf;
        c.producingAssets = _prodAssets;
        c.consumingAssets = _consAssets;
    }

    function createPriceDriving(
        bytes32 _index,
        bytes32 _locationCountry,
        bytes32 _locationRegion,
        AssetRegistryDB.FuelType _type,
        uint _minCO2Offset 
    )
        public
        onlyOwner
    {
        Demand storage d = demandMap[_index];

        PriceDriving storage p = d.priceDriving;

        p.locationCountry = _locationCountry;
        p.locationRegion = _locationRegion;
        p.assettype = _type;
        p.minCO2Offset = _minCO2Offset;
        p.exists = true;
    }

    function createMatchProperties(
        bytes32 _index,
        uint _WhAmountPerPeriode,
        uint _currentWhPerPeriode,
        uint _certInCurrentPeriode,
        uint _consumptionLastSetInPeriode,
        address _matcher
    )
        public
        onlyOwner
    {

        Demand storage d = demandMap[_index];

        MatcherProperties storage m = d.matchProp;
        m.targetWhPerPeriode = _WhAmountPerPeriode;
        m.currentWhPerPeriode = _currentWhPerPeriode;
        m.certInCurrentPeriode = _certInCurrentPeriode;
        m.consumptionLastSetInPeriode = _consumptionLastSetInPeriode;
        m.matcher = _matcher;
        m.exists = true;
    }

    function updateMatchProperties(
        bytes32 _index,
        uint _currentWhPerPeriode,
        uint _certInCurrentPeriode,
        uint _consumptionLastSetInPeriode
    )
        public
        onlyOwner
    {
        Demand storage d = demandMap[_index];

        MatcherProperties storage m = d.matchProp;
        m.currentWhPerPeriode = _currentWhPerPeriode;
        m.certInCurrentPeriode = _certInCurrentPeriode;
        m.consumptionLastSetInPeriode = _consumptionLastSetInPeriode;
    }

    function getDemandCoupling(bytes32 _index)
        public
        view 
        onlyOwner
        returns(
            TimeFrame timeframe,
            uint[] memory producingAssets,
            uint[] consumingAssets
        ) 
    {
        Demand storage d = demandMap[_index];
        Coupling storage s = d.couple;
        return (s.timeframe,s.producingAssets,s.consumingAssets);
    }

    function getDemandPriceDriving(bytes32 _index)
        public
        view 
        onlyOwner
        returns (
            bytes32 locationCountry,
            bytes32 locationRegion,
            AssetRegistryDB.FuelType assettype,
            uint minCO2Offset
        ) 
    {
        Demand storage d = demandMap[_index];
        PriceDriving storage p = d.priceDriving;
        return (p.locationCountry, p.locationRegion, p.assettype, p.minCO2Offset);
    }

    function setEnabled(bytes32 _index, bool _enabled)
        public 
        onlyOwner
    {
        Demand storage d = demandMap[_index];
        d.enabled = _enabled;
    }

    function getDemandMatcherProperties(bytes32 _index)
        public
        view 
        onlyOwner
        returns (  
            uint wHAmountPerPeriode,
            uint currentWhPerPeriode,
            uint certInCurrentPeriode,
            uint consumptionLastSetInPeriode,
            address matcher
        ) 
    {
        Demand storage d = demandMap[_index];
        MatcherProperties storage m = d.matchProp;
        return (m.targetWhPerPeriode, m.currentWhPerPeriode, m.certInCurrentPeriode, m.consumptionLastSetInPeriode, m.matcher);
    }
    
    function getActiveDemandIdAt(uint _index)
        public 
        view 
        onlyOwner
        returns (bytes32)
    {
        return activeDemands[_index];
    }

    function getAllDemandIdAt(uint _index)
        public 
        view 
        onlyOwner
        returns (bytes32)
    {
        return allDemands[_index];
    }

    function addActiveDemand(bytes32 _index)
        public 
        onlyOwner
    {
        activeDemands.push(_index);
    }

    function removeActiveDemand(bytes32 _index)
        public
        onlyOwner
    {
        for (uint i = 0; i < activeDemands.length; i++) {
            if ( activeDemands[i] == _index) {
                activeDemands[i] = activeDemands[activeDemands.length-1];
                activeDemands.length--;
            }
        }
    }

    function getExistStatus(bytes32 _index)
        public
        onlyOwner
        view 
        returns (bool generalExists, bool priceDrivingExists, bool matcherExists )
    {
        Demand storage d = demandMap[_index];
        return (d.general.exists, d.priceDriving.exists, d.matchProp.exists);
    }

    function addFullDemand(bytes32 _index)
        public
        onlyOwner
    {
        allDemands.push(_index);
    }

     function getFullDemand(bytes32 _index)
        public
        view
        returns (Demand)
    {
        return demandMap[_index];
    }

    function demandExists(bytes32 _index)
        public
        view 
        returns (bool)
    {
        return demandMap[_index].enabled;
    }

    function checkIfProducingAssetContains(bytes32 _index, uint _assetID)
        public
        view 
        onlyOwner
        returns (bool)
    {
        for (uint i = 0; i < demandMap[_index].couple.producingAssets.length; i++) {
            if (demandMap[_index].couple.producingAssets[i] == _assetID)
                return true; 
        }
        
        return false;
    }

    function setDemandCreationTime(bytes32 _index)
        public 
        onlyOwner
    {
        demandMap[_index].created = now;
    }

    function getProducingAssetsListLength(bytes32 _index)
        public 
        onlyOwner
        view
        returns (uint)
    {
        return demandMap[_index].couple.producingAssets.length;
    }

    function getProducingAssetAt(bytes32 _id, uint _index)
        public 
        onlyOwner
        view
        returns(uint)
    {
        return demandMap[_id].couple.producingAssets[_index];
    }

}




