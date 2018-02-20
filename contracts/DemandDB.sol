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

import "./Owned.sol";
import "./LocationDefinition.sol";

/// @title The Database contract for the AgreementDB of Origin list
/// @notice This contract only provides getter and setter methods and only its logic-contract is able to call the functions
contract DemandDB is Owned {

    GeneralInfo generalEmpty;
    Coupling coupleEmpty;
    PriceDriving  priceDrivingEmpty;
    MatcherProperties matchPropEmpty; 

    /// @notice struct for all the data belonging to the matcher
    struct MatcherProperties {
        uint targetWhPerperiod;
        uint currentWhPerperiod;
        uint certInCurrentperiod;
        uint consumptionLastSetInperiod;
        // simple address of privateKey-keypair
        address matcher; 
    }

    /// @notice struct for all the information belonging to the coupling, can be 0
    struct Coupling {
        int producingAssets;
        int consumingAssets;
    }

    /// @notice struct for all the information that can affect a price
    struct PriceDriving {
        LocationDefinition.Location location;
        uint assettype;
        // 	proportion between CO2 and wh in percent (100 * CO2 / Wh)
        uint minCO2Offset; 
    }

    /// @notice struct for all the general information about a demand
    struct GeneralInfo {
        address originator;
        address buyer;
        uint startTime;
        uint endTime;
        uint timeframe;
        uint pricePerCertifiedKWh;
        uint currency;
        bool coupled;

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
    uint[] private activeDemands; 

    /// @notice empty location struct for initializing, used to avoid compile warnings
    LocationDefinition.Location private locationEmpty;

    /// @notice list with all created demands
    Demand[] private allDemands;

    /// @notice Constructor
    /// @param _owner The owner of the contract
    function DemandDB(address _owner) 
        public
        Owned(_owner) 
    {

    } 

    /// @notice function to add a demand to the activeDemands-array
    /// @param _index hash-identifier of a demand
    function addActiveDemand(uint _index)
        external 
        onlyOwner
    {
        activeDemands.push(_index);
    }

    /// @notice function to create a coupling
    /// @param _index identifier
    /// @param _prodAssets array with assets that are allowed to produce energy for this agreement
    /// @param _consAssets array with assets that are allowed to consume energy for this agreement
    function createCoupling(
        uint _index,
        int _prodAssets,
        int _consAssets
    )
        external 
        onlyOwner
    {
        Demand storage d = allDemands[_index];

        Coupling storage c = d.couple;
        c.producingAssets = _prodAssets;
        c.consumingAssets = _consAssets;
    }

    /// @notice function to create an empty demand
    /// @return the index and thus the identifier of a demand
    function createEmptyDemand()
        external
        onlyOwner
        returns (uint)
    {
    return (allDemands.push(Demand({
            general: generalEmpty,
            couple: coupleEmpty,
            priceDriving: priceDrivingEmpty,
            matchProp: matchPropEmpty,
            enabled: false,
            created : 0
        })) -1);
    }

    /// @notice function to create the general informations of a demand
    /// @param _index identifier
    /// @param _originator producer of energy
    /// @param _buyer buyer of a certiface, can be 0x0
    /// @param _startTime eariest accepted certificates
    /// @param _endTime latest accepted certificates
    /// @param _pricePerCertifiedKWh price per certified kWh
    /// @param _currency currency the originator wants to be paid with
    /// @param _coupled flag if there is a coupling with consumption
    function createGeneralDemand(
        uint _index,
        address _originator,
        address _buyer,
        uint _startTime,
        uint _endTime,
        uint _timeframe,
        uint _pricePerCertifiedKWh,
        uint _currency,
        bool _coupled
    )
        external
        onlyOwner 
    {

        Demand storage d = allDemands[_index];

        GeneralInfo storage g = d.general;
        g.originator = _originator;
        g.buyer = _buyer;
        g.startTime = _startTime;
        g.endTime = _endTime;
        g.timeframe = _timeframe;
        g.pricePerCertifiedKWh = _pricePerCertifiedKWh;
        g.currency = _currency;
        g.coupled = _coupled;
        
    }

    /// @notice function to create the matching-properties
    /// @param _index identifier
    /// @param _WhAmountPerperiod the desired amount of Wh per period
    /// @param _currentWhPerperiod the current amount of Wh
    /// @param _certInCurrentperiod the amount of certificates created in the current period
    /// @param _consumptionLastSetInperiod the last period where the consumption was set
    /// @param _matcher account of the javaScript-matcher
    function createMatchProperties(
        uint _index,
        uint _WhAmountPerperiod,
        uint _currentWhPerperiod,
        uint _certInCurrentperiod,
        uint _consumptionLastSetInperiod,
        address _matcher
    )
        external
        onlyOwner
    {

        Demand storage d = allDemands[_index];

        MatcherProperties storage m = d.matchProp;
        m.targetWhPerperiod = _WhAmountPerperiod;
        m.currentWhPerperiod = _currentWhPerperiod;
        m.certInCurrentperiod = _certInCurrentperiod;
        m.consumptionLastSetInperiod = _consumptionLastSetInperiod;
        m.matcher = _matcher;
    }

    /// @notice function to create the pricedriving-factors of a demand
    /// @param _index identifier
    /// @param _country country the engery has to come from
    /// @param _type fuel-tyoe 
    /// @param _minCO2Offset CO2-offset
    function createPriceDriving(
        uint _index,
        bytes32 _country,
        bytes32 _region,
        bytes32 _zip,
        bytes32 _city,
        bytes32 _street,
        bytes32 _houseNumber,
        bytes32 _gpsLatitude,
        bytes32 _gpsLongitude,
        uint _type,
        uint _minCO2Offset 
    )
        external
        onlyOwner
    {
        Demand storage d = allDemands[_index];

        PriceDriving storage p = d.priceDriving;

        p.location = locationEmpty;
        p.assettype = _type;
        p.minCO2Offset = _minCO2Offset;

        LocationDefinition.Location storage location = p.location;
            location.country = _country;
            location.region = _region;
            location.zip = _zip;
            location.city = _city;
            location.street = _street;
            location.houseNumber = _houseNumber;
            location.gpsLatitude = _gpsLatitude;
            location.gpsLongitude = _gpsLongitude;
            location.exists = true;
    }

    /// @notice function to remove an entry in the activeDemands-array
    /// @param _index the index position of the full demand in the allDemands-array
    /// @dev due to the design the order of elements in the array will change when removing an element!
    /// @dev we're using a for-loop here. Due to the fact that there could be multiple thousands an error could cause problems
    function removeActiveDemand(uint _index)
        external
        onlyOwner
    {
        for (uint i = 0; i < activeDemands.length; i++) {
            if ( activeDemands[i] == _index) {
                activeDemands[i] = activeDemands[activeDemands.length-1];
                activeDemands.length--;
            }
        }
    }

    /// @notice function to set the creation-time of a demand
    /// @param _index identifier
    /// @param _time creation-time
    function setDemandCreationTime(uint _index, uint _time)
        external 
        onlyOwner
    {
        allDemands[_index].created = _time;
    }

    /// @notice function to en- or disable a demand
    /// @param _index identifier
    /// @param _enabled flag if the demand should be enabled
    function setEnabled(uint _index, bool _enabled)
        external 
        onlyOwner
    {
        Demand storage d = allDemands[_index];
        d.enabled = _enabled;
    }

    /// @notice function to update some matching parameters
    /// @param _index identifier
    /// @param _currentWhPerperiod the current amount of Wh
    /// @param _certInCurrentperiod the amount of certificates created in the current period
    /// @param _consumptionLastSetInperiod the last period where the consumption was set
    function updateMatchProperties(
        uint _index,
        uint _currentWhPerperiod,
        uint _certInCurrentperiod,
        uint _consumptionLastSetInperiod
    )
        external
        onlyOwner
    {
        Demand storage d = allDemands[_index];

        MatcherProperties storage m = d.matchProp;
        m.currentWhPerperiod = _currentWhPerperiod;
        m.certInCurrentperiod = _certInCurrentperiod;
        m.consumptionLastSetInperiod = _consumptionLastSetInperiod;
    }

    /// @notice function that returns if a demands exists
    /// @param _index identifier
    /// @return true if demand exists
    function demandExists(uint _index)
        external
        view 
        returns (bool)
    {
        return allDemands[_index].enabled;
    }

    /// @notice function to get the hash-identifier of an active demand in the activeDemands-array
    /// @param _index index of the element in the array
    /// @return hash-identifier of an active demand
    function getActiveDemandIdAt(uint _index)
        external 
        view 
        onlyOwner
        returns (uint)
    {
        return activeDemands[_index];
    }

    /// @notice function to retrieve the length of the activeDemands-array
    /// @return the length of the activeDemands-array
    function getActiveDemandListLength()
        external
        view 
        onlyOwner
        returns (uint)
    {
        return activeDemands.length;
    }

    /// @notice funtion to retrieve the length of the allDemands-array
    /// @return the length of the allDemands-array
    function getAllDemandListLength() 
        external
        view
        onlyOwner
        returns (uint)
    {
        return allDemands.length;
    }
    
    /// @notice function to get the information if the coupling-struct
    /// @dev at the moment arrays can't be accessed in other contracts due to their dynamic length
    /// @param _index identifier
    /// @return used timeFrame, arrays of producing and consuming assets
    function getDemandCoupling(uint _index)
        external
        view 
        onlyOwner
        returns(
            int producingAssets,
            int consumingAssets
        ) 
    {
        Demand storage d = allDemands[_index];
        Coupling storage s = d.couple;
        return (s.producingAssets,s.consumingAssets);
    }

    
    /// @notice function to retrieve the general informations of a demand
    /// @param _index identifier of the demand
    /// @return the originator, buyer, startTime, endTime, currency, coupled
    function getDemandGeneral(uint _index)
        external
        view 
        onlyOwner 
        returns(
            address originator,
            address buyer,
            uint startTime,
            uint endTime,
            uint timeframe,
            uint pricePerCertifiedKWh,
            uint currency,
            bool coupled
        ) 
    {
        Demand storage d = allDemands[_index];
        GeneralInfo storage g = d.general;
        return (g.originator, g.buyer, g.startTime, g.endTime, g.timeframe, g.pricePerCertifiedKWh, g.currency, g.coupled);
    }

    /// @notice function to get the matcher-properties of a demand
    /// @param _index identifier
    /// @return amount of Wh per period, current Wh per period, certificates in current period, last period where a consumption was set and the matcher-address
    function getDemandMatcherProperties(uint _index)
        external
        view 
        onlyOwner
        returns (  
            uint wHAmountPerperiod,
            uint currentWhPerperiod,
            uint certInCurrentperiod,
            uint consumptionLastSetInperiod,
            address matcher
        ) 
    {
        Demand storage d = allDemands[_index];
        MatcherProperties storage m = d.matchProp;
        return (m.targetWhPerperiod, m.currentWhPerperiod, m.certInCurrentperiod, m.consumptionLastSetInperiod, m.matcher);
    }


    /// @notice function to get the price-driving informations
    /// @param _index identifier
    /// @return location country and region, fueltype and CO2-offset
    function getDemandPriceDriving(uint _index)
        external
        view 
        onlyOwner
        returns (
            bytes32 locationCountry,
            bytes32 locationRegion,
            uint assettype,
            uint minCO2Offset
        ) 
    {
        Demand storage d = allDemands[_index];
        PriceDriving storage p = d.priceDriving;
        return (p.location.country, p.location.region, p.assettype, p.minCO2Offset);
    }

    /// @notice function to return the creationtime of the demand
    /// @param _id identifier
    /// @return blocktime of the creation of the demand
    function getStartEpoche(uint _id)
        external
        view 
        onlyOwner 
        returns (uint)
    {    
        return allDemands[_id].created;
    }

    /// @notice Funtion to get the used timeframe for an demand
    /// @dev will return an unsigned integer, that has to be converted to a timeframe in the logic-contract
    /// @return the chosen timeframe for a demand
    function getTimeFrame(uint _index)
        external
        onlyOwner
        view
        returns (uint)
    {
            return allDemands[_index].general.timeframe;
    }
}




