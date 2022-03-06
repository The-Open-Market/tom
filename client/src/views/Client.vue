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
import { placeOrder } from '../services/client';

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
      // TODO: Get seller addresses automatically
      const sellerAddress = "0x59Ce492d182688239C118AcFEb1A4872Ce3B1231";
      console.log(clientAddress);
      console.log(cartContents);
      await placeOrder(sellerAddress, "this is a link wannabe");
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

  components: {
    ProductList,
    ShoppingCart
  },
}
</script>

<style>

</style>
