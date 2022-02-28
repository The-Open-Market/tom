<template>
  
    <h2 class="sr-only">Products</h2>

    <div class="grid grid-cols-1 gap-y-10 sm:grid-cols-2 gap-x-6 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
      <a v-for="product in products" :key="product.id" href="#" class="group">
        <div class="w-full aspect-w-1 aspect-h-1 bg-gray-200 rounded-lg overflow-hidden xl:aspect-w-7 xl:aspect-h-8">
          <img :src="product.img" alt="Tall slender porcelain bottle with natural clay textured body and cork stopper." class="w-full h-full object-center object-cover group-hover:opacity-75">
        </div>
        <div class="flex flex-col md:flex-row justify-between items-center text-gray-900">
            <div>
                <h3 class="mt-4 text-sm text-gray-700">{{ product.name }}</h3>
                <p class="mt-1 text-lg font-medium text-gray-900">€ {{ (Math.round(product.price * 100) / 100).toFixed(2) }}</p>
            </div>
            <button class="px-6 py-2 mt-3 transition ease-in duration-200 
            uppercase rounded-full hover:bg-gray-800 hover:text-white border-2 
            border-gray-900 focus:outline-none"
            @click="addToCart(product)">
                + Add to cart
            </button>
        </div>
      </a>

    </div>
</template>

<script>
export default {
  data () {
    return {
      products: [
        {
          id: 'cc919e21-ae5b-5e1f-d023-c40ee669520c',
          name: 'TNO pizza',
          img: 'https://images0.persgroep.net/rcs/5XA03cGALr-SKZ0BlzVGmD6vMo8/diocontent/114943802/_fitwidth/694/?appId=21791a8992982cd8da851550a453bd7f&quality=0.8',
          price: 10
        },
        {
          id: 'cc919e21-ae5b-5e1f-d023-c4ach669520c',
          name: 'TNO burger',
          img: 'https://assets.biggreenegg.eu/app/uploads/2019/03/28145521/topimage-classic-hamburger-2019m04-800x534.jpg',
          price: 7.50
        },
      ]
    }
  },
  methods: {
    addToCart (product) {
      this.$emit('addToCart', product)
    }
  }
}
</script>
