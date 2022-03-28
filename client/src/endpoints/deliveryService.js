import { getSmartContract } from '@/services/ethereum';
import { ordersFromArrays } from '@/utils/order';
import { gasLimit } from '@/utils/constants';

const getOrdersByDeliveryService = async (address) => {
  const { tnoEats } = await getSmartContract();
  const orders = await tnoEats.getOrdersByDeliveryService(address);
  return ordersFromArrays(orders, 'delivery');
}

const getApprovedOrders = async () => {
  const { tnoEats } = await getSmartContract();
  const orders = await tnoEats.getApprovedOrders();
  return ordersFromArrays(orders);
}

const acceptOrder = async (orderId) => {
  try {
    const { tnoEats } = await getSmartContract();
    const acceptOrderTx = await tnoEats.acceptOrder(orderId, { gasLimit });
    await acceptOrderTx.wait();
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

const pickupOrder = async (orderId) => {
  try {
    const { tnoEats } = await getSmartContract();
    const transferOrderTx = await tnoEats.transferOrder(orderId, { gasLimit });
    await transferOrderTx.wait();
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

const deliverOrder = async (orderId) => {
  try {
    const { tnoEats } = await getSmartContract();
    const completeOrderTx = await tnoEats.completeOrder(orderId, { gasLimit });
    await completeOrderTx.wait();
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

export { getOrdersByDeliveryService, getApprovedOrders, acceptOrder, pickupOrder, deliverOrder }
