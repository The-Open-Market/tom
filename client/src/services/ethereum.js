import detectEthereumProvider from '@metamask/detect-provider';
import { ethers, Contract } from 'ethers';
import TnoEats from '../../../build/contracts/TnoEats.json';

const getSmartContract = () =>
  new Promise((resolve, reject) => {
    (async () => {
      let provider = await detectEthereumProvider();
      if (provider) {
        await provider.request({ method: 'eth_requestAccounts' });
        const networkId = await provider.request({ method: 'net_version' })
        provider = new ethers.providers.Web3Provider(provider);
        const signer = provider.getSigner();

        console.log(networkId);

        const tnoEats = new Contract(
          TnoEats.networks[networkId].address,
          TnoEats.abi,
          signer
        );
        resolve({ tnoEats });
        return;
      }
      reject('Metamask is not installed, please install the Metamask wallet');
    })();
  });



export { getSmartContract };