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


contract AssetGeneralDefinition is Owned {

   struct GeneralInformation {
        address smartMeter;
        address owner;
        uint operationalSince;
        uint lastSmartMeterReadWh;
        bool active;
        bytes32 lastSmartMeterReadFileHash;
        bool exists;
    }

     /// @notice function to set all the location Informations for an asset
    /// @param _country The country where the asset is located
    /// @param _region The region / state where the asset is located
    /// @param _zip The zip-code of the region where the asset is located
    /// @param _city The city where the asset is located
    /// @param _street The streetname where the asset is located
    /// @param _houseNumber the housenumber where the asset is located
    /// @param _gpsLatitude The gps-latitude
    /// @param _gpsLongitude The gps-longitude
    function initLocationInternal(
        LocationDefinition.Location storage loc,
        bytes32 _country,
        bytes32 _region,
        bytes32 _zip,
        bytes32 _city,
        bytes32 _street,
        bytes32 _houseNumber,
        bytes32 _gpsLatitude,
        bytes32 _gpsLongitude
    )
        internal
    {
        loc.country = _country;
        loc.region = _region;
        loc.zip = _zip;
        loc.city = _city;
        loc.street = _street;
        loc.houseNumber = _houseNumber;
        loc.gpsLatitude = _gpsLatitude;
        loc.gpsLongitude = _gpsLongitude;
        loc.exists = true;
    }

    function setGeneralInformationInternal(
        GeneralInformation storage gi,
        address _smartMeter,
        address _owner,
        uint _operationalSince,
        uint _lastSmartMeterReadWh,
        bool _active,
        bytes32 _lastSmartMeterReadFileHash
    )
    internal 
    {
        gi.smartMeter = _smartMeter;
        gi.owner = _owner;
        gi.operationalSince = _operationalSince;
        gi.lastSmartMeterReadWh = _lastSmartMeterReadWh;
        gi.active = _active;
        gi.lastSmartMeterReadFileHash = _lastSmartMeterReadFileHash;
        gi.exists = true;
    }

    /// @notice function to get the informations about the location of a struct
    /// @return country, region, zip, city, street, houseNumber, gpsLatitude, gpsLongitude
    function getAssetLocationInternal(LocationDefinition.Location storage loc)
        internal
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
        country = loc.country;
        region = loc.region;
        zip = loc.zip;
        city = loc.city;
        street = loc.street;
        houseNumber = loc.houseNumber;
        gpsLatitude = loc.gpsLatitude;
        gpsLongitude = loc.gpsLongitude;

        return (country, region, zip, city, street, houseNumber, gpsLatitude, gpsLongitude);
    }

}