// Copyright 2018 Energy Web Foundation
//
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

pragma solidity ^0.4.18;

import "./Owned.sol";

/// @title The Database contract for the Asset Registration
/// @notice This contract only provides getter and setter methods
contract AssetRegistryDB is Owned {

    /// @notice An array containing all registerd assets
    Asset[] private assets;

    enum FuelType {
        Water,
        Solar,
        Wind
    }

    struct Asset {
        address smartMeter;
        address owner;
        FuelType fuelType;
        uint operationalSince;
        //TODO add geo location
        uint capacityWh;
        uint lastSmartMeterReadWh;
        uint certificatesCreatedForWh;
        bool active;
        bytes32 lastSmartMeterReadFileHash;

    }

    /// @notice Constructor
    /// @param _owner The owner of the contract
    function AssetRegistryDB(address _owner) 
        public
        Owned(_owner) 
    {

    } 

    /// @notice Sets the smart meter address belonging to an entry in the asset registry
    /// @param _assetId The id belonging to an entry in the asset registry
    /// @param _smartMeter The new smart meter address
    function setSmartMeter(uint _assetId, address _smartMeter) 
        onlyOwner
        public
    {
        assets[_assetId].smartMeter = _smartMeter;

    }

    /// @notice Sets the owner of an entry in the asset registry
    /// @param _assetId The id belonging to an entry in the asset registry
    /// @param _owner The new owner
    function setOwner(uint _assetId, address _owner) 
        onlyOwner
        public
    {
        assets[_assetId].owner = _owner;

    }

    /// @notice Sets the fuel type belonging to an entry in the asset registry
    /// @param _assetId The id belonging to an entry in the asset registry
    /// @param _fuelType The new fuel type
    function setFuelType(uint _assetId, FuelType _fuelType) 
        onlyOwner
        public
    {
        assets[_assetId].fuelType = _fuelType;

    }

    /// @notice Sets the operational since field of an entry in the asset registry
    /// @param _assetId The id belonging to an entry in the asset registry
    /// @param _operationalSince The timestamp since the asset is operational
    function setOperationalSince(uint _assetId, uint _operationalSince) 
        onlyOwner
        public
    {
        assets[_assetId].operationalSince = _operationalSince;

    }

    /// @notice Sets last meter read file hash
    /// @param _assetId The id belonging to an entry in the asset registry
    /// @param _lastSmartMeterReadFileHash Last meter read file hash
    function setLastSmartMeterReadFileHash(uint _assetId, bytes32 _lastSmartMeterReadFileHash)
        onlyOwner
        public
    {
        assets[_assetId].lastSmartMeterReadFileHash = _lastSmartMeterReadFileHash;

    }

    /// @notice Sets the last smart merter read in Wh of an entry in the asset registry
    /// @param _assetId The id belonging to an entry in the asset registry
    /// @param _lastSmartMeterReadWh The smart meter read in Wh
    function setLastSmartMeterReadWh(uint _assetId, uint _lastSmartMeterReadWh) 
        onlyOwner
        public
    {
        assets[_assetId].lastSmartMeterReadWh = _lastSmartMeterReadWh;

    }

    /// @notice Sets the capacity in Wh of an entry in the asset registry
    /// @param _assetId The id belonging to an entry in the asset registry
    /// @param _capacityWh The capacity in Wh
    function setCapacityWh(uint _assetId, uint _capacityWh) 
        onlyOwner
        public
    {
        assets[_assetId].capacityWh = _capacityWh;

    }

    /// @notice Sets amount of Wh used to issue certificates belonging to an entry in the asset registry
    /// @param _assetId The id belonging to an entry in the asset registry
    /// @param _certificatesCreatedForWh The amount of Wh used to issue certificates
    function setCertificatesCreatedForWh(uint _assetId, uint _certificatesCreatedForWh) 
        onlyOwner
        public
    {
        assets[_assetId].certificatesCreatedForWh = _certificatesCreatedForWh;

    }

    /// @notice Sets if an entry in the asset registry is active
    /// @param _assetId The id belonging to an entry in the asset registry
    /// @param _active true if active
    function setActive(uint _assetId, bool _active) 
        onlyOwner
        public
    {
        assets[_assetId].active = _active;

    }

    /// @notice Creates an entry in the asset registry
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
    function createAsset(        
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
        onlyOwner
        public 
        returns(uint _assetId)
    {

        return assets.push(AssetRegistryDB.Asset({
            smartMeter: _smartMeter,
            owner: _owner,
            fuelType: _fuelType,
            operationalSince: _operationalSince,
            capacityWh: _capacityWh,
            lastSmartMeterReadWh: _lastSmartMeterReadWh,
            certificatesCreatedForWh: _certificatesCreatedForWh,
            active: _active,
            lastSmartMeterReadFileHash: _lastSmartMeterReadFileHash

        })) - 1;
        
    }

    /// @notice Gets the smart meter address belonging to an entry in the asset registry
    /// @param _assetId The id belonging to an entry in the asset registry
    /// @return the smart meter address
    function getSmartMeter(uint _assetId)
        onlyOwner
        public
        constant
        returns(address)
    {
        return assets[_assetId].smartMeter;

    }

    /// @notice Gets the owner of an entry in the asset registry
    /// @param _assetId The id belonging to an entry in the asset registry
    /// @return the owner address
    function getOwner(uint _assetId) 
        onlyOwner
        public
        constant
        returns(address)
    {
        return assets[_assetId].owner;

    }

    /// @notice Gets the fuel type belonging to an entry in the asset registry
    /// @param _assetId The id belonging to an entry in the asset registry
    /// @return the type of fuel
    function getFuelType(uint _assetId)
        onlyOwner
        public
        constant
        returns(FuelType)
    {
        return assets[_assetId].fuelType;

    }

    /// @notice Gets the operational since field of an entry in the asset registry
    /// @param _assetId The id belonging to an entry in the asset registry
    function getOperationalSince(uint _assetId)
        onlyOwner
        public
        constant
        returns(uint)
    {
        return assets[_assetId].operationalSince;

    }

    /// @notice Gets the last smart merter read in Wh of an entry in the asset registry
    /// @param _assetId The id belonging to an entry in the asset registry
    /// @return the last loged smart meter read in Wh
    function getLastSmartMeterReadWh(uint _assetId)
        onlyOwner
        public
        constant
        returns(uint)
    {
        return assets[_assetId].lastSmartMeterReadWh;

    }

    /// @notice Gets the capacity in Wh of an entry in the asset registry
    /// @param _assetId The id belonging to an entry in the asset registry
    /// @return the capacity in Wh
    function getCapacityWh(uint _assetId)
        onlyOwner
        public
        constant
        returns(uint)
    {
        return assets[_assetId].capacityWh;

    }

    /// @notice Gets amount of Wh used to issue certificates belonging to an entry in the asset registry
    /// @param _assetId The id belonging to an entry in the asset registry
    /// @return the amount of Wh used to issue certificates
    function getCertificatesCreatedForWh(uint _assetId)
        onlyOwner
        public
        constant
        returns(uint)
    {
        return assets[_assetId].certificatesCreatedForWh;

    }

    /// @notice Gets last smart merter read file hash
    /// @param _assetId The id belonging to an entry in the asset registry
    /// @return last smart merter read file hash
    function getLastSmartMeterReadFileHash(uint _assetId)
        onlyOwner
        public
        constant
        returns(bytes32)
    {
        return assets[_assetId].lastSmartMeterReadFileHash;

    }

    /// @notice Gets if an entry in the asset registry is active
    /// @param _assetId The id belonging to an entry in the asset registry
    /// @return true if asset is active
    function getActive(uint _assetId) 
        onlyOwner
        public
        constant
        returns(bool)
    {
        return assets[_assetId].active;

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
    /// @return true if asset is active
    function getAsset(uint _assetId) 
        onlyOwner
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
            bytes32 lastSmartMeterReadFileHash)
    {
        Asset storage asset = assets[_assetId];
        return (
            asset.smartMeter,
            asset.owner,
            asset.fuelType,
            asset.operationalSince,
            asset.capacityWh,
            asset.lastSmartMeterReadWh,
            asset.certificatesCreatedForWh,
            asset.active,
            asset.lastSmartMeterReadFileHash
        );
        
    }

    
}