import { ethers } from 'ethers';

import { getSmartContract } from '@/services/ethereum';

import { downloadDeliveryInfo } from "@/endpoints/ipfs";
import { decryptOrderInfo, decryptClientOrderInfo } from "@/utils/crypto";

import { orderDefaults } from '@/utils/constants';

const OrderStatus = Object.freeze({
  Pending:     { value: 0, name: "Pending", color: "yellow" },
  Approved:    { value: 1, name: "Approved", color: "light-green" },
  Accepted:    { value: 2, name: "Accepted", color: "orange" },
  Ready:       { value: 3, name: "Ready", color: "green" },
  PickedUp:    { value: 4, name: "Picked up", color: "green" },
  Transferred: { value: 5, name: "Transferred", color: "green" },
  InTransit:   { value: 6, name: "In transit", color: "green" },
  Received:    { value: 7, name: "Received", color: "green" },
  Delivered:   { value: 8, name: "Delivered", color: "green" },
  Completed:   { value: 9, name: "Completed", color: "blue" },
  Cancelled:   { value: 10, name: "Cancelled", color: "red" },
  Rejected:    { value: 11, name: "Rejected", color: "red" },
});

const OrderStatusMap = {
  0: OrderStatus.Pending,
  1: OrderStatus.Approved,
  2: OrderStatus.Accepted,
  3: OrderStatus.Ready,
  4: OrderStatus.PickedUp,
  5: OrderStatus.Transferred,
  6: OrderStatus.InTransit,
  7: OrderStatus.Received,
  8: OrderStatus.Delivered,
  9: OrderStatus.Completed,
  10: OrderStatus.Cancelled,
  11: OrderStatus.Rejected,
}

const ordersFromArrays = async (orderArrays, party = null, key = null) => {
  const orders = [];
  for (const index in orderArrays) {
    const order = await orderFromData(orderArrays[index], party, key);
    if (order) orders.push(order);
  }
  return orders;
}

const orderFromData = async (data, party = null, key = null) => {
  try {
    const order = {
      id: parseInt(data.id._hex, 16),
      amount: parseFloat(ethers.utils.formatEther(data.amount)),
      deliveryFee: parseFloat(ethers.utils.formatEther(data.deliveryFee)),
      collateral: parseFloat(ethers.utils.formatEther(data.collateral)),
      status: OrderStatusMap[data.status],
      client: data.client,
      seller: data.seller,
      deliveryService: data.deliveryService,
      orderContentsUrl: data.orderContentsUrl,
      originZipCode: data.originZipCode,
      destinationZipCode: data.destinationZipCode,
      waitOnReady: data.waitOnReady,
      loading: false,
    };
    if (order.status.value === OrderStatus.Pending.value) {
      order.collateral = order.amount * orderDefaults.defaultCollateralPercentage;
      order.deliveryFee = orderDefaults.defaultDeliveryFee;
    }
    if (order.status.value === OrderStatus.Completed.value) {
      order.tip = 0;
    }
    await attachIpfsData(order, party, key);
    await attachOrderCounts(order);
    return order;
  } catch (error) {
    console.log(error);
  }
}

const attachOrderCounts = async (order) => {
  const { tnoEats } = await getSmartContract();
  const orderCount = await tnoEats.getClientOrderCount(order.client);
  order.completedOrders = parseInt(orderCount[0]._hex, 16);
  order.cancelledOrders = parseInt(orderCount[1]._hex, 16);
} 

const attachIpfsData = async (order, party, key) => {
  if (!party) return;
  const orderInfo = await downloadDeliveryInfo(order.orderContentsUrl);
  switch (party) {
    case "client":
      if (!key) {
        console.log("Key is required to decrypt client order info");
        return;
      }
      const clientInfo = await decryptClientOrderInfo(orderInfo, key);
      order.orderInformation = clientInfo;
      break;
    case "seller":
      if (!key) {
        console.log("Key is required to decrypt seller order info");
        return;
      }
      const sellerInfo = await decryptOrderInfo(orderInfo, key);
      order.orderInformation = sellerInfo;
      break;
    case "delivery":
      order.hashedAddress = orderInfo.hashedAddress;
      break;
    default:
      console.log("Wrong party provided for the IPFS data download & decryption");
      break;
  }
}

export { ordersFromArrays, orderFromData, OrderStatus, OrderStatusMap }
