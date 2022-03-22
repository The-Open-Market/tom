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

import { ref, reactive, inject } from "vue";

import { ethers } from 'ethers';

import { approveTransaction } from '@/endpoints/euroToken';
import { placeOrder } from '@/endpoints/client';
import { uploadDeliveryInfo } from '@/endpoints/ipfs';

import { encryptOrderInfo } from '@/utils/crypto';
import { sellerData, clientData } from '@/utils/constants'

export default {
  name: "OrderPlacement",

  setup() {
    const toast = inject('$toast');

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
        const orderInfo = {
          cart: [...cartContents],
          deliveryAddress: clientAddress,
        };

        const encrypted = await encryptOrderInfo(sellerData.keys.public, clientData.keys.public, clientData.keys.private, clientData.keys.symmetric, orderInfo);
        const path = await uploadDeliveryInfo(encrypted);
        const total = orderInfo.cart.reduce((a, b) => a + (b.quantity * b.price), 0);
        const amount = ethers.utils.parseEther(total.toString());
        
        let success = await approveTransaction(amount);
        if (success) {
          success = await placeOrder(sellerData.address, path, amount);
        }
        
        if (success) {
          cartContents.splice(0);
          address.street = address.houseNumber = address.houseAddition = address.zipCode = undefined;
        } else {
          toast.error('Failed to place the order');
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