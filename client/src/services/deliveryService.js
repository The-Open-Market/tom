import { getSmartContract } from './ethereum';

const acceptOrder = async (orderId) => {
  try {
      const { tnoEats } = await getSmartContract();
      const acceptOrderTx = await tnoEats.acceptOrder(orderId);
      await acceptOrderTx.wait();
      console.log("Accepted order " + orderId);
  } catch (error) {
      console.log(error);
  }
}

const pickupOrder = async (orderId) => {
  try {
      const { tnoEats } = await getSmartContract();
      const transferOrderTx = await tnoEats.transferOrder(orderId);
      await transferOrderTx.wait();
      console.log("Picked-up order " + orderId);
  } catch (error) {
      console.log(error);
  }
}

const deliverOrder = async (orderId) => {
  try {
      const { tnoEats } = await getSmartContract();
      const completeOrderTx = await tnoEats.completeOrder(orderId);
      await completeOrderTx.wait();
      console.log("Accepted order " + orderId);
  } catch (error) {
      console.log(error);
  }
}

export { acceptOrder, pickupOrder, deliverOrder }