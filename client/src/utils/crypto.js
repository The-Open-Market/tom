import { secretbox, box, randomBytes, hash } from 'tweetnacl';
import { decodeUTF8, encodeUTF8, encodeBase64, decodeBase64 } from 'tweetnacl-util';
import { Buffer } from 'buffer';

// Using: https://github.com/dchest/tweetnacl-js/wiki/Examples
const newNonce = () => randomBytes(box.nonceLength);

// const generateKeyPair = () => box.keyPair();

const generateKey = () => encodeBase64(randomBytes(secretbox.keyLength));

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

export const symEncrypt = (key, json) => {
  const keyUint8Array = decodeBase64(key);

  const nonce = newNonce();
  const messageUint8 = decodeUTF8(JSON.stringify(json));
  const box = secretbox(messageUint8, nonce, keyUint8Array);

  const fullMessage = new Uint8Array(nonce.length + box.length);
  fullMessage.set(nonce);
  fullMessage.set(box, nonce.length);

  const base64FullMessage = encodeBase64(fullMessage);
  return base64FullMessage;
};

export const symDecrypt = (key, messageWithNonce) => {
  const keyUint8Array = decodeBase64(key);
  const messageWithNonceAsUint8Array = decodeBase64(messageWithNonce);
  const nonce = messageWithNonceAsUint8Array.slice(0, secretbox.nonceLength);
  const message = messageWithNonceAsUint8Array.slice(
    secretbox.nonceLength,
    messageWithNonce.length
  );

  const decrypted = secretbox.open(message, nonce, keyUint8Array);

  if (!decrypted) {
    throw new Error("Could not decrypt message");
  }

  const base64DecryptedMessage = encodeUTF8(decrypted);
  return JSON.parse(base64DecryptedMessage);
};

const encryptOrderInfo = async (sellerPublicKey, clientPublicKey, clientSecretKey, clientKey, orderInfo) => {
    const fullAddress = orderInfo['deliveryAddress']['street'] + 
      orderInfo['deliveryAddress']['hnr'] +
      orderInfo['deliveryAddress']['hnr_add'] +
      orderInfo['deliveryAddress']['zip'];

    const salt = Uint8Array.from(randomBytes(10));
    const hashInput = Uint8Array.from(decodeUTF8(fullAddress) + salt);
    const hashedAddress = Buffer.from(hash(hashInput)).toString('hex');

    orderInfo['salt'] = encodeBase64(salt);

    const shared = box.before(decodeBase64(sellerPublicKey), decodeBase64(clientSecretKey));
    const orderInformation = encrypt(shared, orderInfo);

    const clientOrderInformation = symEncrypt(clientKey, orderInfo);

    return JSON.stringify({
        sellerPublicKey,
        clientPublicKey,
        orderInformation,
        clientOrderInformation,
        hashedAddress,
    });
};

const decryptOrderInfo = async ({ clientPublicKey, orderInformation }, sellerSecretKey) => {
  const shared = box.before(decodeBase64(clientPublicKey), decodeBase64(sellerSecretKey));
  const decrypted = decrypt(shared, orderInformation);
  return decrypted;
};

const decryptClientOrderInfo = async ({ clientOrderInformation }, clientKey) => {
  return symDecrypt(clientKey, clientOrderInformation);
}

const isValidHash = async (clientAddress, saltString, hashedAddress) => {
  try {
    const salt = decodeBase64(saltString);
    const hashPart = hashedAddress.split('$')[0];
	  const hashInput = Uint8Array.from(decodeUTF8(clientAddress) + salt);

    return Buffer.from(hash(hashInput)).toString('hex') == hashPart;
  } catch (error) {
    return false;
  }
}

export { encryptOrderInfo, decryptOrderInfo, decryptClientOrderInfo, isValidHash };
