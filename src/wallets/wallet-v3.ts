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

class ContractWalletV3 extends Contracts.ContractBase {
    private publicKey: Uint8Array

    private subwalletId: number

    constructor (workchain: number, publicKey: Uint8Array, subwalletId = 0) {
        const hex = 'B5EE9C724101010100710000DEFF0020DD2082014C97BA218201339CBAB19F71B0ED44D0D31FD31F31D70BFFE304E0A4F2608308D71820D31FD31FD31FF82313BBF263ED44D0D31FD31FD3FFD15132BAF2A15144BAF2A204F901541055F910F2A3F8009320D74A96D307D402FB00E8D101A4C8CB1FCB1FCBFFC9ED5410BD6DAD'
        const code = BOC.fromStandard(hex)
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
        transfers: WalletTransfer[],
        seqno: number,
        timeout: number = 60
    ): Contracts.MessageExternalIn {
        if (!transfers.length || transfers.length > 4) {
            throw new Error('ContractWalletV3: can make only 1 to 4 transfers per operation.')
        }

        const options = { dest: this.address }
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

        return new Contracts.MessageExternalIn(options, body.cell(), this.state)
    }

    public createDeployMessage (): Contracts.MessageExternalIn {
        const body = new Builder()
            .storeUint(this.subwalletId, 32)
            .storeInt(-1, 32) // valid until
            .storeUint(0, 32) // seqno

        return new Contracts.MessageExternalIn({ dest: this.address }, body.cell(), this.state)
    }
}

export { ContractWalletV3 }
