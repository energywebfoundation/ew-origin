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

pragma solidity ^0.4.17;

/// @title The logic contract for the Certificate of Origin list
/// @notice This contract provides the logic that determines how the data is stored
/// @dev Needs a valid CertificateDB contract to function correctly

import "./Owned.sol";
import "./RoleManagement.sol";
import "./UserDB.sol";
import "./CoO.sol";
import "./CertificateDB.sol";
import "./Updatable.sol";
import "./AssetRegistryLogic.sol";

contract CertificateLogic is RoleManagement, Updatable {

    ///@notice The address of a CertificateDB contract
    CertificateDB public certificateDb;

    /// @notice Logs the creation of an event
    event LogCreatedCertificate(uint _certificateId, uint powerInW);
    /// @notice Logs the request of an retirement of a certificate
    event LogRetireRequest(uint _id, bool _retire);

    /// @notice Constructor
    /// @param _coo The Master contract
    function CertificateLogic(CoO _coo) RoleManagement(_coo) public {

    }

    /// @notice Initialises the contract by binding it to a logic contract
    /// @param _database Sets the logic contract
    function init(address _database) public onlyRole(RoleManagement.Role.TopAdmin) {
        require(certificateDb == CertificateDB(0x0));
        certificateDb = CertificateDB(_database);
    }

    /// @notice Creates a certificate of origin. Checks in the AssetRegistry if requested wh are available.
    /// @param _assetId The id of the Certificate
    /// @param _owner The owner of the Certificate
    /// @param _powerInW The amount of Watts the Certificate holds
    function createCertificate(uint _assetId, address _owner, uint _powerInW) public isMatcherOrDemand isInitialized  returns (uint) {
        require(AssetRegistryLogic(address(cooContract.assetRegistry())).useWhForCertificate(_assetId, _powerInW));
        uint co = AssetRegistryLogic(address(cooContract.assetRegistry())).getCoSaved(_assetId, _powerInW);
        bytes32 dataLog = AssetRegistryLogic(address(cooContract.assetRegistry())).getAssetDataLog(_assetId);
        uint ret = certificateDb.createCertificate(_assetId, _owner, _powerInW, dataLog, co);
        LogCreatedCertificate(ret, _powerInW);
        return ret;
    }

    /// @notice Flags a certificate as retired
    /// @param _id The id of the certificate
    function retireCertificate(uint _id) public isInitialized() onlyRole(RoleManagement.Role.AssetAdmin) {
        //TODO: Check if it is on the trading platform
        if (certificateDb.isRetired(_id))
            certificateDb.retireCertificate(_id);
    }

    /// @notice Request a certificate to retire. Only Certificate owner can request retirement
    /// @param _id The id of the certificate
    function retireCertificateRequest(uint _id) public isInitialized() {
        CertificateDB.Certificate memory c;
        (c.assetId, c.owner, c.powerInW, c.retired, c.retiredRequested, c.dataLog, c.coSaved) = certificateDb.getCertificate(_id);
        require(c.owner == msg.sender);
        certificateDb.setRetireRequest(_id, true);
        LogRetireRequest(_id, true);
    }

    /// @notice Sets a new owner for the certificate
    /// @param _id The id of the certificate
    /// @param _newOwner The address of the new owner of the certificate
    function changeCertificateOwner(uint _id, address _newOwner) public isInitialized() onlyRole(RoleManagement.Role.AssetAdmin) userExists(_newOwner) {
        certificateDb.setCertificateOwner(_id, _newOwner);
    }

    /// @notice Getter for a specific Certificate
    /// @param _certificateId The id of the requested certificate
    /// @return the certificate as single values
    function getCertificate(uint _certificateId) public view returns (uint, address, uint, bool, bool, bytes32, uint) {
        return certificateDb.getCertificate(_certificateId);
    }

    /// @notice Getter for a specific Certificate
    /// @param _certificateId The id of the requested certificate
    /// @return the certificate as single values
    function getCertificateOwner(uint _certificateId) public view returns (address) {
        return certificateDb.getCertificateOwner(_certificateId);
    }

    /// @notice Getter for the length of the list of certificates
    /// @return the length of the array
    function getCertificateListLength() public view returns (uint) {
        return certificateDb.getCertificateListLength();
    }

    /// @notice Checks if the contract is initialized
    modifier isInitialized() {
        require(certificateDb != CertificateDB(0x0));
        _;
    }

    /// @notice Checks if the sender is allowed to create certificates
    modifier isMatcherOrDemand() {
        require(msg.sender == address(cooContract.demandRegistry()) || isRole(RoleManagement.Role.Matcher, msg.sender));
        _;
    }

    /// @notice Updates the logic contract
    /// @param _newLogic Address of the new logic contract
    function update(address _newLogic) 
        external
        onlyAccount(address(cooContract))
    {
        certificateDb.changeOwner(_newLogic);
    }
}