import { ethers } from 'ethers';

import { getSmartContract } from '@/services/ethereum';
import { ordersFromArrays } from '@/utils/order';

const getOrdersByClient = async (address, key = null) => {
  const { tnoEats } = await getSmartContract();
  const orders = await tnoEats.getOrdersByClient(address);
  return ordersFromArrays(orders, 'client', key);
}

const placeOrder = async (seller, orderInfo, amount) => {
    try {
        const { tnoEats } = await getSmartContract();
        const etherAmount = ethers.utils.parseEther(amount.toString());

        const placeOrderTx = await tnoEats.placeOrder(seller, orderInfo, etherAmount, {gasLimit: 1000000});
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
        const cancelOrderTx = await tnoEats.cancelOrder(orderId, {gasLimit: 1000000});
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
        const completeOrderTx = await tnoEats.completeOrder(orderId, {gasLimit: 1000000});
        await completeOrderTx.wait();
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

const sendTip = async (deliveryService, amount) => {
    try {
        const { eurTno } = await getSmartContract();
        const etherAmount = ethers.utils.parseEther(amount.toString());
        const tipTx = await eurTno.transfer(deliveryService, etherAmount);
        await tipTx.wait();
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

export { getOrdersByClient, placeOrder, cancelOrder, receiveOrder, sendTip };