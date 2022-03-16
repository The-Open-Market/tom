import detectEthereumProvider from '@metamask/detect-provider';
import { ethers, Contract } from 'ethers';
import TnoEats from '../../../build/contracts/TnoEats.json';
import EurTno from '../../../build/contracts/EurTno.json';

const getSmartContract = async () => {
  let provider = await detectEthereumProvider();
  if (provider) {
    await provider.request({ method: 'eth_requestAccounts' });
    const networkId = await provider.request({ method: 'net_version' })
    provider = new ethers.providers.Web3Provider(provider);
    const signer = provider.getSigner();

    const tnoEats = new Contract(
      TnoEats.networks[networkId].address,
      TnoEats.abi,
      signer
    );
    const eurTno = new Contract(
      EurTno.networks[networkId].address,
      EurTno.abi,
      signer
    );
    return { tnoEats, eurTno };
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
}

export { getSmartContract, getSignerAddress };
