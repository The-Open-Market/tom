import { getSmartContract } from './ethereum';

const placeOrder = async (seller, orderInfo) => {
    try {
        const { tnoEats } = await getSmartContract();
        console.log(tnoEats);
        const placeOrderTx = await tnoEats.placeOrder(seller, orderInfo);
        await placeOrderTx.wait();
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

export { placeOrder };