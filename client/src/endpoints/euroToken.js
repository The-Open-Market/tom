import { ethers } from 'ethers';

import { getSmartContract } from '@/services/ethereum';

const approveTransaction = async (amount) => {
    try {
        const { eurTno, tom } = await getSmartContract();
        const etherAmount = ethers.utils.parseEther(amount.toString());
        const tx = await eurTno.approve(tom.address, etherAmount);
        await tx.wait();
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
}

const checkAllowance = async (address) => {
    try {
        const { eurTno, tom } = await getSmartContract();
        const response = await eurTno.allowance(address, tom.address);
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

const checkBalance = async (address) => {
    try {
        const { eurTno } = await getSmartContract();
        const response = await eurTno.balanceOf(address);
        return parseFloat(ethers.utils.formatEther(response));
    } catch (error) {
        console.log(error);
        return 0;
    }
}
  
export { approveTransaction, checkAllowance, getEuroTokens, checkBalance };
