import { inject } from "vue";

import { getSmartContract } from '@/services/ethereum';

const toast = inject('$toast');

const approveTransaction = async (amount) => {
    try {
        const { eurTno, tnoEats } = await getSmartContract();
        const tx = await eurTno.approve(tnoEats.address, amount);
        await tx.wait();
        return true;
    } catch (error) {
        toast.error(`Error approving euro transaction #${orderId}`);
        console.log(error);
        return false;
    }
}
  
export { approveTransaction }
