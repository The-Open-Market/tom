<template>
  <div class="bg-white">
    <div class="max-w-2xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
      <button @click="createOrder" class="bg-indigo-500 font-semibold hover:bg-indigo-600 py-3 text-sm text-white uppercase w-full">PlaceOrder</button>
    </div>
  </div>
</template>

<script>
import { placeOrder } from '../services/client';

export default {
  name: "Test",

  methods: {
    async createOrder() {
      await placeOrder("0x9777474265fa526d7C2271B72c9c81275e44D99d", "this is a link wannabe")
    }
  }
}
</script>