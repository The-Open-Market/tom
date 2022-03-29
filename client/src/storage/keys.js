import { reactive, readonly } from "vue";
import { secretbox, box, randomBytes } from 'tweetnacl';
import { encodeBase64 } from 'tweetnacl-util';
import { getSignerAddress } from '@/services/ethereum';

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
  const asymmetric = box.keyPair();
  const symmetric = randomBytes(secretbox.keyLength);
  const keys = {
    private: encodeBase64(asymmetric.secretKey),
    public: encodeBase64(asymmetric.publicKey),
    symmetric: encodeBase64(symmetric)
  }
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