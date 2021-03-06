import detectEthereumProvider from '@metamask/detect-provider';
import { ethers, Contract } from 'ethers';
import TOM from '@/../../build/contracts/TOM.json';
import EurTno from '@/../../build/contracts/EurTno.json';

const getSmartContract = async () => {
  let provider = await detectEthereumProvider();
  if (provider) {
    await provider.request({ method: 'eth_requestAccounts' });
    const networkId = await provider.request({ method: 'net_version' })
    provider = new ethers.providers.Web3Provider(provider);
    const signer = provider.getSigner();

    const tom = new Contract(
      TOM.networks[networkId].address,
      TOM.abi,
      signer
    );
    const eurTno = new Contract(
      EurTno.networks[networkId].address,
      EurTno.abi,
      signer
    );
    return { tom, eurTno };
  }
};

const getSignerAddress = async () => {
  let provider = await detectEthereumProvider();
  if (provider) {
    await provider.request({ method: 'eth_requestAccounts' });
    provider = new ethers.providers.Web3Provider(provider);
    const signer = provider.getSigner();
    return signer ? await signer.getAddress() : null;
  }
};


const listenToAccountChanges = (callback) => {
  if (!window.ethereum) {
    return;  // Fails silently
  }

  window.ethereum.on('accountsChanged', async (accounts) => {
    await callback();
  });
}

export { getSmartContract, getSignerAddress, listenToAccountChanges };
