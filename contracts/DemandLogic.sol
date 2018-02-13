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

/// @title The Database contract for the AgreementDB of Origin list
/// @notice This contract only provides getter and setter methods

import "./AssetRegistryDB.sol";
import "./DemandDb.sol";
import "./DemandInterface.sol";
import "./RoleManagement.sol";
import "./CertificateLogic.sol";
import "./Updatable.sol";
import "./CoO.sol";
import "./AssetRegistryLogic.sol";

contract DemandLogic is RoleManagement, Updatable {

    DemandDB public db;

    event createdId(bytes32 id);
    event demandCreated(bytes32 id);
    event LogMatcherPropertiesUpdate(bytes32 index, uint currentWhPerPeriode, uint certInCurrentPeriode, uint currentPeriode, uint certID);

    modifier isInitialized {
        require(address(db) != 0x0);
        _;
    }

    modifier doesNotExist(bytes32 _index) {
        require(!db.demandExists(_index));
        _;
    }

    function DemandLogic(CoO _cooContract) 
        public
        RoleManagement(_cooContract) 
    {
  
    }

    function init(DemandDB _dbAddress) 
        external
        onlyRole(RoleManagement.Role.TopAdmin)
    {
        require(address(db) == 0x0);
        db = _dbAddress;
    }

    function getCurrentPeriode(DemandDB.TimeFrame _tf, bytes32 _id) public view returns (uint) {
        if ( _tf == DemandDB.TimeFrame.yearly) {
            return ( now - db.getStartEpoche(_id) ) / (1 years);
        }
        if ( _tf == DemandDB.TimeFrame.monthly) {
            return ( now - db.getStartEpoche(_id) ) / (30 days);
        }
        if ( _tf == DemandDB.TimeFrame.daily) {
            return ( now - db.getStartEpoche(_id) ) / (1 days);
        }  
        if ( _tf == DemandDB.TimeFrame.hourly) {
            return ( now - db.getStartEpoche(_id) ) / (1 hours);
        }  
    }

    function getAllDemandListLength() public isInitialized view returns (uint) {
        return db.getAllDemandListLength();
    }

    function getAllDemandListAt(uint _index) public isInitialized view returns (bytes32){
        return db.getAllDemandIdAt(_index);
    }
    
    function getActiveDemandListLength() public isInitialized view returns (uint) {
        return db.getActiveDemandListLength();
    }
 
    function getActiveDemandIdAt(uint _index) public isInitialized view returns (bytes32) {
        return db.getActiveDemandIdAt(_index);
    }

    function createDemand(
        bytes32 _id,
        address _originator,
        address _buyer,
        uint _agreementDate,
        uint _startTime,
        uint _endTime,
        uint _pricePerCertifiedKWh,
        DemandDB.Currency _currency,
        bool _coupled,
        DemandDB.TimeFrame _tf,
        uint[] _prodAssets,
        uint[] _consAssets
    )
        public
        onlyRole(RoleManagement.Role.AgreementAdmin)
        isInitialized
        doesNotExist(_id)
    {

        if(_id == 0x0) {
            _id = keccak256(_originator,_buyer, _agreementDate, _startTime, _endTime, _pricePerCertifiedKWh, _currency, _tf, _prodAssets, _consAssets);
            createdId(_id);
        }
        db.createGeneralDemand(_id, _originator, _buyer, _agreementDate, _startTime, _endTime, _pricePerCertifiedKWh, _currency, _coupled);
        if (_coupled)
            db.createCoupling(_id, _tf, _prodAssets, _consAssets);
    }
    
    function createGeneralDemand(
        bytes32 _id,
        address _originator,
        address _buyer,
        uint _agreementDate,
        uint _startTime,
        uint _endTime,
        uint _pricePerCertifiedKWh,
        DemandDB.Currency _currency,
        bool _coupled
    )
        public
        onlyRole(RoleManagement.Role.AgreementAdmin)
        isInitialized
        doesNotExist(_id)
    {
        db.createGeneralDemand(_id, _originator, _buyer, _agreementDate, _startTime, _endTime, _pricePerCertifiedKWh, _currency, _coupled);
        checkForFullDemand(_id);
    }    

    function createCoupling(
        bytes32 _id,
        DemandDB.TimeFrame _tf,
        uint[] _prodAssets,
        uint[] _consAssets
    )
        public 
        onlyRole(RoleManagement.Role.AgreementAdmin) 
        isInitialized
    {
        db.createCoupling(_id, _tf, _prodAssets, _consAssets);
    }
    
    function createPriceDriving(
        bytes32 _id,
        bytes32 _locationCountry,
        bytes32 _locationRegion,
        AssetRegistryDB.FuelType _type,
        uint _minCO2Offset 
    )
        public
        onlyRole(RoleManagement.Role.AgreementAdmin) 
        isInitialized
        doesNotExist(_id)
    {
        db.createPriceDriving(_id,_locationCountry, _locationRegion, _type, _minCO2Offset);
        checkForFullDemand(_id);
    }

    function createMatchProperties(
        bytes32 _id,
        uint _kWAmountPerPeriode,
        uint _consumptionLastSetInPeriode,
        address _matcher
    )
        public
        onlyRole(RoleManagement.Role.AgreementAdmin) 
        isInitialized
        doesNotExist(_id)
    {
        db.createMatchProperties(_id, _kWAmountPerPeriode, 0, 0, _consumptionLastSetInPeriode, _matcher);
        checkForFullDemand(_id);
    }

     function getDemandGeneral(bytes32 _index)
        public 
        isInitialized        
        view 
        returns (
            address originator,
            address buyer,
            uint agreementDate,
            uint startTime,
            uint endTime,
            DemandDB.Currency currency,
            bool coupled
        )
    {
        return db.getDemandGeneral(_index);
    }

     function getDemandPriceDriving(bytes32 _index)
        public
        view 
        returns (
            bytes32 locationCountry,
            bytes32 locationRegion,
            AssetRegistryDB.FuelType assettype,
            uint minCO2Offset
        )
    {
      return db.getDemandPriceDriving(_index);
    }

    function getDemandCoupling(bytes32 _index)
        public
        view 
        returns(
            DemandDB.TimeFrame
        ) 
    {
       var(tf,,) = db.getDemandCoupling(_index);

       return(tf);
    }

    function getDemandMatcherProperties(bytes32 _index)
        public
        view 
        returns (  
            uint targetWhPerPeriode,
            uint currentWhPerPeriode,
            uint certInCurrentPeriode,
            uint consumptionLastSetInPeriode,
            address matcher
        )
    {
       return db.getDemandMatcherProperties(_index);
    }

        /// @notice Updates the logic contract
    /// @param _newLogic Address of the new logic contract
    function update(address _newLogic) 
        external
        onlyAccount(address(cooContract))
    {
        db.changeOwner(_newLogic);

    }  

    function checkForFullDemand(bytes32 _index)
        private
    {
        var (generalExists, priceDrivingExists, matcherExists) = db.getExistStatus(_index);

        if (generalExists && priceDrivingExists && matcherExists) {
            db.setEnabled(_index,true);
            db.addActiveDemand(_index);
            db.addFullDemand(_index);
            demandCreated(_index);
            db.setDemandCreationTime(_index);
        }
    }

    function matchDemand(bytes32 _index, uint _wCreated, uint _prodAssetId, bytes32 _dataLog)
        public 
    {
        var (generalExists, priceDrivingExists, matcherExists) = db.getExistStatus(_index);
        require(generalExists && priceDrivingExists && matcherExists);

        var(owner, coupled) = checkDemandGeneral(_index, _prodAssetId);
        checkPriceDriving(_index);
        var (currentWhPerPeriode,certInCurrentPeriode, currentPeriode) = checkMatcher(_index,_wCreated, coupled);  
        uint certId = CertificateLogic(address(cooContract.certificateRegistry())).createCertificate(_prodAssetId, owner, _wCreated, _dataLog);
        db.updateMatchProperties(_index, currentWhPerPeriode,certInCurrentPeriode, currentPeriode);
        LogMatcherPropertiesUpdate(_index, currentWhPerPeriode, certInCurrentPeriode, currentPeriode, certId);
    }

    function checkDemandGeneral(bytes32 _index, uint _prodAssetId)
        public
        view
        returns (address, bool)
    {
        var(originator, , , startTime, endTime, , coupled) = db.getDemandGeneral(_index);
        var( , owner, , , , , , active, ) = AssetRegistryLogic(address(cooContract.assetRegistry())).getAsset(_prodAssetId); 
        
        require( 
          //  originator == owner && 
           startTime >= now && 
           endTime <= now 
            && active 
            
            );

        if (coupled) {
            var(timeframe, , ) = db.getDemandCoupling(_index);

               
        }
        if(db.getProducingAssetsListLength(_index) > 0)
            require(db.checkIfProducingAssetContains(_index, _prodAssetId));

        return (originator,coupled);
    }

    // TODO: get required information from asset ( to be implemented there aswell )
    function checkPriceDriving(bytes32 _index)
        public
        view 
    {
        var (locationCountryDemand, locationRegionDemand, assettypeDemand, minCO2OffsetDemand) = db.getDemandPriceDriving(_index);
    

       // require(locationCountry == _locationCountry && _locationRegion == locationRegion && assettype == _type && minCO2Offset == _Co2);
    }

    function checkMatcher(bytes32 _index, uint _wCreated, bool _coupled)
        public
        view 
        returns (uint,uint,uint)
    {
        var( WhAmountPerPeriode, currentWhPerPeriode, certInCurrentPeriode, lastPeriode, matcher) = db.getDemandMatcherProperties(_index);
        require (matcher == msg.sender);

        var(tf, ,) = db.getDemandCoupling(_index);
        if (_coupled) {
            uint currentPeriode = getCurrentPeriode(tf, _index);

            if (currentPeriode == lastPeriode) 
                assert(currentWhPerPeriode+_wCreated <= WhAmountPerPeriode);
            else 
                assert(_wCreated <= WhAmountPerPeriode);
        } else {
            assert(currentWhPerPeriode+_wCreated <= WhAmountPerPeriode);        
        }
        currentWhPerPeriode += _wCreated;
        certInCurrentPeriode += 1;
        return (currentWhPerPeriode, certInCurrentPeriode, currentPeriode);
    }

    function getExistsStatus(bytes32 _index)
        public
        view
        returns (bool,bool,bool)
        {
            return db.getExistStatus(_index);
        }


    function getProducingAssetsListLength(bytes32 _index)
        public 
        view
        returns (uint)
    {
        return db.getProducingAssetsListLength(_index);
    }

    function getProducingAssetAt(bytes32 _id, uint _index)
        public 
        view
        returns(uint)
    {
        return db.getProducingAssetAt(_id,_index);
    }

}