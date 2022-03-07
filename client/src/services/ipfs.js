import { create } from 'ipfs-http-client';


const IPFS = create('https://ipfs.infura.io:5001/api/v0');


const uploadDeliveryInfo = async (info) => {
    const { path } = await IPFS.add(info);
    return path;
};

const downloadDeliveryInfo = async (path) => {
    return (await fetch(`https://ipfs.infura.io/ipfs/${path}`)).text();
};

export { uploadDeliveryInfo, downloadDeliveryInfo };
