<template>
  <div class="w-full bg-white py-10">
    <div class="flex justify-between border-b pb-8 mb-10">
      <h1 class="font-semibold text-2xl">Shopping Cart</h1>
      <h2 class="font-semibold text-2xl">{{ cartContents.map(x => x.quantity).reduce((prev, current) => prev + current, 0) }} Items</h2>
    </div>
    <div class="flex mb-5">
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
            <a href="#" @click="remove(entry.id)" class="font-semibold hover:text-red-500 text-gray-500 text-xs">Remove</a>
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
</template>

<script>
export default {
  name: "ShoppingCart",

  props: {
    cartContents: {
      type: Array,
      default: []
    }
  },

  emits: ["increment", "decrement", "remove"],

  setup(_, context) {
    const increment = (id) => {
      context.emit('increment', id)
    };

    const decrement = (id) => {
      context.emit('decrement', id);
    };

    const remove = (id) => {
      context.emit('remove', id);
    };

    return {
      increment,
      decrement,
      remove
    };
  }
}
</script>
