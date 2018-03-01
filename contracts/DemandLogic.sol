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

import "./DemandDb.sol";
import "./RoleManagement.sol";
import "./CertificateLogic.sol";
import "./Updatable.sol";
import "./CoO.sol";
import "./AssetProducingRegistryLogic.sol";
import "./AssetConsumingRegistryLogic.sol";


/// @title The logic contract for the AgreementDB of Origin list
contract DemandLogic is RoleManagement, Updatable {

    /// @notice database contract
    DemandDB public db;

    event createdEmptyDemand(address sender, uint id);
    event LogDemandFullyCreated(uint id);
    event LogDemandExpired(uint id);
    event LogMatcherPropertiesUpdate(uint index, uint currentWhPerPeriod, uint certInCurrentPeriod, uint currentPeriod, uint certID);

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

    enum DemandProperties {
        originator,
        assetType, 
        compliance, 
        country, 
        region, 
        minCO2, 
        producing, 
        consuming  
    }

    modifier isInitialized {
        require(address(db) != 0x0);
        _;
    }

    modifier doesNotExist(uint _index) {
        require(!db.demandExists(_index));
        _;
    }

    /// @notice constructor
    /// @param _cooContract coo-contract
    function DemandLogic(CoO _cooContract) 
        public
        RoleManagement(_cooContract) 
    {
  
    }

    /// @notice Function to create an empty demand, functions initGeneralandCouplong, initMatcherProperties and initPricedriving have to be called in order to fully create a demandc
    /// @dev will return an event with the event-Id
    function createDemand(bool[] _properties)
        external
        isInitialized
        onlyRole(RoleManagement.Role.AgreementAdmin)
     {
        // TODO: create empty demand in array

        if(_properties[0] && _properties[6]) revert();
        uint demandID = db.createEmptyDemand(createDemandBitmask(_properties));
        createdEmptyDemand(msg.sender, demandID);
    }

    /// @notice fuction to set the database contract, can only be called once
    /// @param _dbAddress address of the database contract
    function init(DemandDB _dbAddress) 
        external
        onlyRole(RoleManagement.Role.TopAdmin)
    {
        require(address(db) == 0x0);
        db = _dbAddress;
    }

    /// @notice function to create a demand and coupling of a new demand, should be called 1st
    /// @param _id identifier, if it's 0 an id will be generated 
    /// @param _originator address of an energy-producer, can be 0x0
    /// @param _buyer address oh the buyer
    /// @param _pricePerCertifiedKWh price per certified kWh
    /// @param _currency currency to be used
    /// @param _tf timeFrame
    /// @param _prodAsset array with producing assets, can be empty
    /// @param _consAsset array with consuming assets, can be empty 
    function initGeneralAndCoupling(
        uint _id,
        address _originator,
        address _buyer,
        uint _startTime,   
        uint _endTime,
        TimeFrame _tf,     
        uint _pricePerCertifiedKWh,
        Currency _currency,
        uint _prodAsset,
        uint _consAsset
    )
        external
        onlyRole(RoleManagement.Role.AgreementAdmin)
        isInitialized
        doesNotExist(_id)
    {
        uint demandMask = db.getDemandMask(_id);
/*   consumingAsset: (min(maxcapacity oder targetWhPerPerid oder consumed(meterread)) - wie viel energie bereits geliefert ) <= neue energie   
        */
        createGeneralDemandInternal( 
             _id,
             _originator,
             _buyer,
             _startTime,   
             _endTime,
             _tf,     
             _pricePerCertifiedKWh,
             _currency,
             demandMask);
        createCouplingInternal(_id, _prodAsset, _consAsset, demandMask);
        checkForFullDemand(_id);

    }

    function createCouplingInternal(uint _id, uint _prodAsset, uint _consAsset, uint _demandMask)
        internal
    {
        
        if(hasDemandPropertySet(DemandProperties.producing, _demandMask)){
            require(AssetProducingRegistryLogic(address(cooContract.assetProducingRegistry())).getActive((_prodAsset)));
        }

        if(hasDemandPropertySet(DemandProperties.consuming, _demandMask)){
            require(AssetConsumingRegistryLogic(address(cooContract.assetConsumingRegistry())).getActive((_consAsset)));
        }
         db.createCoupling(_id, _prodAsset, _consAsset);
    }

    function createGeneralDemandInternal( 
        uint _id,
        address _originator,
        address _buyer,
        uint _startTime,   
        uint _endTime,
        TimeFrame _tf,     
        uint _pricePerCertifiedKWh,
        Currency _currency,
        uint _demandMask)
        internal
    {
        db.createGeneralDemand(_id, _originator, _buyer, _startTime, _endTime, uint(_tf), _pricePerCertifiedKWh, uint(_currency));
    }

      /// @notice function to create the matcher-properties
    /// @param _id identifier
    /// @param _kWAmountPerPeriod amounts of KW per Period
    /// @param _productionLastSetInPeriod todo: needed?
    /// @param _matcher address of the matcher
    function initMatchProperties(
        uint _id,
        uint _kWAmountPerPeriod,
        uint _productionLastSetInPeriod,
        address _matcher
    )
        external
        onlyRole(RoleManagement.Role.AgreementAdmin) 
        isInitialized
        doesNotExist(_id)
    {
        db.createMatchProperties(_id, _kWAmountPerPeriod, 0, 0, _productionLastSetInPeriod, _matcher);
        checkForFullDemand(_id);
    }

    /// @notice function to create a priceDriving-struct
    /// @param _id identifier
    /// @param _locationCountry country where the energy should be generated
    /// @param _locationRegion region where the energy should be generated
    /// @param _type fueltype
    /// @param _minCO2Offset CO2-offset
    function initPriceDriving(
        uint _id,
        bytes32 _locationCountry,
        bytes32 _locationRegion,
        AssetProducingRegistryLogic.AssetType _type,
        uint _minCO2Offset,
        int _registryCompliance
        
    )
        external
        onlyRole(RoleManagement.Role.AgreementAdmin) 
        isInitialized
        doesNotExist(_id)
    {
        db.createPriceDriving( _id, _locationCountry, _locationRegion, 0x0, 0x0, 0x0, 0, 0x0, 0x0, uint(_type), _minCO2Offset, _registryCompliance);
        checkForFullDemand(_id);
    }

    function matchCertificate(uint _id, uint _certificateId) 
        external
        isInitialized
    {
        var(prodAssetId, , powerInW, retired, , coSaved, escrow, creationTime) = CertificateLogic(address(cooContract.certificateRegistry())).getCertificate(_certificateId);
        require(!retired && (creationTime + 365 days) <= now && msg.sender == escrow);
        var (owner, currentWhPerPeriod, certInCurrentPeriod, currentPeriod) = matchInternal(_id, powerInW, prodAssetId);

          // at the end we have to update the matcher-properties 
        db.updateMatchProperties(_id, currentWhPerPeriod,certInCurrentPeriod, currentPeriod);
        LogMatcherPropertiesUpdate(_id, currentWhPerPeriod, certInCurrentPeriod, currentPeriod, _certificateId);

        CertificateLogic(address(cooContract.certificateRegistry())).transferOwnershipByEscrow( _id,  owner);
    }

    function matchInternal(uint _id, uint _wCreated, uint _prodAssetId)
        internal
        isInitialized 
        returns (address owner,  uint currentWhPerPeriod, uint certInCurrentPeriod, uint currentPeriod)
    {
        // we have to check if a demand with that identifier actually exists
        var (generalExists, priceDrivingExists, matcherExists) = getExistStatus(_id);
        require(generalExists && priceDrivingExists && matcherExists);
        bool passCheck;
        (owner, passCheck,) = checkDemandGeneral(_id, _prodAssetId);
        require(passCheck);
        (passCheck,) = checkPriceDriving(_id, _prodAssetId, _wCreated);
        require(passCheck);
        (currentWhPerPeriod,certInCurrentPeriod, currentPeriod,passCheck,) = checkMatcher(_id, _wCreated); 
        require(passCheck);

    }

    /// @notice function to match produced energy with the needed demand
    /// @param _index identifier of the demand
    /// @param _wCreated amount of Wh created
    /// @param _prodAssetId asset-Id that produced the energy
    function matchDemand(uint _index, uint _wCreated, uint _prodAssetId)
        external 
        isInitialized
    {   
      
      /*   // we have to check if a demand with that identifier actually exists
        var (generalExists, priceDrivingExists, matcherExists) = getExistStatus(_index);
        require(generalExists && priceDrivingExists && matcherExists); 
    
        // we're checking the general-informations. Owner and coupled parameters are returned in order to avoid a 2nd call to get them
        var(owner,passCheck,) = checkDemandGeneral(_index, _prodAssetId);
        require(passCheck);
        // we're checking the price-driving informations
        (passCheck,) = checkPriceDriving(_index, _prodAssetId, _wCreated);
        require(passCheck);
        
        // we're checking if the matching-informations are correct. 
        // CurrentWhPerPriode, certInCurrentPeriod and the currentPeriod are returned to avoid a 2nd call
        bool passCheck;
        uint currentWhPerPeriod;
        uint certInCurrentPeriod;
        uint currentPeriod;
        (currentWhPerPeriod,certInCurrentPeriod, currentPeriod,passCheck,) = checkMatcher(_index,_wCreated); 
        require(passCheck);
        */
        var (owner, currentWhPerPeriod, certInCurrentPeriod, currentPeriod) =   matchInternal(_index, _wCreated, _prodAssetId);
        // all the criteria are matched, so we can create the certificate 
        uint certId = CertificateLogic(address(cooContract.certificateRegistry())).createCertificate(_prodAssetId, owner, _wCreated);
         
        // at the end we have to update the matcher-properties 
        db.updateMatchProperties(_index, currentWhPerPeriod,certInCurrentPeriod, currentPeriod);
        LogMatcherPropertiesUpdate(_index, currentWhPerPeriod, certInCurrentPeriod, currentPeriod, certId);
    }
  
    /// @notice Updates the logic contract
    /// @param _newLogic Address of the new logic contract
    function update(address _newLogic) 
        external
        onlyAccount(address(cooContract))
    {
        db.changeOwner(_newLogic);
    }  

    /// @notice funciton to retrieve the identifier-hash of an active demand 
    /// @param _index position in the array
    /// @return identifier-hash
    function getActiveDemandIdAt(uint _index) external isInitialized view returns (uint) {
        return db.getActiveDemandIdAt(_index);
    }

    /// @notice function to return the length of the acticeDemands-array in the database
    /// @return length if the activeDemands-array in the database
    function getActiveDemandListLength() external isInitialized view returns (uint) {
        return db.getActiveDemandListLength();
    }

    /// @notice function to return the length of the allDemands-array in the database
    /// @return length of the allDemansa-array
    function getAllDemandListLength() external isInitialized view returns (uint) {
        return db.getAllDemandListLength();
    }

    /// @notice function to get the information if the coupling-struct
    /// @param _index identifier
    /// @return used timeFrame
    function getDemandCoupling(uint _index)
        external
        view 
        isInitialized
        returns(
            uint producingAssets,
            uint consumingAssets
        ) 
    {
       return db.getDemandCoupling(_index);
    }

    /// @notice function to retrieve the general informations of a demand
    /// @param _index identifier of the demand
    /// @return the originator, buyer, startTime, endTime, currency, coupled
    function getDemandGeneral(uint _index)
        external 
        isInitialized        
        view 
        returns (
            address originator,
            address buyer,
            uint startTime,
            uint endTime,
            uint timeframe,
            uint pricePerCertifiedKWh,
            uint currency,
            uint demandMask
        )
    {
        return db.getDemandGeneral(_index);
    }

        /// @notice function to get the matcher-properties of a demand
    /// @param _index identifier
    /// @return amount of Wh per Period, current Wh per Period, certificates in current Period, last Period where a consumption was set and the matcher-address
    function getDemandMatcherProperties(uint _index)
        external
        view 
        isInitialized
        returns (  
            uint targetWhPerPeriod,
            uint currentWhPerPeriod,
            uint certInCurrentPeriod,
            uint productionLastSetInPeriod,
            address matcher
        )
    {
       return db.getDemandMatcherProperties(_index);
    }

    /// @notice function to get the price-driving informations
    /// @param _index identifier
    /// @return location country and region, fueltype and CO2-offset
    function getDemandPriceDriving(uint _index)
        external
        view 
        isInitialized
        returns (
            bytes32 locationCountry,
            bytes32 locationRegion,
            uint assettype,
            uint minCO2Offset,
            int registryCompliance,
            bool isInit
        )
    {
      return db.getDemandPriceDriving(_index);
    }

    /// @notice function to get the existing status of the different demand-structs
    /// @param _index identifier
    /// @return returns existing of generalInformation, priceDriving and matcher-Properties
    function getExistStatus(uint _index)
        public
        view 
        returns (bool general, bool priceDriving, bool matchProp )
    {
       var(,buyer,,,,,,) = db.getDemandGeneral(_index);
       general = (buyer != address(0));
       var(,,,,matcher) = db.getDemandMatcherProperties(_index);
       matchProp = (matcher != address(0));
       (,,,,priceDriving) = db.getDemandPriceDriving(_index);

    }
    /// @notice funciton to remove an active demand, can only be successfully processed if the the endTime already passed
    /// @param _index index of the demand in the activeDemands-array
    function removeActiveDemand(uint _index)
        public 
    {
        var ( , , , endTime, , , , ) = db.getDemandGeneral(_index);
        require(endTime < now);
        db.removeActiveDemand( _index);
        LogDemandExpired(_index);
    }

    /// @notice function to check the fitting of the general-demand information with a matching
    /// @param _index identifier
    /// @param _prodAssetId asset-id that produced some energy
    /// @return originator-address, coupled-flag, if there was an error and what check failed
    function checkDemandGeneral(uint _index, uint _prodAssetId)
        public
        view
        returns (address, bool, string)
    {
        var   ( originator, buyer, startTime, endTime, , , , ) = db.getDemandGeneral(_index);
        var( , owner, , , , , , , , , ,) = AssetProducingRegistryLogic(address(cooContract.assetProducingRegistry())).getAssetGeneral(_prodAssetId); 
        
        if(originator != address(0x0)) {
            if(originator != owner)
             return (0x0, false, "wrong originator");
            }

        if(!( 
           startTime <= now && 
           endTime >= now
           && isRole(RoleManagement.Role.Trader,owner) 
           && isRole(RoleManagement.Role.Trader, buyer)
           && isRole(RoleManagement.Role.AssetManager, owner) 
        )) return (0x0, false, "starttime or rolecheck");

        var (prodAsset, ) = db.getDemandCoupling(_index);

        if (hasDemandPropertySet(DemandProperties.producing, db.getDemandMask(_index))) {
           if (_prodAssetId != prodAsset)
            return (0x0, false, "wrong prodAssetId");
        }

        /*
        if (consAsset >= 0) {
           if (int(_consAssetId) != consAsset)
            return (0x0, false, "wrong consAssetId");
        }
        */
        return (buyer, true, "everything ok");
    }

     /// @notice function to check the matcher-properties
    /// @param _index identifier
    /// @param _wCreated Wh created 
    /// @return currentWhPerPeriod, certInCurrentPeriod, currentPeriod, if there was an error and what check failed
    function checkMatcher(uint _index, uint _wCreated)
        public
        view 
        returns (uint , uint , uint, bool, string )
    {
        var( whAmountPerPeriod, currentWhPerPeriod, certInCurrentPeriod, lastPeriod, matcher) = db.getDemandMatcherProperties(_index);
       
       
        if (matcher != msg.sender) return (0,0,0, false, "wrong matcher");
      
            uint currentPeriod = getCurrentPeriod(_index);

            if (currentPeriod == lastPeriod) {
                if(currentWhPerPeriod+_wCreated > whAmountPerPeriod) return (0,0,0, false, "too much whPerPeriode"); }            
                else {
                if(_wCreated > whAmountPerPeriod) return (0,0,0, false, "too much whPerPeriode and currentPeriod != lastPeriod");
                lastPeriod = currentPeriod;
                currentWhPerPeriod = 0;
                certInCurrentPeriod =0;
            }
        currentWhPerPeriod += _wCreated;
        certInCurrentPeriod += 1;
        return (currentWhPerPeriod, certInCurrentPeriod, currentPeriod, true, "everything OK");
        
    }

    /// @notice function to check the priceDriving-oarameters for the matching
    /// @param _index identifier
    /// @return if there was an error and what check failed
    function checkPriceDriving(uint _index, uint _prodAssetId, uint _wCreated)
        public
        view
        returns (bool, string)
    {
        if(_wCreated == 0) return (false, "no energy created");

        var (locationCountryDemand, locationRegionDemand, assettypeDemand, minCO2OffsetDemand,compliance, ) = db.getDemandPriceDriving(_index);

        if(AssetProducingRegistryLogic.AssetType(assettypeDemand) != AssetProducingRegistryLogic(cooContract.assetProducingRegistry()).getAssetType( _prodAssetId))
            return (false, "wrong asset type");

        if (locationCountryDemand != 0x0) { 
            var (countryAsset, regionAsset, , , , , ) = AssetProducingRegistryLogic(cooContract.assetProducingRegistry()).getAssetLocation( _prodAssetId);
        
            if(locationCountryDemand != countryAsset)
                return (false, "wrong country");

            if(locationRegionDemand != 0x0){
                if(locationRegionDemand != regionAsset)
                    return (false, "wrong region");
            }
            
        }

        if(compliance > 0){
           if(uint(AssetProducingRegistryLogic(cooContract.assetProducingRegistry()).getCompliance(_prodAssetId)) != uint(compliance)) return (false, "wrong compliance");
        }

        uint co2Saved = AssetProducingRegistryLogic(cooContract.assetProducingRegistry()).getCoSaved(_prodAssetId, _wCreated); 
        uint co2PerWh = ((co2Saved * 1000) / _wCreated)/10;

        if(co2PerWh < minCO2OffsetDemand)
            return (false, "wrong CO2");

        

        return (true,"everything OK");
    }

    /// @notice function to calculate the current Period for a demand
    /// @param _id identifier
    /// @return current Period 
    function getCurrentPeriod(uint _id) 
        public 
        view 
        isInitialized
        returns (uint) 
    {

        uint tf = db.getTimeFrame(_id);
     // TimeFrame tf = TimeFrame.yearly; 
        if ( TimeFrame(tf) == TimeFrame.yearly) 
        {
            return ( now - db.getStartEpoche(_id) ) / (1 years);
        }
        if ( TimeFrame(tf) == TimeFrame.monthly) {
            return ( now - db.getStartEpoche(_id) ) / (30 days);
        }
        if ( TimeFrame(tf) == TimeFrame.daily) {
            return ( now - db.getStartEpoche(_id) ) / (1 days);
        }  
        if ( TimeFrame(tf) == TimeFrame.hourly) {
            return ( now - db.getStartEpoche(_id) ) / (1 hours);
        }  
    }

    /// @notice function to check if a full demand is created and enabling him
    /// @param _index identifier
    function checkForFullDemand(uint _index)
        private
    {
        var (generalExists, priceDrivingExists, matcherExists) = getExistStatus(_index);

        if (generalExists && priceDrivingExists && matcherExists) {
            db.setEnabled(_index,true);
            db.addActiveDemand(_index);
            db.setDemandCreationTime(_index, now);
            LogDemandFullyCreated(_index);
        }
    }   

    function createDemandBitmask (bool[] demandArray)
        public
        pure
        returns (uint demandMask)
    {
         /** Bitmaske: assetType, compliance, country, region, minCO2, producing, consuming */
        for(uint8 i = 0; i < 8; i++) {
            if(demandArray[i]){
                demandMask += uint(2) ** uint(i);
            }
        }
    }

    /// @notice funciton for comparing the role and the needed rights of an user
    /// @return whether the user has the corresponding rights for the intended action
    function hasDemandPropertySet(DemandProperties _props, uint _demandMask) public pure returns (bool) { 
        uint demandActive = uint(2) ** uint(_props);
        return (_demandMask & demandActive != 0);
    }

}