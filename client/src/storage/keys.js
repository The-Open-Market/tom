import { reactive, readonly } from "vue";
import { secretbox, box, randomBytes } from 'tweetnacl';
import { encodeBase64 } from 'tweetnacl-util';
import { getSignerAddress } from '@/services/ethereum';
import { ethers } from 'ethers';

const key = "keys";

const userKeys = reactive({});

const getCurrentKeysAsync = async () => {
  if (Object.keys(userKeys).length > 0) {
    return readonly(userKeys);
  }
  await setupKeysAsync();
  return readonly(userKeys);
}

const setupKeysAsync = async (reset = false) => {
  const address = await getSignerAddress();
  let keysByAddress = JSON.parse(localStorage.getItem(key));
  if (!keysByAddress) {
    keysByAddress = {};
  }
  let keys = keysByAddress[address];
  if (keys) {
    Object.assign(userKeys, keys);
    return;
  }
  keys = generateKeys(address);
  Object.assign(userKeys, keys);
}

const generateKeys = (address) => {
  /* Generate deterministic keys (not secure, we store them locally either way) for example purposes only.
     They have to be deterministic if the same address is connected to another computer or browser. */
  const secretBytes = ethers.utils.arrayify(address);
  const symmetric = new Uint8Array([ ...secretBytes.slice(0, 32), ...secretBytes.slice(0, Math.max(0, 32 - secretBytes.length)) ]);
  const asymmetric = box.keyPair.fromSecretKey(symmetric);
  const keys = {
    private: encodeBase64(asymmetric.secretKey),
    public: encodeBase64(asymmetric.publicKey),
    symmetric: encodeBase64(symmetric),
  };
  setKeys(address, keys);
  return keys;
}

const setKeys = (address, keys) => {
  let keysByAddress = JSON.parse(localStorage.getItem(key));
  if (keysByAddress) {
    keysByAddress[address] = keys;
  } else {
    keysByAddress = {};
    keysByAddress[address] = keys;
  }
  localStorage.setItem(key, JSON.stringify(keysByAddress));
}

export { setupKeysAsync, generateKeys, getCurrentKeysAsync, setKeys }