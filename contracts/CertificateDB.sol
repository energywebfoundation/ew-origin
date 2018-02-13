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

/// @title The Database contract for the Certificate of Origin list
/// @notice This contract only provides getter and setter methods

import "./Owned.sol";

contract CertificateDB is Owned {

    /// @notice The structure of a certificate
    /// @param assetId The id of the certificate
    /// @param owner The owner of a certificate
    /// @oaram powerInW The amount of Watts the Certificate holds. Should never be changed after creation
    /// @param retired Shows if the certificate is retired
    struct Certificate {
        uint assetId;
        address owner;
        uint powerInW;
        bool retired;
        /// @dev could make a invariant that retired is only allowed to be true if request is true as well
        bool retiredRequested;
        bytes32 dataLog;
    }

    /// @notice An array containing all created certificates
    Certificate[] private certificateList;
    
    /// @notice Constructor
    /// @param _certificateLogic The address of the corresbonding logic contract
    function CertificateDB(address _certificateLogic) Owned(_certificateLogic) public {
    }

    /// @notice Creates a new certificate
    /// @param _assetId The id of the Certificate
    /// @param _owner The owner of the Certificate
    /// @param _powerInW The amount of Watts the Certificate holds
    /// @return The id of the certificate
    function createCertificate(uint _assetId, address _owner, uint _powerInW, bytes32 _dataLog) public onlyOwner returns (uint) {
        return certificateList.push(Certificate(_assetId, _owner, _powerInW, false, false, _dataLog)) - 1;
        
    }

    /// @notice Sets the owner of a certificate
    /// @param _certificateId The array position in which the certificate is stored
    /// @param _owner The address of the new owner
    function setCertificateOwner(uint _certificateId, address _owner) public onlyOwner {
        certificateList[_certificateId].owner = _owner;
    }

    /// @notice Sets flag to be retired
    /// @param _certificateId The array position in which the certificate is stored
    /// @param _set request or cancel request
    function setRetireRequest(uint _certificateId, bool _set) public onlyOwner {
        certificateList[_certificateId].retiredRequested = _set;
    }

    /// @notice Returns true if it can be retired by admin
    /// @param _certificateId The array position in which the certificate is stored
    /// @return bool true if retirement was requested
    function isRetired(uint _certificateId) public view onlyOwner returns (bool) {
        return certificateList[_certificateId].retiredRequested;
    }

    /// @notice Sets a certificate to retired
    /// @param _certificateId The array position in which the certificate is stored
    function retireCertificate(uint _certificateId) public onlyOwner {
        certificateList[_certificateId].retired = true;
    }

    /// @notice Returns the certificate that corresponds to the given array id
    /// @param _certificateId The array position in which the certificate is stored
    /// @return all elements of the certificate
    function getCertificate(uint _certificateId) public onlyOwner view returns (uint, address, uint, bool, bool, bytes32) {
        return (certificateList[_certificateId].assetId, certificateList[_certificateId].owner, certificateList[_certificateId].powerInW, certificateList[_certificateId].retired, certificateList[_certificateId].retiredRequested, certificateList[_certificateId].dataLog);
    }

    function getCertificateListLength() public onlyOwner view returns (uint) {
        return certificateList.length;
    }

}