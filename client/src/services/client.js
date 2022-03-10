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

const cancelOrder = async (orderId) => {
    try {
        const { tnoEats } = await getSmartContract();
        console.log(tnoEats);
        const cancelOrderTx = await tnoEats.cancelOrder(orderId);
        await cancelOrderTx.wait();
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

const receiveOrder = async (orderId) => {
    try {
        const { tnoEats } = await getSmartContract();
        console.log(tnoEats);
        const completeOrderTx = await tnoEats.completeOrder(orderId);
        await completeOrderTx.wait();
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}


export { placeOrder, cancelOrder, receiveOrder };