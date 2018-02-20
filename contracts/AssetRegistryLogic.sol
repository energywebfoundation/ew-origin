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

pragma solidity ^0.4.18;

import "./AssetRegistryDB.sol";
import "./UserLogic.sol";
import "./CoO.sol";
import "./RoleManagement.sol";
import "./CertificateLogic.sol";
import "./Updatable.sol";

/// @title The logic contract for the asset registration
/// @notice This contract provides the logic that determines how the data is stored
/// @dev Needs a valid AssetRegistryDB contract to function correctly
contract AssetRegistryLogic is RoleManagement, Updatable {

    ///@notice The AssetRegistryDB contract
    AssetRegistryDB public db;

    event LogAssetCreated(address sender, uint id);
  
    modifier isInitialized {
        require(address(db) != 0x0);
        _;
    }

    event LogNewMeterRead(uint indexed _assetId, uint _oldMeterRead, uint _newMeterRead, uint _certificatesCreatedForWh, uint _oldCO2OffsetReading, uint _newCO2OffsetReading, bool _serviceDown);
    
    enum AssetType {
        Wind,
        Solar,
        RunRiverHydro,
        BiomassGas
    }

    /// @notice Constructor
    /// @param _cooContract The address of the coo contract
    function AssetRegistryLogic(CoO _cooContract) 
        public
        RoleManagement(_cooContract) 
    {
  
    }

    /// @notice Checks if a fully Asset-struct is created, enabled if asset all information are there
    /// @dev only for internal use
    /// @param _index the The index / identifier of an asset
    function checkForFullAsset(uint _index)
        internal
    {
        var (general, location, asset) = db.getExistStatus(_index);

        if(general && location && !asset){
            db.setAssetExistStatus(_index,true);
        }
    }

    /// @notice function to create a new empty asset, triggers event with created AssetID. To actually create an Asset the functions initGeneral and initLocations have to be called
    /// @dev 
    function createAsset() 
        external
        onlyRole(RoleManagement.Role.AssetAdmin)
     {
        uint assetId = db.createAsset();
        LogAssetCreated(msg.sender, assetId);
    }

    /// @notice Sets the asset registry db contract 
    /// @param _dbAddress The address of the db contract
    function init(AssetRegistryDB _dbAddress) 
        external
        onlyRole(RoleManagement.Role.TopAdmin)
    {
        require(address(db) == 0x0);
        db = _dbAddress;
    }

    /// @notice Sets the general information of an asset in the database
    /// @param _index the The index / identifier of an asset
    /// @param _smartMeter The address of the smart meter
    /// @param _owner The address of the asset owner
    /// @param _assetType The type of fuel used to generate power
    /// @param _operationalSince The timestamp since the asset is operational
    /// @param _capacityWh The capacity in Wh of the asset
    /// @param _active true if active
    function initGeneral
        (
        uint _index,
        address _smartMeter,
        address _owner,
        AssetType _assetType,
        uint _operationalSince,
        uint _capacityWh,
        bool _active
    ) 
        external
        isInitialized
        userHasRole(RoleManagement.Role.AssetManager, _owner)
        onlyRole(RoleManagement.Role.AssetAdmin)
    {  
        db.initGeneral(_index, _smartMeter, _owner, uint(_assetType), _operationalSince, _capacityWh, 0, 0, _active, 0x0, 0, 0);
        checkForFullAsset(_index);
    }

    /// @notice Sets the location information of an asset in the database
    /// @param _index the The index / identifier of an asset
    /// @param _country The country where the asset is located
    /// @param _region The region where the asset is located
    /// @param _zip The zip coe where the asset is located
    /// @param _city The city where the asset is located
    /// @param _street The street where the asset is located
    /// @param _houseNumber The house number where the asset is located
    /// @param _gpsLatitude The gps-latitude of the asset
    /// @param _gpsLongitude The gps-longitude of the asset 
    function initLocation (
        uint _index,
        bytes32 _country,
        bytes32 _region,
        bytes32 _zip,
        bytes32 _city,
        bytes32 _street,
        bytes32 _houseNumber,
        bytes32 _gpsLatitude,
        bytes32 _gpsLongitude
    )
        external 
        isInitialized
        onlyRole(RoleManagement.Role.AssetAdmin)
    {
        db.initLocation(_index, _country, _region, _zip, _city, _street, _houseNumber, _gpsLatitude, _gpsLongitude);
         checkForFullAsset(_index);
    }
    
    /// @notice Logs meter read
    /// @param _assetId The id belonging to an entry in the asset registry
    /// @param _newMeterRead The current meter read of the asset
    /// @param _lastSmartMeterReadFileHash Last meter read file hash
    /// @dev The client needs to check if the blockgas limit could be reached and if so the log should be splitted 
    function saveSmartMeterRead(uint _assetId, uint _newMeterRead, bytes32 _lastSmartMeterReadFileHash, uint _CO2OffsetMeterRead, bool _CO2OffsetServiceDown ) 
        external
        isInitialized
        onlyAccount(db.getSmartMeter(_assetId))
    {
        require(db.getActive(_assetId));
        LogNewMeterRead(_assetId, db.getLastSmartMeterReadWh(_assetId), _newMeterRead, db.getCertificatesCreatedForWh(_assetId), db.getlastSmartMeterCO2OffsetRead(_assetId), _CO2OffsetMeterRead, _CO2OffsetServiceDown);
        /// @dev need to check if new meter read is higher then the old one
        db.setLastSmartMeterReadFileHash(_assetId, _lastSmartMeterReadFileHash);
        db.setLastSmartMeterReadWh(_assetId, _newMeterRead);
        db.setLastCO2OffsetReading(_assetId,_CO2OffsetMeterRead);
    }

    /// @notice Sets active to false
    /// @param _assetId The id belonging to an entry in the asset registry
    function setActive(uint _assetId, bool _active)
        external
        isInitialized
        onlyRole(RoleManagement.Role.AssetAdmin)
    {
        db.setActive(_assetId, _active);
    }

    /// @notice Updates the logic contract
    /// @param _newLogic Address of the new logic contract
    function update(address _newLogic) 
        external
        onlyAccount(address(cooContract))
    {
        db.changeOwner(_newLogic);
    }

    /// @notice Changes the address of a smart meter belonging to an asset
    /// @param _assetId The id belonging to an entry in the asset registry
    /// @param _newSmartMeter The address of the new smart meter
    function updateSmartMeter(uint _assetId, address _newSmartMeter)
        external
        isInitialized
        onlyRole(RoleManagement.Role.AssetAdmin)
    {
        db.setSmartMeter(_assetId, _newSmartMeter);
    }

    /// @notice increases the amount of wh used for the creation of certificates
    /// @param _assetId The id belonging to an entry in the asset registry
    /// @param _whUsed The amount of wh that is about to be used for a new certificate
    function useWhForCertificate(uint _assetId, uint _whUsed) 
        external
        isInitialized 
        onlyAccount(address(cooContract.certificateRegistry()))
        returns(bool)
    {
        uint temp = db.getCertificatesCreatedForWh(_assetId) + _whUsed;
        require(db.getLastSmartMeterReadWh(_assetId) >= temp);
        db.setCertificatesCreatedForWh(_assetId, temp);
        temp = db.getCo2UsedForCertificate(_assetId);
        db.setCO2UsedForCertificate(_assetId, temp);
        return true;
    }

    /// @notice Gets the last filehash of the smart reader
    function getAssetDataLog(uint _assetId)
        external
        constant
        returns (bytes32 datalog)
    {
        return db.getLastSmartMeterReadFileHash(_assetId);
    }

    /// @notice Gets an asset
    /// @param _assetId The id belonging to an entry in the asset registry
    /// @param _smartMeter The address of the smart meter
    /// @param _owner The address of the asset owner
    /// @param _assetType The type of fuel used to generate power
    /// @param _operationalSince The timestamp since the asset is operational
    /// @param _capacityWh The capacity in Wh of the asset
    /// @param _lastSmartMeterReadWh The smart meter read in Wh
    /// @param _certificatesCreatedForWh The amount of Wh used to issue certificates
    /// @param _active true if active
    /// @param _lastSmartMeterReadFileHash last meter read file hash
    /// @return true if asset is active
    function getAssetGeneral(uint _assetId) 
        external
        constant
        returns(
            address _smartMeter,
            address _owner,
            uint _assetType,
            uint _operationalSince,
            uint _capacityWh,
            uint _lastSmartMeterReadWh,
            uint _certificatesCreatedForWh,
            bool _active,
            bytes32 _lastSmartMeterReadFileHash,
            uint _lastCO2OffsetReading,
            uint _cO2UsedForCertificate
            )
    {
        return db.getAssetGeneral(_assetId);
    }

    /// @notice Function to get the amount of all assets
    /// @dev needed to iterate though all the asset
    /// @return the amount of all assets
    function getAssetListLength()
        external
        view 
        returns (uint)
    {
        return db.getAssetListLength();
    }

    /// @notice Funtion to get the informaiton of the location of an asset
    /// @param _assetId The identifier / index of the asset
    /// @return country, region, zip-code, city, street, houseNumber, gpsLatitude, gpsLongitude
    function getAssetLocation(uint _assetId)
        external
        view
        returns(
            bytes32 country,
            bytes32 region,
            bytes32 zip,
            bytes32 city,
            bytes32 street,
            bytes32 houseNumber,
            bytes32 gpsLatitude,
            bytes32 gpsLongitude
        )
    {
        return db.getAssetLocation(_assetId);
    }

    /// @notice Function to get the Asset-Type
    /// @dev The asset-type gets converted from unsigned integer to an Asset-type enum, can still be accessed as uint
    /// @param _assetId The identifier / index of an asset
    /// @return AssetType as enum 
    function getAssetType(uint _assetId)
        external
        constant
        returns(
            AssetType 
        )
    {
        return AssetType(db.getAssetType(_assetId));
    }

    /// @notice Function to get the amount of already used CO2 for creating certificates
    /// @param _assetId The identifier / index of an asset
    /// @return the amount of already used CO2 for creating certificates
    function getCo2UsedForCertificate(uint _assetId) 
        external 
        view 
        returns (uint) 
    {
        return db.getCo2UsedForCertificate(_assetId);
    }

    /// @notice function to calculated how much CO2-offset can be used for a certificate
    /// @param _assetId The identifier / index of an asset
    /// @param _wh The amount of wh produced
    /// @return amount of CO2-offset used for a certificate
    function getCoSaved(uint _assetId, uint _wh) external view returns(uint) {
        uint lastRead = db.getLastSmartMeterReadWh(_assetId);
        uint lastUsedWh = db.getCertificatesCreatedForWh(_assetId);
        uint availableWh = lastRead - lastUsedWh;
        uint coRead = db.getlastSmartMeterCO2OffsetRead(_assetId);
        uint coUsed = db.getCo2UsedForCertificate(_assetId);
        uint availableCo = coRead - coUsed;

        return (availableCo*((_wh*1000)/availableWh))/1000;
    }
    
    
}