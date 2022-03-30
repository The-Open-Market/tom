<template>
  <div v-if="orders.length === 0">
    <p class="italic text-lg text-gray-700 font-semibold">History is empty.</p>
  </div>
  <Grid v-else>
    <OrderCard v-for="order in orders" :key="order.id" :order="order" :loading="order.loading">
      <template v-slot:contents>
        <OrderInfo :order="order" pov="seller" />
      </template>
    </OrderCard>
  </Grid>
</template>

<script>
import Grid from '@/components/shared/Grid.vue';
import OrderCard from '@/components/shared/OrderCard.vue';
import OrderInfo from '@/components/shared/OrderInfo.vue';

export default {
  name: "OrderHistory",
  
  props: {
    orders: {
      type: Array,
      required: true
    }
  },

  components: {
    Grid,
    OrderCard,
    OrderInfo
  }
}
</script>