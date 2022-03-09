<template>
    <div class="bg-white">
      <div class="max-w-2xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
        <ProductList @addToCart="addToCart"/>
        <ShoppingCart :cartContents="this.cartContents" @increment="increment" @decrement="decrement" @remove="remove" @checkout="checkout"/>
      </div>
    </div>
</template>

<script>
import { reactive } from "vue";
import { getOrdersByClient } from '../services/smartContract';
import { placeOrder } from '../services/client';
import { encryptOrderInfo } from "../services/crypto";
import { uploadDeliveryInfo } from "../services/ipfs";

import ProductList from '../components/ProductList.vue'
import ShoppingCart from '../components/ShoppingCart.vue'

export default {
  name: "Client",

  setup() {

    let cartContents = reactive([]);

    const addToCart = (product) => {
      if (cartContents.filter(entry => entry.id == product.id).length == 0) {
        product['quantity'] = 1
        cartContents.push(product)
      } else {
        cartContents.find(entry => entry.id == product.id)['quantity']++
      }
      console.log(cartContents)
    }

    const increment = (id) => {
      cartContents.find(entry => entry.id == id)['quantity']++
    }

    const decrement = (id) => {
      if (cartContents.find(entry => entry.id == id)['quantity'] == 1) {
        cartContents = cartContents.filter(entry => entry.id != id)
      } else {
        cartContents.find(entry => entry.id == id)['quantity']--
      }
    }

    const remove = (id) => {
      cartContents = cartContents.filter(entry => entry.id != id)
    }

    const checkout = async (clientAddress) => {
      // TODO: PKI
      const sellerPublicKey = 'sm0/a19e0Ojgh05dXX7nwL7QiGJ02HiKgZQGiLvW70w=';
      const clientPublicKey = 'sm0/a19e0Ojgh05dXX7nwL7QiGJ02HiKgZQGiLvW70w=';
      const clientSecretKey = 'z6bXpb5tnHlTc/B9N53ig455/o0lX3eienBkcHbNLeM=';

      // TODO: Get seller addresses automatically
      const sellerAddress = "0x59Ce492d182688239C118AcFEb1A4872Ce3B1231";

      // TODO: Add all necessary information to be encrypted
      const orderInfo = { cartContents, clientAddress };
      const encrypted = await encryptOrderInfo(sellerPublicKey, clientPublicKey, clientSecretKey, orderInfo);
      const path = await uploadDeliveryInfo(encrypted);
      await placeOrder(sellerAddress, path);
    }

    return {
      cartContents,
      addToCart,
      increment,
      decrement,
      remove,
      checkout
    }
  },

  async mounted() {
    const address = "0x3096cc43379D09d411A6f979E00e29f057929579";
    const orders = await getOrdersByClient(address);

    console.log(orders);
  },

  components: {
    ProductList,
    ShoppingCart
  },
}
</script>

<style>

</style>
