import { box, randomBytes, hash } from 'tweetnacl';
import {
  decodeUTF8,
  encodeUTF8,
  encodeBase64,
  decodeBase64
} from 'tweetnacl-util';

// Using: https://github.com/dchest/tweetnacl-js/wiki/Examples
const newNonce = () => randomBytes(box.nonceLength);

// const generateKeyPair = () => box.keyPair();

const encrypt = (secretOrSharedKey, json, key) => {
  const nonce = newNonce();
  const messageUint8 = decodeUTF8(JSON.stringify(json));
  const encrypted = key
    ? box(messageUint8, nonce, key, secretOrSharedKey)
    : box.after(messageUint8, nonce, secretOrSharedKey);

  const fullMessage = new Uint8Array(nonce.length + encrypted.length);
  fullMessage.set(nonce);
  fullMessage.set(encrypted, nonce.length);

  const base64FullMessage = encodeBase64(fullMessage);
  return base64FullMessage;
};

const decrypt = (secretOrSharedKey, messageWithNonce, key) => {
  const messageWithNonceAsUint8Array = decodeBase64(messageWithNonce);
  const nonce = messageWithNonceAsUint8Array.slice(0, box.nonceLength);
  const message = messageWithNonceAsUint8Array.slice(
    box.nonceLength,
    messageWithNonce.length
  );

  const decrypted = key
    ? box.open(message, nonce, key, secretOrSharedKey)
    : box.open.after(message, nonce, secretOrSharedKey);

  if (!decrypted) {
    throw new Error('Could not decrypt message');
  }

  const base64DecryptedMessage = encodeUTF8(decrypted);
  return JSON.parse(base64DecryptedMessage);
};


const encryptOrderInfo = async (sellerPublicKey, clientPublicKey, clientSecretKey, orderInfo) => {
    const shared = box.before(decodeBase64(sellerPublicKey), decodeBase64(clientSecretKey));
    const orderInformation =  encrypt(shared, orderInfo);

    const full_address = orderInfo['clientAddress']['street'] + 
      orderInfo['clientAddress']['house_nr'] +
      orderInfo['clientAddress']['house_nr_add'] +
      orderInfo['clientAddress']['zip'];

    const salt = randomBytes(10);
    const hashed_address = hash(decodeUTF8(full_address) + salt) + '$' + salt;

    return JSON.stringify({
        sellerPublicKey,
        clientPublicKey,
        orderInformation,
        hashed_address,
    });
};

const decryptOrderInfo = async ({ clientPublicKey, orderInformation }, sellerSecretKey) => {
    const shared = box.before(decodeBase64(clientPublicKey), decodeBase64(sellerSecretKey));
    const decrypted = decrypt(shared, orderInformation);
    return decrypted;
};

const isValidHash = async (clientAddress, hashed_address) => {
    const hash_part = hashed_address.split('$')[0];
    const salt = hashed_address.split('$')[1];

    return hash(decodeUTF8(clientAddress) + salt) == hash_part;
}

export { encryptOrderInfo, decryptOrderInfo };
