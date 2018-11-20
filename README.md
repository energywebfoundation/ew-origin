# Energy Web Foundation: Certificate of Origin (EWF CoO)

## Warning

This repository is not designed for productive usage. Instead it should be used for demonstration and learning purposes.

## Getting Started

#### Contracts Overview

[Open in Piet](https://piet.slock.it/?gitHubRepo=energywebfoundation%2Few-origin&subDir=contracts&contract=CertificateLogic&contractAddress=0xefE4F05B363d216354749a1E0BE423b2e50291bD&rpc=https%3A%2F%2Frpc.slock.it%2Ftobalaba)


#### Install
Install the **Certificate of Origin**: `npm install`.

#### Clients 
The **Certificate of Origin** app can be deployed on any ethereum-network
- For testing purposes, we recommend deploying it on a local **ganache-rpc**
    - The app is pre-configured to start ganache with: `npm run start-ganache`

#### Migration

Deploy contracts to preferred network (default ganache-cli): `npm run migrate` 

## Specifics

#### Pre-configured Accounts

Mnemonic : `outer moment twin salmon shuffle amused twice evil rapid hotel burst stand`

| # | Public Key | User | 
| :--: | -- | -- |
| 0 | `0x3b07f15efb10f29b3fc222fb7e717e9af0cc4243` | `TopAdmin` , `CoO.sol` / **Owner**, `Trader` |
| 1 | `0x71c31ff1faa17b1cb5189fd845e0cca650d215d3` | `UserAdmin`, `Trader`, `AssetManager`  |
| 2 | `0xcea1c413a570654fa85e78f7c17b755563fec5a5` | `AssetAdmin` |
| 3 | `0x583b3e16a27f3db4bdc4c1a5452eeed14619c8da` |  |
| 4 | `0x33496f621350cea01b18ea5b5c43c6c233c3f72d` |  |
| 5 | `0x51ba6877a2c4580d50f7ceece02e2f24e78ef123` |  |
| 6 | `0xfeebf1e463e39d09d5f8a40a6ed08d604ab01360` |  |
| 7 | `0x585cc5c7829b1fd303ef5c019ed23815a205a59e` |  |
| 8 | `0x343854a430653571b4de6bf2b8c475f828036c30` | `Matcher` |
| 9 | `0x84a2c086ffa013d06285cdd303556ec9be5a1ff7` | `Trader` |
| 10 | `0x00f4af465162c05843ea38d203d37f7aad2e2c17` | `AgreementAdmin` |


#### Roles
| User | Roles |
| :-- | :-- |
| `CoO.sol` / **Owner** | All Roles (default) |
| `TopAdmin` | Allowed to onboard new users and their roles, assets, demands, admins |
| `UserAdmin` | Allowed to onboard new users |
| `AssetAdmin` | Allowed to onboard new assets |
| `AgreementAdmin` |  Allowed to onboard new agreements |
| `Trader` | Allowed to trade and buy certificates
| `AssetManager` | Allowed to be the owner of an assets |
| `Matcher` | Allowed to match energy with demands |


## Contract Functionality


### New Users and Role Changes

###### Contract : `UserDB.sol`
- A `TopAdmin` or `UserAdmin` can onboard new users with: `setUser()`
- After, the roles of the users have to be added by either calling:
    - `setRoles()`
    - `addRoles()`

### Producing Assets
Electricity Producing Implement

Example: Power Plant

#### Creating / Onboarding
(_The procedure for onboarding a producing asset is nearly the same as the consuming ones._)
###### Contract : `producingAssetRegistry.sol`

1. `createAsset()` (Roles: `TopAdmin` or `AssetAdmin`) 
    - returns your new `assetId` in event
2. `initProducingProperties(uint _assetId,`...`)`
3. `initGeneral(uint _assetId,`...`)`. 

(You should recieve a `LogAssetFullyInitialized` event including your `assetId`)

#### Logging Energy Consumption

`saveSmartMeterRead()` to log consumed energy

### Consuming Assets

Electricity Consuming Implement
Example: Factory


#### Creating / Onboarding an Asset

###### Contract : `consumingAssetRegistry.sol`
1. `createAsset()` (Roles: `TopAdmin` or `AssetAdmin`)
    - returns a new `assetId` in an event

_After receiving the `assetId` you're able to call the functions:_

2. `initGeneral(uint _assetId,`...`)`
3. `initLocation (uint _assetId,` ...`)`

(You should receive a `LogAssetFullyInitialized` event including your `assetId`)

#### Logging Energy Consumption

`saveSmartMeterRead()` to log consumed energy

### Demands

Electricity Demand

#### Creating a Demand

###### Contract : `DemandLogic.sol`

1. `createDemand()`: As `TopAdmin` or `AgreementAdmin`
    - Requires an array with 10 elements for the different properties that are enabled or disabled (see smart contracts).
2. `initGeneralAndCoupling()`
3. `initMatchProperties()`
4. `initPriceDriving()`

 The smart contract will require the following:
- The demand can't have both and originator and a specific producing asset
- If the producing asset is enabled, it must exist
- If the consuming asset is enabled, it must exists 
- The Matcher's address must have the Matcher's role


#### Matching a Demand
###### Contract : `DemandLogic.sol`


Ways to match:
- `matchCertificate()`: Match an Existing Certificate to a `demand`
- `matchDemand()`: Match Produced Energy to a `demand`

Internally both functions are calling the same functions for checking the compatibility of the `demand` and the energy `certificate`.

These functions can also be called before a transaction, to check if an error would result:
- `checkDemandCoupling()`
- `checkDemandGeneral()`
- `checkMatcher()`
- `checkPriceDriving()`


Only these certificates can be matched with demands:

| Condition | Result |
| :-- | :-- |
| The matching of produced energy with a demand was successfull | A new certificate is created with the buyer as new owner
| The demand is successfully matched with a certificate | The owner gets transfered |
| The produced energy does not match any demand | A new certificate will be created with the `assetOwner` as certificate-owner and an `escrow` address |




# Blockchain Facade  (JavaScript-Interface)

## _Getting Started_

