import { Address, Cell, Coins } from 'ton3-core';
import { ContractHighloadWalletV2 } from '../src/wallets/highload-wallet-v2'

;(async function () {
    // Usually you get keypair from some source
    const publicKey = Buffer.from('f4106f3bd62efb5f0b5ab8bd3183b4997ea52209692c073aa8cfcc4c051a4d88', 'hex');
    const secretKey = Buffer.from('4ff5c71eff7ec762b489897de4db86d93ea3b1d5c7cd89e467dd2934f9a49081f4106f3bd62efb5f0b5ab8bd3183b4997ea52209692c073aa8cfcc4c051a4d88', 'hex');
    const wallet = new ContractHighloadWalletV2(0, publicKey, 0)

    const message = wallet.createTransferMessage(
        [{
            amount: new Coins(1, true),
            body: new Cell(), // new Builder().storeUint(0, 32).storeString('random text').cell(),
            mode: 3,
            destination: new Address('0:f4924a8f10188c5888f3b3c462ac39ca96301b135fee173335c7f5aa1d12dce5'), // v4r2
        },
        {
            amount: new Coins(1, true),
            body: new Cell(), // new Builder().storeUint(0, 32).storeString('random text').cell(),
            mode: 3,
            destination: new Address('0:516e7c0bc637c70f2c99463062f2c73852468599b27699f573340ab476829c7c'), // v3r2
        }],
        true,
        ContractHighloadWalletV2.generateQueryId(
            60, // timeout in seconds
            Math.floor(Math.random() * 1000), // some kind of random number. Must be smaller than int32
        )
    )
    const signedMessage = message.sign(secretKey)
    console.log("Message:", signedMessage)

    // Now you need to send message somehow
    // For example
    // const messageBoc = Buffer.from(BOC.toBytesStandard(signedMessage))
    // client.sendFile(Boc)
})()
