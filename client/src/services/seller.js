import { getSmartContract } from './ethereum';

const approveOrder = async (orderId) => {
    try {
        const { tnoEats } = await getSmartContract();
        const approveOrderTx = await tnoEats.approveOrder(orderId, "DummySellerZip", "DummyClientZip");
        await approveOrderTx.wait();
        console.log("Approved order " + orderId);
    } catch (error) {
        console.log(error);
    }
}

const rejectOrder = async (orderId) => {
    try {
        const { tnoEats } = await getSmartContract();
        const rejectOrderTx = await tnoEats.rejectOrder(orderId);
        await rejectOrderTx.wait();
        console.log("Rejected order " + orderId); 
    } catch (error) {
        console.log(error);
    }
}

export { approveOrder, rejectOrder }