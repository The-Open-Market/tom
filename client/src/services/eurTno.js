import { getSmartContract } from '../services/ethereum';

const approveTransaction = async (amount) => {
    const { eurTno, tnoEats } = await getSmartContract();
    const tx = await eurTno.approve(tnoEats.address, amount);
    await tx.wait();
}
  
export { approveTransaction }
