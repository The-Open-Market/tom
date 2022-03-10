import { getSmartContract } from './ethereum';

const approveOrder = async (orderId) => {
    try {
        const { tnoEats } = await getSmartContract();
        const approveOrderTx = await tnoEats.approveOrder(orderId, "DummySellerZip", "DummyClientZip");
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

export { approveOrder, rejectOrder }