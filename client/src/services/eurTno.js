import { getSmartContract } from '../services/ethereum';

const approveTransaction = async (amount) => {
    try {
        const { eurTno, tnoEats } = await getSmartContract();
        const tx = await eurTno.approve(tnoEats.address, amount);
        await tx.wait();
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}
  
export { approveTransaction }
