import { getSmartContract } from '../services/ethereum';

const approveTransaction = async (amount) => {
    const { eurTno, tnoEats } = await getSmartContract();
    await eurTno.approve(tnoEats.address, amount);
}
  
export { approveTransaction }
