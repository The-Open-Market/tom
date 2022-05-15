import { downloadDeliveryInfo, uploadDeliveryInfo } from '@/endpoints/ipfs';
import { encryptOrderInfo, decryptOrderInfo, generateKeyPair, generateKey } from '@/utils/crypto';
import { encodeBase64 } from 'tweetnacl-util';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const measureOneRound = async (orderInfo) => {
    const sellerKeys = generateKeyPair();
    const clientKeys = generateKeyPair();
    const clientKey = generateKey();

    const sellerPublicKey = encodeBase64(sellerKeys.publicKey);
    const sellerSecretKey = encodeBase64(sellerKeys.secretKey);
    const clientPublicKey = encodeBase64(clientKeys.publicKey);
    const clientSecretKey = encodeBase64(clientKeys.secretKey);

    performance.mark("start-encrypt");
    // Encrypt
    const encrypted = await encryptOrderInfo(sellerPublicKey, clientPublicKey, clientSecretKey, clientKey, orderInfo);
    performance.mark("end-encrypt");
    // Upload
    const path = await uploadDeliveryInfo(encrypted);
    performance.mark("end-upload");
    // Download
    const downloadedInfo = await downloadDeliveryInfo(path);
    performance.mark("end-download");
    // Decrypt
    await decryptOrderInfo(downloadedInfo, sellerSecretKey);
    performance.mark("end-decrypt");

    performance.measure("total-encrypt", "start-encrypt", "end-encrypt");
    performance.measure("total-upload", "end-encrypt", "end-upload");
    performance.measure("total-download", "end-upload", "end-download");
    performance.measure("total-decrypt", "end-download", "end-decrypt");

    const measurement = [
        performance.getEntriesByName('total-encrypt', 'measure').pop().duration,
        performance.getEntriesByName('total-upload', 'measure').pop().duration,
        performance.getEntriesByName('total-download', 'measure').pop().duration,
        performance.getEntriesByName('total-decrypt', 'measure').pop().duration,
    ];

    // Clear all marks and measures for next run
    performance.clearMarks('start-encrypt');
    performance.clearMarks('end-encrypt');
    performance.clearMarks('end-upload');
    performance.clearMarks('end-download');
    performance.clearMarks('end-decrypt');
    performance.clearMeasures('total-encrypt');
    performance.clearMeasures('total-upload');
    performance.clearMeasures('total-download');
    performance.clearMeasures('total-decrypt');

    return measurement;
};

const measureBytes = async (orderInfo) => {
    const sellerKeys = generateKeyPair();
    const clientKeys = generateKeyPair();
    const clientKey = generateKey();

    const sellerPublicKey = encodeBase64(sellerKeys.publicKey);
    const clientPublicKey = encodeBase64(clientKeys.publicKey);
    const clientSecretKey = encodeBase64(clientKeys.secretKey);

    const encrypted = await encryptOrderInfo(sellerPublicKey, clientPublicKey, clientSecretKey, clientKey, orderInfo);
    const byteSize = str => new Blob([str]).size;
    console.log(`Items size: ${byteSize(JSON.stringify(orderInfo))}, IPFS size: ${byteSize(encrypted)}`);
};

const measurePerformance = async () => {
    console.log('Starting the measurements');
    const measurements = {};
    for (const orderSize of [1, 5, 25, 100, 500]) {
        console.log(`Measuring orderSize = ${orderSize}`);
        measurements[orderSize] = [];
        for (let i = 0; i < 10; ++i) {
            try {
                const orderInfo = {
                    "deliveryAddress": {
                      "street": "The Street Address",
                      "hnr": "1234",
                      "hnr_add": "AB",
                      "zip": "0000 AA"
                    },
                    "cart": Array(orderSize).fill({
                        "id": "cc919e21-ae5b-5e1f-d023-c4ach669520c",
                        "name": "TNO burger",
                        "img": "https://assets.biggreenegg.eu/app/uploads/2019/03/28145521/topimage-classic-hamburger-2019m04-800x534.jpg",
                        "price": 1000.50,
                        "quantity": 100
                    }),
                };
                const result = await measureOneRound(orderInfo);
                measurements[orderSize].push(result);
                console.log(result);
                await sleep(5000);
                await measureBytes(orderInfo);
            } catch (_) {
                console.log(_);  // Too many requests
                await sleep(10000);
            }
        }
    }

    console.log('Results')
    console.log(JSON.stringify(measurements, null, 2));
};

export { measurePerformance };
