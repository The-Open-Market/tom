import { getSmartContract } from '../services/ethereum';
import { OrderStatusMap } from '@/services/order';

const mapOrders = (orderArrays) => {
  let orders = []; 
  for (var key in orderArrays) {
    orders.push({
      id: parseInt(orderArrays[key].id._hex, 16),
      status: OrderStatusMap[orderArrays[key].status],
      client: orderArrays[key].client,
      seller: orderArrays[key].seller,
      deliveryService: orderArrays[key].deliveryService
    });
  }
  return orders;
}

const getOrdersByClient = async (address) => {
  const { tnoEats } = await getSmartContract();
  const orders = await tnoEats.getOrdersByClient(address);
  return mapOrders(orders);
}

const getOrdersBySeller = async (address) => {
  const { tnoEats } = await getSmartContract();
  const orders = await tnoEats.getOrdersBySeller(address);
  return mapOrders(orders);
}
 
const getOrdersByDeliveryService = async (address) => {
  const { tnoEats } = await getSmartContract();
  const orders = await tnoEats.getOrdersByDeliveryService(address);
  return mapOrders(orders);
}

const getApprovedOrders = async () => {
  const { tnoEats } = await getSmartContract();
  const orders = await tnoEats.getApprovedOrders();
  return mapOrders(orders);
}

export { getOrdersByClient, getOrdersBySeller, getOrdersByDeliveryService, getApprovedOrders }
