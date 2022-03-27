import { reactive, readonly } from "vue";

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
    address: {
      street: "Dreamweg",
      houseNumber: 42,
      zipCode: "0042GG"
    }
  });
  sellersArray.push({
    id: 1,
    name: "Hard2Nail",
    phone: "0687654321",
    email: "norefunds@hard2nail.com",
    description: "Nails and hammers! Order now!",
    address: {
      street: "Woodenlaan",
      houseNumber: 7,
      houseAddition: "A",
      zipCode: "9988QN"
    }
  });
  setSellers(sellersArray);
}

const isSellerValid = (seller) => {
  if (!seller || !seller.address) {
    return false;
  }
  return seller.name
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