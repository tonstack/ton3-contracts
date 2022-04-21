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

import { BOC } from 'ton3-core'
import { ContractWallet } from './wallet'

/*
The source code and LICENSE of the "wallet v3 r0" smart contract:
https://github.com/tonstack/wallet-smcs/tree/main/wallet/v3/r0

"const COMPILED = ..." is a compiled version (byte code) of
the smart contract "wallet-v3-r0-code.fif" in the bag of cells
serialization in hexadecimal representation.

code cell hash(sha256): B61041A58A7980B946E8FB9E198E3C904D24799FFA36574EA4251C41A566F581

Respect the rights of open source software. Thanks! :)
If you notice copyright violation, please create an issue:
https://github.com/tonstack/ton3-contracts/issues
*/

const COMPILED = 'B5EE9C724101010100620000C0FF0020DD2082014C97BA9730ED44D0D70B1FE0A4F2608308D71820D31FD31FD31FF82313BBF263ED44D0D31FD31FD3FFD15132BAF2A15144BAF2A204F901541055F910F2A3F8009320D74A96D307D402FB00E8D101A4C8CB1FCB1FCBFFC9ED543FBE6EE0'

class ContractWalletV3R0 extends ContractWallet {
    constructor (workchain: number, publicKey: Uint8Array, subwalletId = 0) {
        const code = BOC.fromStandard(COMPILED)

        super(code, workchain, publicKey, subwalletId)
    }
}

export { ContractWalletV3R0 }
