<template>
  <div v-if="sellers.length === 0">
    <p class="italic text-lg text-gray-700 font-semibold">
       No sellers available. 
       Go to the <router-link to="/dashboard" class="text-yellow-700 underline">Dashboard</router-link> and add one.
    </p>
  </div>
  <Grid v-else>
    <SellerCard v-for="seller in sellers" :key="seller.id" :model="seller" @click="select(seller)"/>
  </Grid>
</template>

<script>
import Grid from '@/components/shared/Grid.vue';
import SellerCard from '@/components/client/SellerCard.vue';

import { getSellers } from '@/storage/seller';

export default {
  name: "Sellers",

  emits: ["selected"],

  setup (_, context) {
    const sellers = getSellers();

    const select = (seller) => {
      context.emit("selected", seller);
    }

    return {
      sellers,
      select
    }
  },

  components: {
    Grid,
    SellerCard
  }
}
</script>