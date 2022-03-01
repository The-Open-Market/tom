import Web3 from 'web3'             // SDK for Ethereum network
import { create } from 'ipfs-http-client'

const ADDRESS = ''
const ABI = ''

// Use infura public api for now, but we could run our own node if we have time
const ipfsClient = create('https://ipfs.infura.io')

class PaymentsService {

    checkout = async function (sellerAddress, customerAddress, cartContents) {
        const items = cartContents.map(x => { return { 'id': x.id, 'quantity': x.quantity }})
        const price = cartContents.map(x => x.quantity * x.price).reduce((prev, current) => prev + current, 0)
        const order = {'address': customerAddress, 'items': items, 'price': price}
        const ipfsAddress = ipfsClient.add(order)
    
        return this.pay(sellerAddress, ipfsAddress)
    }

    pay = async function (sellerAddress, ipfsAddress) {
        const web3 = await Web3()        
        if (!web3) {
            return undefined
        }
        let error
        try {
            const contract = await new web3.eth.Contract(ABI, ADDRESS)
            await contract.methods.startOrder(sellerAddress, ipfsAddress)
        } catch (e) {
            error = e.message
        }
        return error
    }
}

export default PaymentsService