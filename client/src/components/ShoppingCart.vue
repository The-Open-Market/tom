<template>
    <div class="container mx-auto mt-10">
    <div class="flex shadow-md my-10">
      <div class="w-3/4 bg-white px-10 py-10">
        <div class="flex justify-between border-b pb-8">
          <h1 class="font-semibold text-2xl">Shopping Cart</h1>
          <h2 class="font-semibold text-2xl">{{ cartContents.map(x => x.quantity).reduce((prev, current) => prev + current, 0) }} Items</h2>
        </div>
        <div class="flex mt-10 mb-5">
          <h3 class="font-semibold text-gray-600 text-xs uppercase w-2/5">Product Details</h3>
          <h3 class="font-semibold text-center text-gray-600 text-xs uppercase w-1/5 text-center">Quantity</h3>
          <h3 class="font-semibold text-center text-gray-600 text-xs uppercase w-1/5 text-center">Price</h3>
          <h3 class="font-semibold text-center text-gray-600 text-xs uppercase w-1/5 text-center">Total</h3>
        </div>
        <div v-if="cartContents && cartContents.length > 0">
            <div v-for="entry in cartContents" :key="entry.id" class="flex items-center hover:bg-gray-100 -mx-8 px-6 py-5">
            <div class="flex w-2/5"> <!-- product -->
                <div    >
                    <img class="h-24" :src="entry.img" alt="">
                </div>
                <div class="flex flex-col justify-between ml-4 flex-grow">
                <span class="font-bold text-sm">{{ entry.name }}</span>
                <a href="#" class="font-semibold hover:text-red-500 text-gray-500 text-xs">Remove</a>
                </div>
            </div>
            <div class="flex justify-center w-1/5">
                <svg @click="decrement(entry.id)" class="fill-current text-gray-600 w-3" viewBox="0 0 448 512"><path d="M416 208H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h384c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"/>
                </svg>

                <input class="mx-2 border text-center w-8" type="text" :value="entry.quantity">

                <svg @click="increment(entry.id)" class="fill-current text-gray-600 w-3" viewBox="0 0 448 512">
                <path d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z"/>
                </svg>
            </div>
            <span class="text-center w-1/5 font-semibold text-sm">€ {{ (Math.round(entry.price * 100) / 100).toFixed(2) }}</span>
            <span class="text-center w-1/5 font-semibold text-sm">€ {{ (Math.round(entry.price * 100 * entry.quantity) / 100).toFixed(2) }}</span>
            </div>
        </div>

      </div>

      <div id="summary" class="w-1/4 px-8 py-10">
        <h1 class="font-semibold text-2xl border-b pb-8">Checkout</h1>
        <div class="flex justify-between mt-10 mb-5">
          <span class="font-semibold text-sm uppercase">Items {{ cartContents.map(x => x.quantity).reduce((prev, current) => prev + current, 0) }}</span>
          <span class="font-semibold text-sm">€ {{ (Math.round(cartContents.map(x => x.quantity * x.price).reduce((prev, current) => prev + current, 0) * 100) / 100).toFixed(2) }}</span>
        </div>
        <div class="mt-4">
        <label class="mb-4 block text-sm text-gray-600" for="cus_email">Address</label>
        <input class="w-full px-2 py-2 text-gray-700 bg-gray-200 rounded" id="cus_email" name="cus_email" type="text" required="" placeholder="Street" aria-label="Email">
        </div>
        <div class="mt-4">
        <label class="hidden text-sm block text-gray-600" for="cus_email">City</label>
        <input class="w-full px-2 py-2 text-gray-700 bg-gray-200 rounded" id="cus_email" name="cus_email" type="text" required="" placeholder="City" aria-label="Email">
        </div>
        <div class="inline-block mt-4 w-1/2 pr-1">
        <label class="hidden block text-sm text-gray-600" for="cus_email">Country</label>
        <input class="w-full px-2 py-2 text-gray-700 bg-gray-200 rounded" id="cus_email" name="cus_email" type="text" required="" placeholder="Country" aria-label="Email">
        </div>
        <div class="inline-block mt-4 -mx-1 pl-1 w-1/2">
        <label class="hidden block text-sm text-gray-600" for="cus_email">Zip</label>
        <input class="w-full px-2 py-2 text-gray-700 bg-gray-200 rounded" id="cus_email"  name="cus_email" type="text" required="" placeholder="Zip" aria-label="Email">
        </div>
        <div class="border-t mt-8">
          <div class="flex font-semibold justify-between py-6 text-sm uppercase">
            <span>Total cost</span>
            <span>€ {{ (Math.round(cartContents.map(x => x.quantity * x.price).reduce((prev, current) => prev + current, 0) * 100) / 100).toFixed(2) }}</span>
          </div>
          <button class="bg-indigo-500 font-semibold hover:bg-indigo-600 py-3 text-sm text-white uppercase w-full">Place order</button>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  props: ['cartContents'],
  methods: {
    increment (id) {
      this.$emit('increment', id)
    },
    decrement (id) {
      this.$emit('decrement', id)
    },
  }
}
</script>
