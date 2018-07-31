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

import Web3Type from '../types/web3'
import { BlockchainProperties } from './BlockchainProperties'
import { AssetType } from './Asset'
import { Compliance } from './Asset'
import { sendRawTx } from './RawTransaction'

export enum Roles {
    TopAdmin,
    UserAdmin,
    AssetAdmin,
    AgreementAdmin,
    AssetManager,
    Trader,
    Matcher
}

export interface UserProperties {
    accountAddress: string
    firstName: string
    surname: string
    organization: string
    street: string
    number: string
    zip: string
    city: string
    country: string
    state: string
    roles: number
}

export class User implements UserProperties {
    accountAddress: string

    firstName: string
    surname: string
    organization: string
    street: string
    number: string
    zip: string
    city: string
    country: string
    state: string

    roles: number
    active: boolean

    blockchainProperties: BlockchainProperties

    constructor(accountAddress: string, blockchainProperties: BlockchainProperties) {
        this.accountAddress = accountAddress
        this.blockchainProperties = blockchainProperties
    }

    static async CREATE_USER(userProperties: UserProperties, blockchainProperties: BlockchainProperties): Promise<User> {

        const userData = [
            userProperties.accountAddress,
            blockchainProperties.web3.utils.fromUtf8(userProperties.firstName),
            blockchainProperties.web3.utils.fromUtf8(userProperties.surname),
            blockchainProperties.web3.utils.fromUtf8(userProperties.organization),
            blockchainProperties.web3.utils.fromUtf8(userProperties.street),
            blockchainProperties.web3.utils.fromUtf8(userProperties.number),
            blockchainProperties.web3.utils.fromUtf8(userProperties.zip),
            blockchainProperties.web3.utils.fromUtf8(userProperties.city),
            blockchainProperties.web3.utils.fromUtf8(userProperties.country),
            blockchainProperties.web3.utils.fromUtf8(userProperties.state)
        ]

        const gasCreate = await blockchainProperties.userLogicInstance.methods
            .setUser(...userData)
            .estimateGas({ from: blockchainProperties.userAdmin })

        console.log(gasCreate)
        const txUserCreate = await blockchainProperties.userLogicInstance.methods
            .setUser(...userData)
            .send({ from: blockchainProperties.userAdmin, gas: Math.round(gasCreate * 3.1) })

        const gasSetRole = await blockchainProperties.userLogicInstance.methods
            .setRoles(userProperties.accountAddress, userProperties.roles)
            .estimateGas({ from: blockchainProperties.userAdmin })
        console.log(gasSetRole)

        const txSetRole = await blockchainProperties.userLogicInstance.methods
            .setRoles(userProperties.accountAddress, userProperties.roles)
            .send({ from: blockchainProperties.userAdmin, gas: Math.round(gasCreate * 3.1) })
        return (new User(userProperties.accountAddress, blockchainProperties)).syncWithBlockchain()
    }

    static async CREATE_USER_RAW(userProperties: UserProperties, blockchainProperties: BlockchainProperties): Promise<User> {

        const userData = [
            userProperties.accountAddress,
            blockchainProperties.web3.utils.fromUtf8(userProperties.firstName),
            blockchainProperties.web3.utils.fromUtf8(userProperties.surname),
            blockchainProperties.web3.utils.fromUtf8(userProperties.organization),
            blockchainProperties.web3.utils.fromUtf8(userProperties.street),
            blockchainProperties.web3.utils.fromUtf8(userProperties.number),
            blockchainProperties.web3.utils.fromUtf8(userProperties.zip),
            blockchainProperties.web3.utils.fromUtf8(userProperties.city),
            blockchainProperties.web3.utils.fromUtf8(userProperties.country),
            blockchainProperties.web3.utils.fromUtf8(userProperties.state)
        ]


        const gasCreate = await blockchainProperties.userLogicInstance.methods
            .setUser(...userData)
            .estimateGas({ from: blockchainProperties.userAdmin })

        const txUserCreate = await blockchainProperties.userLogicInstance.methods
            .setUser(...userData)
            .encodeABI()

        const txSetRole = await blockchainProperties.userLogicInstance.methods
            .setRoles(userProperties.accountAddress, userProperties.roles)
            .encodeABI()

        let txCount = await blockchainProperties.web3.eth.getTransactionCount(blockchainProperties.userAdmin)
        await sendRawTx(blockchainProperties.userAdmin, txCount, Math.round(gasCreate * 1.5), txUserCreate, blockchainProperties, blockchainProperties.userLogicInstance._address)
        await sendRawTx(blockchainProperties.userAdmin, txCount + 1, 200000, txSetRole, blockchainProperties, blockchainProperties.userLogicInstance._address)
        return (new User(userProperties.accountAddress, blockchainProperties)).syncWithBlockchain()

    }

    async syncWithBlockchain(): Promise<User> {
        if (this.accountAddress) {

            const userData = await this.blockchainProperties.userLogicInstance.methods.getFullUser(this.accountAddress).call()

            this.firstName = this.blockchainProperties.web3.utils.hexToUtf8(userData.firstName)
            this.surname = this.blockchainProperties.web3.utils.hexToUtf8(userData.surname)
            this.organization = this.blockchainProperties.web3.utils.hexToUtf8(userData.organization)
            this.street = this.blockchainProperties.web3.utils.hexToUtf8(userData.street)
            this.number = this.blockchainProperties.web3.utils.hexToUtf8(userData.number)
            this.zip = this.blockchainProperties.web3.utils.hexToUtf8(userData.zip)
            this.city = this.blockchainProperties.web3.utils.hexToUtf8(userData.city)
            this.country = this.blockchainProperties.web3.utils.hexToUtf8(userData.country)
            this.state = this.blockchainProperties.web3.utils.hexToUtf8(userData.state)

            this.roles = parseInt(userData.roles, 10)
            this.active = userData.active

        }
        return this
    }

}