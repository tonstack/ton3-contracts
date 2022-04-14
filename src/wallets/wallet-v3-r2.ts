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
    Coins,
    Contracts
} from 'ton3-core'

interface WalletTransfer {
    destination: Address
    amount: Coins
    body: Cell
    mode: number
}

class ContractWalletV3R2 extends Contracts.ContractBase {
    private publicKey: Uint8Array

    private subwalletId: number

    get stringHexCode () {
        //  ---------------------------------------------------------------------------------    
        //  
        //  The source code and LICENSE of the "wallet v3 r2" smart contract:
        //  https://github.com/tonstack/wallet-smcs/tree/main/wallet/v3/r2
        //
        //  This(return '...') is a compiled version (byte code) of  
        //  the smart contract "wallet-v3-r2-code.fif" in the bag of cells
        //  serialization in hexadecimal representation. 
        //
        return 'B5EE9C724101010100710000DEFF0020DD2082014C97BA218201339CBAB19F71'+
               'B0ED44D0D31FD31F31D70BFFE304E0A4F2608308D71820D31FD31FD31FF82313'+
               'BBF263ED44D0D31FD31FD3FFD15132BAF2A15144BAF2A204F901541055F910F2'+
               'A3F8009320D74A96D307D402FB00E8D101A4C8CB1FCB1FCBFFC9ED5410BD6DAD'
        //
        //  code cell hash(sha256): 84DAFA449F98A6987789BA232358072BC0F76DC4524002A5D0918B9A75D2D599
        //
        //  Respect the rights of open source software. Thanks! :)
        //  If you notice copyright violation, please create an issue:
        //  https://github.com/tonstack/ton3-contracts/issues
        //
        //  ---------------------------------------------------------------------------------   
    }

    constructor (workchain: number, publicKey: Uint8Array, subwalletId = 0) {
        super(workchain, new Cell(), new Cell)

        const code = BOC.fromStandard(this.stringHexCode)
        const storage = new Builder()
            .storeUint(0, 32)
            .storeUint(subwalletId, 32)
            .storeBytes(publicKey)
            .cell()

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

        return new Contracts.MessageExternalIn({ dest: this.address }, body.cell(), this.state)
    }

    public createDeployMessage (): Contracts.MessageExternalIn {
        const body = new Builder()
            .storeUint(this.subwalletId, 32)
            .storeInt(-1, 32) // valid until
            .storeUint(0, 32) // seqno

        return new Contracts.MessageExternalIn({ dest: this.address }, body.cell(), this.state)
    }
}

export { ContractWalletV3R2 }
