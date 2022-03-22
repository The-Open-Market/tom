import { ethers } from 'ethers';

import { getSmartContract } from '@/services/ethereum';
import { ordersFromArrays } from '@/utils/order';

const getOrdersBySeller = async (address, key = null) => {
  const { tnoEats } = await getSmartContract();
  const orders = await tnoEats.getOrdersBySeller(address);
  return ordersFromArrays(orders, 'seller', key);
}

const approveOrder = async (orderId, fee, collateral) => {
    try {
        const { tnoEats } = await getSmartContract();
        const etherFee = ethers.utils.parseEther(fee.toString());
        const etherCollateral = ethers.utils.parseEther(collateral.toString());
        const approveOrderTx = await tnoEats.approveOrder(orderId, "DummySellerZip", "DummyClientZip", etherFee, etherCollateral);
        await approveOrderTx.wait();
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

const rejectOrder = async (orderId) => {
    try {
        const { tnoEats } = await getSmartContract();
        const rejectOrderTx = await tnoEats.rejectOrder(orderId);
        await rejectOrderTx.wait();
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

const transferOrder = async (orderId) => {
    try {
        const { tnoEats } = await getSmartContract();
        const transferOrderTx = await tnoEats.transferOrder(orderId);
        await transferOrderTx.wait();
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

export { getOrdersBySeller, approveOrder, rejectOrder, transferOrder }