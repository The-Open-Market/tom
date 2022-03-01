import { Payments } from '../../dapp' // ABI and BYTECODE of smart contract
import Web3 from './web3'             // SDK for Ethereum network
import moment from 'moment'

class PaymentsService {
    pay = async function (address, reference, amount) {
        const web3 = await Web3()        
        if (!web3) {
            return undefined
        }
        let error
        try {
            const accounts = await web3.eth.getAccounts()
            const contract = await new web3.eth.Contract(JSON.parse(Payments.abi), address)
            const value = web3.utils.toWei(String(amount), 'ether')
            await contract.methods.pay(reference, value).send({from: accounts[0], value: value})
        } catch (e) {
            error = e.message
        }
        return error
    }
}

export default PaymentsService