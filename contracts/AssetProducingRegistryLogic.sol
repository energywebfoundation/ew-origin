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

import "./AssetProducingRegistryDB.sol";
import "./UserLogic.sol";
import "./CoO.sol";
import "./RoleManagement.sol";
import "./CertificateLogic.sol";
import "./Updatable.sol";
import "./AssetLogic.sol";


/// @title The logic contract for the asset registration
/// @notice This contract provides the logic that determines how the data is stored
/// @dev Needs a valid AssetProducingRegistryDB contract to function correctly
contract AssetProducingRegistryLogic is AssetLogic {

    ///@notice The AssetProducingRegistryDB contract
  //  AssetProducingRegistryDB public db;

    event LogNewMeterRead(uint indexed _assetId, uint _oldMeterRead, uint _newMeterRead, uint _certificatesCreatedForWh, uint _oldCO2OffsetReading, uint _newCO2OffsetReading, bool _serviceDown);
    
    enum AssetType {
        Wind,
        Solar,
        RunRiverHydro,
        BiomassGas
    }

    enum Compliance{
        none,
        IREC,
        EEC,
        TIGR
    }

    /// @notice Constructor
    /// @param _cooContract The address of the coo contract
    function AssetProducingRegistryLogic(CoO _cooContract) 
        public
        RoleManagement(_cooContract) 
    {
  
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
        Compliance _compliance,
        uint _operationalSince,
        uint _capacityWh,
        bool _active
    ) 
        external
        isInitialized
        userHasRole(RoleManagement.Role.AssetManager, _owner)
        onlyRole(RoleManagement.Role.AssetAdmin)
    {  
        AssetProducingRegistryDB(address(db)).initGeneral(_index, _smartMeter, _owner, uint(_assetType), uint(_compliance), _operationalSince, _capacityWh, 0, 0, _active, 0x0, 0, 0);
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
        onlyAccount(AssetProducingRegistryDB(address(db)).getSmartMeter(_assetId))
    {
        require(db.getActive(_assetId));
        LogNewMeterRead(_assetId, AssetProducingRegistryDB(address(db)).getLastSmartMeterReadWh(_assetId), _newMeterRead, AssetProducingRegistryDB(address(db)).getCertificatesCreatedForWh(_assetId), AssetProducingRegistryDB(address(db)).getlastSmartMeterCO2OffsetRead(_assetId), _CO2OffsetMeterRead, _CO2OffsetServiceDown);
        /// @dev need to check if new meter read is higher then the old one
        AssetProducingRegistryDB(address(db)).setLastSmartMeterReadFileHash(_assetId, _lastSmartMeterReadFileHash);
        AssetProducingRegistryDB(address(db)).setLastSmartMeterReadWh(_assetId, _newMeterRead);
        AssetProducingRegistryDB(address(db)).setLastCO2OffsetReading(_assetId,_CO2OffsetMeterRead);
    }

    function setCO2UsedForCertificate(uint _assetId, uint _co2)
        external 
        isInitialized
        onlyAccount(address(cooContract.certificateRegistry()))
    {
        uint currentCO = AssetProducingRegistryDB(address(db)).getCo2UsedForCertificate(_assetId);

        uint fullCO = AssetProducingRegistryDB(address(db)).getlastSmartMeterCO2OffsetRead(_assetId);
        uint temp = currentCO + _co2;
        require(temp <= fullCO);
        AssetProducingRegistryDB(address(db)).setCO2UsedForCertificate(_assetId, temp);
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
        uint temp = AssetProducingRegistryDB(address(db)).getCertificatesCreatedForWh(_assetId) + _whUsed;
        require(AssetProducingRegistryDB(address(db)).getLastSmartMeterReadWh(_assetId) >= temp);
       AssetProducingRegistryDB(address(db)).setCertificatesCreatedForWh(_assetId, temp);
        return true;
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
            uint _compliance,
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
        return AssetProducingRegistryDB(address(db)).getAssetGeneral(_assetId);
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
        return AssetType(AssetProducingRegistryDB(address(db)).getAssetType(_assetId));
    }

    function getCompliance(uint _assetId)
        external
        constant 
        returns (Compliance c)
    {
       var  ( , , , ctemp, , , , , , , , ) = AssetProducingRegistryDB(address(db)).getAssetGeneral(_assetId);
      
          c = Compliance(ctemp);
       
    }

    /// @notice Function to get the amount of already used CO2 for creating certificates
    /// @param _assetId The identifier / index of an asset
    /// @return the amount of already used CO2 for creating certificates
    function getCo2UsedForCertificate(uint _assetId) 
        external 
        view 
        returns (uint) 
    {
        return AssetProducingRegistryDB(address(db)).getCo2UsedForCertificate(_assetId);
    }

    /// @notice function to calculated how much CO2-offset can be used for a certificate
    /// @param _assetId The identifier / index of an asset
    /// @param _wh The amount of wh produced
    /// @return amount of CO2-offset used for a certificate
    function getCoSaved(uint _assetId, uint _wh) external view returns(uint) {
        uint lastRead = AssetProducingRegistryDB(address(db)).getLastSmartMeterReadWh(_assetId);
        uint lastUsedWh = AssetProducingRegistryDB(address(db)).getCertificatesCreatedForWh(_assetId);
        uint availableWh = lastRead - lastUsedWh;
        if(availableWh == 0) return 0;

        uint coRead = AssetProducingRegistryDB(address(db)).getlastSmartMeterCO2OffsetRead(_assetId);
        uint coUsed = AssetProducingRegistryDB(address(db)).getCo2UsedForCertificate(_assetId);
        uint availableCo = coRead - coUsed;


        return (availableCo*((_wh*1000000)/availableWh))/1000000;
    }
}