<template>
    <div class="bg-white">
      <div class="max-w-2xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8">
        <ProductList @addToCart="addToCart"/>
        <ShoppingCart :cartContents="this.cartContents" @increment="increment" @decrement="decrement" @remove="remove"/>
      </div>
    </div>
</template>

<script>
import ProductList from '../components/ProductList.vue'
import ShoppingCart from '../components/ShoppingCart.vue'

export default {
  components: {
    ProductList,
    ShoppingCart
  },
  methods: {
    addToCart (product) {
      if (this.cartContents.filter(entry => entry.id == product.id).length == 0) {
        product['quantity'] = 1
        this.cartContents.push(product)
      } else {
        this.cartContents.find(entry => entry.id == product.id)['quantity']++
      }
      console.log(this.cartContents)
    },
    increment (id) {
      this.cartContents.find(entry => entry.id == id)['quantity']++
    },
    decrement (id) {
      if (this.cartContents.find(entry => entry.id == id)['quantity'] == 1) {
        this.cartContents = this.cartContents.filter(entry => entry.id != id)
      } else {
        this.cartContents.find(entry => entry.id == id)['quantity']--
      }
    },
    remove (id) {
      this.cartContents = this.cartContents.filter(entry => entry.id != id)
    }
  },
  data () {
    return {
      cartContents: []
    }
  }
}
</script>

<style>

</style>
