<template>
  <div v-if="orders.length === 0">
    <p class="italic text-lg text-gray-700 font-semibold">No active orders at the moment.</p>
  </div>
  <Grid v-else>
    <OrderCard v-for="order in orders" :key="order.id" :order="order" :loading="order.loading">
      <template v-slot:contents>
        <OrderInfo :order="order" pov="seller" />
      </template>
      <template v-slot:controls 
                v-if="OrderStatus.Accepted.value <= order.status.value 
                   && order.status.value < OrderStatus.InTransit.value
                   && order.status.value !== OrderStatus.Transferred.value">
        <Button text="Transfer" class="blue" @click="transfer(order.id)" :disabled="order.loading"/>
      </template>
    </OrderCard>
  </Grid>
</template>

<script>
import Grid from '@/components/shared/Grid.vue';
import OrderCard from '@/components/shared/OrderCard.vue';
import OrderInfo from '@/components/shared/OrderInfo.vue';
import Button from '@/components/shared/Button.vue';

import { inject } from "vue";
import { transferOrder } from '@/endpoints/seller';
import { OrderStatus } from '@/utils/order';

export default {
  name: "ActiveOrders",

  props: {
    orders: {
      type: Array,
      required: true
    }
  },

  setup (props) {
    const toast = inject('$toast');

    const transfer = async (orderId) => {
      const index = props.orders.findIndex(order => order.id === orderId);
      props.orders[index].loading = true;
      try {
        const success = await transferOrder(orderId);
        if (!success) toast.error(`Error transferring order #${orderId}`);
      } finally {
        props.orders[index].loading = false;
      }
    }
    
    return {
      transfer,
      OrderStatus
    }
  },

  components: {
    Grid,
    OrderCard,
    OrderInfo,
    Button,
  }
}
</script>