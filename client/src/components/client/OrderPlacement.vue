<template>
  <div class="flex justify-between mb-6">
    <h1 class="font-bold text-gray-700">{{ seller.name }}</h1>
    <Button text="❮ Back to sellers" class="red transparent" @click="back"/>
  </div>
  <ProductList @addToCart="addToCart"/>
  <ShoppingCart :cartContents="cartContents" @increment="increment" @decrement="decrement" @remove="remove"/>
  <Checkout :cartContents="cartContents" :address="deliveryAddress" :loading="loading" @checkout="checkout"/>
</template>

<script>
import Button from '@/components/shared/Button.vue';
import ProductList from '@/components/client/ProductList.vue';
import ShoppingCart from '@/components/client/ShoppingCart.vue';
import Checkout from '@/components/client/Checkout.vue';

import { ref, reactive, inject } from "vue";

import { getSignerAddress } from '@/services/ethereum';

import { approveTransaction, checkAllowance } from '@/endpoints/euroToken';
import { placeOrder } from '@/endpoints/client';
import { uploadDeliveryInfo } from '@/endpoints/ipfs';

import { encryptOrderInfo } from '@/utils/crypto';
import { getCurrentKeysAsync } from '@/storage/keys';

export default {
  name: "OrderPlacement",

  emits: ["back"],

  props: {
    seller: {
      type: Object,
      required: true
    }
  },

  setup(props, context) {
    const toast = inject('$toast');

    const cartContents = reactive([]);
    const deliveryAddress = reactive({
      street: undefined,
      houseNumber: undefined,
      houseAddition: undefined,
      zipCode: undefined
    });
    const loading = ref(false);

    const back = () => {
      context.emit("back");
    }

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

        const userKeys = await getCurrentKeysAsync();

        const encrypted = await encryptOrderInfo(props.seller.keys.public, userKeys.public, userKeys.private, userKeys.symmetric, orderInfo);
        const path = await uploadDeliveryInfo(encrypted);
        const total = orderInfo.cart.reduce((a, b) => a + (b.quantity * b.price), 0);
        
        const allowance = await checkAllowance(await getSignerAddress())
        if (allowance < total) {
          if (!await approveTransaction(total)) {
            toast.error('Error approving euro transaction');
            return;
          }
        }

        if (!await placeOrder(props.seller.etherAddress, path, total)) {
          toast.error('Failed to place the order');
          return;
        }

        cartContents.splice(0);
        deliveryAddress.street = deliveryAddress.houseNumber = deliveryAddress.houseAddition = deliveryAddress.zipCode = undefined;
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
      deliveryAddress,
      loading,
      back
    }
  },

  components: {
    ProductList,
    ShoppingCart,
    Checkout,
    Button
  }
}
</script>