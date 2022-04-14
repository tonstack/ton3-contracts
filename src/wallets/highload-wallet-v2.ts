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
    Bit,
    Builder,
    Cell,
    BOC,
    HashmapE,
    Address,
    Contracts
} from 'ton3-core'
import { WalletTransfer } from './types'

class ContractHighloadWalletV2 extends Contracts.ContractBase {
    private publicKey: Uint8Array

    private subwalletId: number

    constructor (workchain: number, publicKey: Uint8Array, subwalletId = 0) {

        //  ---------------------------------------------------------------------------------    
        //  
        //  The source code and LICENSE of the "Highload Wallet V2" smart contract:
        //  https://github.com/tonstack/wallet-smcs/tree/main/highload-wallet/v2
        //
        //  This(const hex = ...) is a compiled version (byte code) of  
        //  the smart contract "highload-wallet-v2-code.fc" in the bag of cells
        //  serialization in hexadecimal representation. 
        //
        const hex = 'B5EE9C724101090100E5000114FF00F4A413F4BCF2C80B010201200203020148'+
                    '040501EAF28308D71820D31FD33FF823AA1F5320B9F263ED44D0D31FD33FD3FF'+
                    'F404D153608040F40E6FA131F2605173BAF2A207F901541087F910F2A302F404'+
                    'D1F8007F8E16218010F4786FA5209802D307D43001FB009132E201B3E65B8325'+
                    'A1C840348040F4438AE63101C8CB1F13CB3FCBFFF400C9ED54080004D0300201'+
                    '2006070017BD9CE76A26869AF98EB85FFC0041BE5F976A268698F98E99FE9FF9'+
                    '8FA0268A91040207A0737D098C92DBFC95DD1F140034208040F4966FA56C1220'+
                    '94305303B9DE2093333601926C21E2B39F9E545A'
        //
        //  code cell hash(sha256): 9494D1CC8EDF12F05671A1A9BA09921096EB50811E1924EC65C3C629FBB80812
        //
        //  Respect the rights of open source software. Thanks! :)
        //  If you notice copyright violation, please create an issue:
        //  https://github.com/tonstack/ton3-contracts/issues
        //
        //  ---------------------------------------------------------------------------------    
        
        const code = BOC.fromStandard(hex)
        const storage = new Builder()
            .storeUint(subwalletId, 32)     // stored_subwallet
            .storeUint(0, 64)               // last_cleaned
            .storeBytes(publicKey)          // public_key
            .storeDict(new HashmapE(16))    // old_queries
            .cell()

        super(workchain, code, storage)

        this.publicKey = publicKey
        this.subwalletId = subwalletId
    }

    private static generateQueryId (timeout: number): bigint {
        const now = Math.floor(Date.now() / 1000)

        return (BigInt((now + timeout)) << 32n) - 1n
    }

    public createTransferMessage (
        transfers: WalletTransfer[],
        timeout: number = 60
    ): Contracts.MessageExternalIn {
        if (!transfers.length || transfers.length > 100) {
            throw new Error('ContractHighloadWalletV2: can make only 1 to 100 transfers per operation.')
        }

        const queryId = ContractHighloadWalletV2.generateQueryId(timeout)
        const body = new Builder()
            .storeUint(this.subwalletId, 32)
            .storeUint(queryId, 64)

        const serializers = {
            key: (k: number): Bit[] => new Builder().storeInt(k, 16).bits,
            value: (v: WalletTransfer): Cell => {
                const internal = new Contracts.MessageInternal({
                    bounce: v.destination.bounceable,
                    src: Address.NONE,
                    dest: v.destination,
                    value: v.amount
                }, v.body)

                return new Builder()
                    .storeUint(v.mode, 8) // send mode
                    .storeRef(internal.cell())
                    .cell()
            }
        }

        const dict = new HashmapE<number, WalletTransfer>(16, { serializers })
        transfers.forEach((transfer, i) => dict.set(i, transfer))
        body.storeDict(dict)

        return new Contracts.MessageExternalIn({ dest: this.address }, body.cell(), this.state)
    }

    public createDeployMessage (): Contracts.MessageExternalIn {
        const queryId = ContractHighloadWalletV2.generateQueryId(2 ** 16)
        const body = new Builder()
            .storeUint(this.subwalletId, 32) // subwallet_id
            .storeUint(queryId, 64) // query_id
            .storeDict(new HashmapE(16))

        return new Contracts.MessageExternalIn({ dest: this.address }, body.cell(), this.state)
    }
}

export { ContractHighloadWalletV2 }
