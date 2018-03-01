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
// @authors: slock.it GmbH, Martin Kuechler, martin.kuechler@slock.it

pragma solidity ^0.4.18;

import "./AssetConsumingRegistryDB.sol";
import "./UserLogic.sol";
import "./CoO.sol";
import "./RoleManagement.sol";
import "./CertificateLogic.sol";
import "./Updatable.sol";
import "./AssetLogic.sol";

/// @title The logic contract for the asset registration
/// @notice This contract provides the logic that determines how the data is stored
/// @dev Needs a valid AssetProducingRegistryDB contract to function correctly
contract AssetConsumingRegistryLogic is AssetLogic {

    ///@notice The AssetProducingRegistryDB contract

    event LogNewMeterRead(uint indexed _assetId, uint _oldMeterRead, uint _newMeterRead, uint _certificatesUsedForWh);

    /// @notice Constructor
    /// @param _cooContract The address of the coo contract
    function AssetConsumingRegistryLogic(CoO _cooContract) 
        public
        RoleManagement(_cooContract) 
    {
  
    }

    /// @notice Sets the general information of an asset in the database
    /// @param _index the The index / identifier of an asset
    /// @param _smartMeter The address of the smart meter
    /// @param _owner The address of the asset owner
    /// @param _operationalSince The timestamp since the asset is operational
    /// @param _capacityWh The capacity in Wh of the asset
    /// @param _active true if active
    function initGeneral (
        uint _index,
        address _smartMeter,
        address _owner,
        uint _operationalSince,
        uint _capacityWh,
        bool maxCapacitySet,
        bool _active
    ) 
        external
        isInitialized
        userHasRole(RoleManagement.Role.AssetManager, _owner)
        onlyRole(RoleManagement.Role.AssetAdmin)
    {  
       AssetConsumingRegistryDB(db).initGeneral(_index, _smartMeter, _owner, _operationalSince, _capacityWh,maxCapacitySet, 0, 0, _active, 0x0);
        checkForFullAsset(_index);
    }
    
    /// @notice Logs meter read
    /// @param _assetId The id belonging to an entry in the asset registry
    /// @param _newMeterRead The current meter read of the asset
    /// @param _lastSmartMeterReadFileHash Last meter read file hash
    /// @dev The client needs to check if the blockgas limit could be reached and if so the log should be splitted 
    function saveSmartMeterRead(uint _assetId, uint _newMeterRead, bytes32 _lastSmartMeterReadFileHash) 
        external
        isInitialized
        onlyAccount(AssetConsumingRegistryDB(address(db)).getSmartMeter(_assetId))
    {
        require(db.getActive(_assetId));
        LogNewMeterRead(_assetId, AssetConsumingRegistryDB(address(db)).getLastSmartMeterReadWh(_assetId), _newMeterRead, AssetConsumingRegistryDB(address(db)).getCertificatesUsedForWh(_assetId));
        /// @dev need to check if new meter read is higher then the old one
        db.setLastSmartMeterReadFileHash(_assetId, _lastSmartMeterReadFileHash);
        AssetConsumingRegistryDB(address(db)).setLastSmartMeterReadWh(_assetId, _newMeterRead);
    }

    /// @notice Gets an asset
    /// @param _assetId The id belonging to an entry in the asset registry
    /// @param _smartMeter The address of the smart meter
    /// @param _owner The address of the asset owner
    /// @param _operationalSince The timestamp since the asset is operational
    /// @param _capacityWh The capacity in Wh of the asset
    /// @param _lastSmartMeterReadWh The smart meter read in Wh
    /// @param _certificatesUsedForWh The amount of Wh used to issue certificates
    /// @param _active true if active
    /// @param _lastSmartMeterReadFileHash last meter read file hash
    /// @return true if asset is active
    function getAssetGeneral(uint _assetId) 
        external
        constant
        returns (
            address _smartMeter,
            address _owner,
            uint _operationalSince,
            uint _capacityWh,
            bool _maxCapacitySet,
            uint _lastSmartMeterReadWh,
            uint _certificatesUsedForWh,
            bool _active,
            bytes32 _lastSmartMeterReadFileHash
            )
    {
        return AssetConsumingRegistryDB(address(db)).getAssetGeneral(_assetId);
    }

   
}