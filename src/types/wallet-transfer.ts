import { Address, Cell, Coins } from 'ton3-core'

interface WalletTransfer {
    destination: Address
    amount: Coins
    body: Cell
    init?: Cell
    mode: number
}

export { WalletTransfer }
