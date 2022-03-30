import { ethers } from 'ethers';

import { getSmartContract } from '@/services/ethereum';

const approveTransaction = async (amount) => {
    try {
        const { eurTno, tnoEats } = await getSmartContract();
        const etherAmount = ethers.utils.parseEther(amount.toString());
        const tx = await eurTno.approve(tnoEats.address, etherAmount);
        await tx.wait();
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

const checkAllowance = async (address) => {
    try {
        const { eurTno, tnoEats } = await getSmartContract();
        const response = await eurTno.allowance(address, tnoEats.address);
        return parseFloat(ethers.utils.formatEther(response));
    } catch (error) {
        console.log(error);
        return 0;
    }
}

const getEuroTokens = async (address, amount) => {
    try {
        const { eurTno } = await getSmartContract();
        const etherAmount = ethers.utils.parseEther(amount.toString());
        const tx = await eurTno.mint(address, etherAmount);
        await tx.wait();
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}
  
export { approveTransaction, checkAllowance, getEuroTokens }
