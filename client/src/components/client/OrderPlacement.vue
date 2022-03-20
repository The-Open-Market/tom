<template>
  <div>
    <ProductList @addToCart="addToCart"/>
    <ShoppingCart :cartContents="cartContents" @increment="increment" @decrement="decrement" @remove="remove"/>
    <Checkout :cartContents="cartContents" :address="address" :loading="loading" @checkout="checkout"/>
  </div>
</template>

<script>
import ProductList from '@/components/client/ProductList.vue';
import ShoppingCart from '@/components/client/ShoppingCart.vue';
import Checkout from '@/components/client/Checkout.vue';

import { ethers } from 'ethers';
import { approveTransaction } from '@/services/eurTno';
import { placeOrder } from '@/services/client';
import { encryptOrderInfo } from "@/services/crypto";
import { uploadDeliveryInfo } from "@/services/ipfs";

import { ref, reactive } from "vue";

export default {
  name: "OrderPlacement",

  setup() {
    const cartContents = reactive([]);
    const address = reactive({
      street: undefined,
      houseNumber: undefined,
      houseAddition: undefined,
      zipCode: undefined
    });
    const loading = ref(false);

    const addToCart = (product) => {
      if (cartContents.filter(entry => entry.id === product.id).length == 0) {
        product.quantity = 1;
        cartContents.push(product);
      } else {
        cartContents.find(entry => entry.id === product.id).quantity++;
      }
    }

    const increment = (id) => {
      cartContents.find(entry => entry.id === id).quantity++;
    }

    const decrement = (id) => {
      if (cartContents.find(entry => entry.id === id).quantity == 1) {
        remove(id);
      } else {
        cartContents.find(entry => entry.id === id).quantity--;
      }
    }

    const remove = (id) => {
      const index = cartContents.findIndex(entry => entry.id === id);
      cartContents.splice(index, 1);
    }

    const checkout = async (clientAddress) => {
      loading.value = true;
      try {
        const clientKey = 'KXj1DmMm6caFY1ioIyBIy6Ovs1tCjFuj8yEXZgysSCk=';
        const sellerPublicKey = 'sm0/a19e0Ojgh05dXX7nwL7QiGJ02HiKgZQGiLvW70w=';
        const clientPublicKey = 'sm0/a19e0Ojgh05dXX7nwL7QiGJ02HiKgZQGiLvW70w=';
        const clientSecretKey = 'z6bXpb5tnHlTc/B9N53ig455/o0lX3eienBkcHbNLeM=';

        const sellerAddress = "0x59Ce492d182688239C118AcFEb1A4872Ce3B1231";

        const orderInfo = {
          cart: [...cartContents],
          deliveryAddress: clientAddress,
        };

        const encrypted = await encryptOrderInfo(sellerPublicKey, clientPublicKey, clientSecretKey, clientKey, orderInfo);
        const path = await uploadDeliveryInfo(encrypted);
        const total = orderInfo.cart.reduce((a, b) => a + (b.quantity * b.price), 0);
        const amount = ethers.utils.parseEther(total.toString());
        if (await approveTransaction(amount)) {
          if (await placeOrder(sellerAddress, path, amount)) {
            cartContents.splice(0);
            address.street = address.houseNumber = address.houseAddition = address.zipCode = undefined;
          }
        }
      } finally {
        loading.value = false;
      }
    }

    return {
      cartContents,
      addToCart,
      increment,
      decrement,
      remove,
      checkout,
      address,
      loading
    }
  },

  components: {
    ProductList,
    ShoppingCart,
    Checkout
  }
}
</script>