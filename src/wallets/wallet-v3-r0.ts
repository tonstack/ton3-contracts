import { ContractWalletV3R2 } from "./wallet-v3-r2";

class ContractWalletV3R0 extends ContractWalletV3R2 {
    get stringHexCode () {
        //  ---------------------------------------------------------------------------------    
        //  
        //  The source code and LICENSE of the "wallet v3 r0" smart contract:
        //  https://github.com/tonstack/wallet-smcs/tree/main/wallet/v3/r0
        //
        //  This(return '...') is a compiled version (byte code) of  
        //  the smart contract "wallet-v3-r0-code.fif" in the bag of cells
        //  serialization in hexadecimal representation. 
        //
        return 'B5EE9C724101010100620000C0FF0020DD2082014C97BA9730ED44D0D70B1FE0'+
               'A4F2608308D71820D31FD31FD31FF82313BBF263ED44D0D31FD31FD3FFD15132'+
               'BAF2A15144BAF2A204F901541055F910F2A3F8009320D74A96D307D402FB00E8'+
               'D101A4C8CB1FCB1FCBFFC9ED543FBE6EE0'
        //
        //  code cell hash(sha256): B61041A58A7980B946E8FB9E198E3C904D24799FFA36574EA4251C41A566F581
        //
        //  Respect the rights of open source software. Thanks! :)
        //  If you notice copyright violation, please create an issue:
        //  https://github.com/tonstack/ton3-contracts/issues
        //
        //  ---------------------------------------------------------------------------------   
    }
}

export { ContractWalletV3R0 }