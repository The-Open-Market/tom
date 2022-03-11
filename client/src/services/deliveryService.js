import { getSmartContract } from './ethereum';

const acceptOrder = async (orderId) => {
  try {
      const { tnoEats } = await getSmartContract();
      const acceptOrderTx = await tnoEats.acceptOrder(orderId);
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
      const transferOrderTx = await tnoEats.transferOrder(orderId);
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
      const completeOrderTx = await tnoEats.completeOrder(orderId);
      await completeOrderTx.wait();
      return true;
  } catch (error) {
      console.log(error);
      return false;
  }
}

export { acceptOrder, pickupOrder, deliverOrder }
