import { ethers } from 'ethers';

import { getSmartContract } from '@/services/ethereum';
import { ordersFromArrays } from '@/utils/order';
import { GAS_LIMIT } from '@/utils/constants';

const getOrdersByClient = async (address, key = null) => {
  const { tom } = await getSmartContract();
  const orders = await tom.getOrdersByClient(address);
  return ordersFromArrays(orders, 'client', key);
}

const placeOrder = async (seller, orderInfo, amount) => {
    try {
        const { tom } = await getSmartContract();
        const etherAmount = ethers.utils.parseEther(amount.toString());

        const placeOrderTx = await tom.placeOrder(seller, orderInfo, etherAmount, { gasLimit: GAS_LIMIT });
        await placeOrderTx.wait();
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

const cancelOrder = async (orderId) => {
    try {
        const { tom } = await getSmartContract();
        const cancelOrderTx = await tom.cancelOrder(orderId, { gasLimit: GAS_LIMIT });
        await cancelOrderTx.wait();
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

const receiveOrder = async (orderId) => {
    try {
        const { tom } = await getSmartContract();
        const completeOrderTx = await tom.completeOrder(orderId, { gasLimit: GAS_LIMIT });
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