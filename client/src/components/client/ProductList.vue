<template>
  <Grid>
    <ProductCard v-for="product in products" :key="product.id" :product="product" @click="addToCart(product)"/>
  </Grid>
</template>

<script>
import Grid from '@/components/shared/Grid.vue';
import ProductCard from '@/components/client/ProductCard.vue';

export default {
  name: "ProductList",

  emits: ["addToCart"],

  setup(_, context) {
    const products = [
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
      ];

    const addToCart = (product) => {
      context.emit("addToCart", product);
    };

    return {
      products,
      addToCart
    };
  },

  components: {
    Grid,
    ProductCard
  }
}
</script>
