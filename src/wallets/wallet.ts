/*
ton3-contracts – JS package for interacting with TON contracts

Copyright (C) 2022 TonStack <https://github.com/tonstack>

This file is part of ton3-contracts.

ton3-contracts is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

ton3-contracts is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with ton3-contracts.  If not, see <https://www.gnu.org/licenses/>.
*/

import {
    Builder,
    Cell,
    BOC,
    Address,
    Contracts
} from 'ton3-core'

import { WalletTransfer } from '../types/wallet-transfer'

class ContractWallet extends Contracts.ContractBase {
    private publicKey: Uint8Array

    private subwalletId: number

    constructor (code: Cell, workchain: number, publicKey: Uint8Array, subwalletId = 0) {
        const storage = new Builder()
            .storeUint(0, 32)
            .storeUint(subwalletId, 32)
            .storeBytes(publicKey)
            .cell()

        super(workchain, code, storage)

        this.publicKey = publicKey
        this.subwalletId = subwalletId
    }

    public createTransferMessage (
        transfers: WalletTransfer[],    // array of transfers
        seqno: number,                  // sequence transfer number
        timeout: number = 60            // timeout in seconds
    ): Contracts.MessageExternalIn {
        if (!transfers.length || transfers.length > 4) {
            throw new Error('ContractWalletV3: can make only 1 to 4 transfers per operation.')
        }

        const body = new Builder()
            .storeUint(this.subwalletId, 32)
            .storeUint(~~(Date.now() / 1000) + timeout, 32) // valid until
            .storeUint(seqno, 32)

        transfers.forEach((transfer) => {
            const internal = new Contracts.MessageInternal({
                bounce: transfer.destination.bounceable,
                src: Address.NONE,
                dest: transfer.destination,
                value: transfer.amount
            }, transfer.body)

            body.storeUint(transfer.mode, 8)
                .storeRef(internal.cell())
        })

        return new Contracts.MessageExternalIn(
            { dest: this.address }, 
            body.cell(), 
            seqno === 0 ? this.state : null
        )
    }

    public createDeployMessage (): Contracts.MessageExternalIn {
        const body = new Builder()
            .storeUint(this.subwalletId, 32)
            .storeInt(-1, 32) // valid until
            .storeUint(0, 32) // seqno

        return new Contracts.MessageExternalIn({ dest: this.address }, body.cell(), this.state)
    }
}

export { ContractWallet }
