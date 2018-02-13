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
  
    modifier isInitialized {
        require(address(db) != 0x0);
        _;
    }

    event LogNewMeterRead(uint indexed _assetId, uint _oldMeterRead, uint _newMeterRead, uint _certificatesCreatedForWh);
    
    /// @notice Constructor
    /// @param _cooContract The address of the coo contract
    function AssetRegistryLogic(CoO _cooContract) 
        public
        RoleManagement(_cooContract) 
    {
  
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

    /// @notice Creates an entry in the asset registration
    /// @param _smartMeter The address of the smart meter
    /// @param _owner The address of the asset owner
    /// @param _fuelType The type of fuel used to generate power
    /// @param _operationalSince The timestamp since the asset is operational
    /// @param _capacityWh The capacity in Wh of the asset
    /// @param _lastSmartMeterReadWh The smart meter read in Wh
    /// @param _certificatesCreatedForWh The amount of Wh used to issue certificates
    /// @param _active true if active
    /// @param _lastSmartMeterReadFileHash last meter read file hash
    /// @return the id of the new entry
    function registerAsset(
        address _smartMeter,
        address _owner,
        AssetRegistryDB.FuelType _fuelType,
        uint _operationalSince,
        uint _capacityWh,
        uint _lastSmartMeterReadWh,
        uint _certificatesCreatedForWh,
        bool _active,
        bytes32 _lastSmartMeterReadFileHash
    ) 
        external
        isInitialized
        onlyRole(RoleManagement.Role.AssetAdmin)
        userHasRole(RoleManagement.Role.AssetManager, _owner)
        returns(uint _assetId)
    {
        return db.createAsset(_smartMeter, _owner, _fuelType, _operationalSince, _capacityWh, _lastSmartMeterReadWh, _certificatesCreatedForWh, _active, _lastSmartMeterReadFileHash);
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

    /// @notice Sets active to false
    /// @param _assetId The id belonging to an entry in the asset registry
    function setActive(uint _assetId, bool _active)
        external
        isInitialized
        onlyRole(RoleManagement.Role.AssetAdmin)
    {
        db.setActive(_assetId, _active);
    }

    /// @notice Logs meter read
    /// @param _assetId The id belonging to an entry in the asset registry
    /// @param _newMeterRead The current meter read of the asset
    /// @param _lastSmartMeterReadFileHash Last meter read file hash
    /// @dev The client needs to check if the blockgas limit could be reached and if so the log should be splitted 
    function saveSmartMeterRead(uint _assetId, uint _newMeterRead, bytes32 _lastSmartMeterReadFileHash) 
        external
        isInitialized
        onlyAccount(db.getSmartMeter(_assetId))
    {
        require(db.getActive(_assetId));
        LogNewMeterRead(_assetId, db.getLastSmartMeterReadWh(_assetId), _newMeterRead, db.getCertificatesCreatedForWh(_assetId));
        /// @dev need to check if new meter read is higher then the old one
        db.setLastSmartMeterReadFileHash(_assetId, _lastSmartMeterReadFileHash);
        db.setLastSmartMeterReadWh(_assetId, _newMeterRead);
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
        return true;
    }

    /// @notice Updates the logic contract
    /// @param _newLogic Address of the new logic contract
    function update(address _newLogic) 
        external
        onlyAccount(address(cooContract))
    {
        db.changeOwner(_newLogic);

    }

    /// @notice Gets an asset
    /// @param _assetId The id belonging to an entry in the asset registry
    /// @param _smartMeter The address of the smart meter
    /// @param _owner The address of the asset owner
    /// @param _fuelType The type of fuel used to generate power
    /// @param _operationalSince The timestamp since the asset is operational
    /// @param _capacityWh The capacity in Wh of the asset
    /// @param _lastSmartMeterReadWh The smart meter read in Wh
    /// @param _certificatesCreatedForWh The amount of Wh used to issue certificates
    /// @param _active true if active
    /// @param _lastSmartMeterReadFileHash last meter read file hash
    /// @return true if asset is active
    function getAsset(uint _assetId) 
        public
        constant
        returns(
            address _smartMeter,
            address _owner,
            AssetRegistryDB.FuelType _fuelType,
            uint _operationalSince,
            uint _capacityWh,
            uint _lastSmartMeterReadWh,
            uint _certificatesCreatedForWh,
            bool _active,
            bytes32 _lastSmartMeterReadFileHash)
    {
        return db.getAsset(_assetId);
        
    }
    
}