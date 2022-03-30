import { reactive, readonly } from "vue";
import { box } from 'tweetnacl';
import { encodeBase64 } from 'tweetnacl-util';
import { setKeys } from '@/storage/keys';

const key = "sellers";

const sellers = reactive([]);

const addTestData = () => {
  const sellersArray = [];
  sellersArray.push({
    id: 0,
    name: "Fast Blast",
    phone: "0612345678",
    email: "support@fastfood.io",
    description: "We sell fast food since 2013.",
    imageUrl: "https://img.rawpixel.com/s3fs-private/rawpixel_images/website_content/upwk61666582-wikimedia-image.jpg?w=800&dpr=1&fit=default&crop=default&q=65&vib=3&con=3&usm=15&bg=F4F4F3&ixlib=js-2.2.1&s=e51c5b6671abdc478dbb5051e0308dc6",
    address: {
      street: "Dreamweg",
      houseNumber: 42,
      zipCode: "0042GG"
    },
    etherAddress: "0x59Ce492d182688239C118AcFEb1A4872Ce3B1231",
    keys: {
      "private": "Wc5JLRgmiCOcEYrP6xpIcs47EjFZzkktGCaII5wRis8=",
      "public": "3wn7e0hCji40iyiwhaB4Sr6cUmuoRvATplPMdUxK6G0=",
      "symmetric": "Wc5JLRgmiCOcEYrP6xpIcs47EjFZzkktGCaII5wRis8="
    },
  });
  sellersArray.push({
    id: 1,
    name: "Hard2Nail",
    phone: "0687654321",
    email: "norefunds@hard2nail.com",
    description: "Nails and hammers! Order now!",
    imageUrl: "https://p1.pxfuel.com/preview/360/696/34/construction-tools-wooden-background-build-chrome.jpg",
    address: {
      street: "Woodenlaan",
      houseNumber: 7,
      houseAddition: "A",
      zipCode: "9988QN"
    },
    etherAddress: "0x15f5319b330D8Da1E3a3852Fabcc60BFBA062919",
    keys: {
      "private": "FfUxmzMNjaHjo4Uvq8xgv7oGKRkV9TGbMw2NoeOjhS8=",
      "public": "dEF5pWL4CUEehUa/2QEwcud62szeUKUvUJtlY5vR8HU=",
      "symmetric": "FfUxmzMNjaHjo4Uvq8xgv7oGKRkV9TGbMw2NoeOjhS8="
    },
  });
  setKeys(sellersArray[0].etherAddress, sellersArray[0].keys);
  setKeys(sellersArray[1].etherAddress, sellersArray[1].keys);
  setSellers(sellersArray);
}

const isSellerValid = (seller) => {
  if (!seller || !seller.address) {
    return false;
  }
  return seller.name
      && seller.etherAddress
      && seller.address.street
      && seller.address.houseNumber
      && seller.address.zipCode;
}

const getSellers = () => {
  let sellersArray = JSON.parse(localStorage.getItem(key));
  if (sellersArray && sellers.length === sellersArray.length) {
    return readonly(sellers);
  } else if (sellersArray) {
    sellers.push(...sellersArray);
    return readonly(sellers);
  }
  addTestData();
  return readonly(sellers);
}

const setSellers = (sellersArray) => {
  localStorage.setItem(key, JSON.stringify(sellersArray));
  if (sellersArray.length !== sellers.length) {
    sellers.splice(0);
    sellers.push(...sellersArray);
  }
}

const saveSeller = (seller) => {
  if (!isSellerValid(seller)) {
    return false;
  }
  if (typeof seller.id !== 'undefined') {
    updateSeller(seller);
  } else {
    addSeller(seller);
  }
  return true;
}

const addSeller = (seller) => {
  const maxId = Math.max.apply(Math, sellers.map(function(s) { return s.id; }));
  seller.id = maxId + 1;
  const keys = box.keyPair();
  seller.keys.private = encodeBase64(keys.secretKey);
  seller.keys.public = encodeBase64(keys.publicKey);
  sellers.push(seller);
  setSellers(sellers);
}

const updateSeller = (seller) => {
  const index = sellers.findIndex(s => s.id === seller.id);
  sellers[index] = seller;
  setSellers(sellers);
}

const removeSeller = (sellerId) => {
  const index = sellers.findIndex(s => s.id === sellerId);
  sellers.splice(index, 1);
  setSellers(sellers);
}

export { getSellers, saveSeller, removeSeller }