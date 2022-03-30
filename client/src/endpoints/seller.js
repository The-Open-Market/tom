import { ethers } from 'ethers';

import { getSmartContract } from '@/services/ethereum';
import { ordersFromArrays } from '@/utils/order';
import { GAS_LIMIT } from '@/utils/constants';

const getOrdersBySeller = async (address, key = null) => {
  const { tnoEats } = await getSmartContract();
  const ordersRaw = await tnoEats.getOrdersBySeller(address);
  const orders = await ordersFromArrays(ordersRaw, 'seller', key);
  return orders;
}

const approveOrder = async (orderId, fee, collateral, originZipCode, destinationZipCode, waitOnReady) => {
    try {
        const { tnoEats } = await getSmartContract();
        const etherFee = ethers.utils.parseEther(fee.toString());
        const etherCollateral = ethers.utils.parseEther(collateral.toString());
        const approveOrderTx = await tnoEats.approveOrder(orderId, originZipCode, destinationZipCode, etherFee, etherCollateral, waitOnReady, { gasLimit: GAS_LIMIT });
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
        const rejectOrderTx = await tnoEats.rejectOrder(orderId, { gasLimit: GAS_LIMIT });
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
        const transferOrderTx = await tnoEats.transferOrder(orderId, { gasLimit: GAS_LIMIT });
        await transferOrderTx.wait();
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

const preparedOrder = async (orderId) => {
    try {
        const { tnoEats } = await getSmartContract();
        const transferOrderTx = await tnoEats.preparedOrder(orderId, { gasLimit: GAS_LIMIT });
        await transferOrderTx.wait();
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

export { getOrdersBySeller, approveOrder, rejectOrder, transferOrder, preparedOrder }