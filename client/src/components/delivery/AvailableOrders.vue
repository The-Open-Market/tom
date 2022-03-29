<template>
  <div v-if="orders.length === 0">
    <p class="italic text-lg text-gray-700 font-semibold">No available orders for pick up. Hopefully the situation changes soon!</p>
  </div>
  <Grid v-else>
    <OrderCard v-for="order in orders" :key="order.id" :order="order" :loading="order.loading">
      <template v-slot:contents>
        <OrderInfo :order="order" pov="delivery"/>
      </template>
      <template v-slot:controls>
        <Button text="Accept" class="green" @click="accept(order.id)" :disabled="order.loading"/>
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
import { acceptOrder } from '@/endpoints/deliveryService';
import { approveTransaction, checkAllowance } from '@/endpoints/euroToken';

export default {
  name: "AvailableOrders",

  props: {
    orders: {
      type: Array,
      required: true
    },
    address: {
      type: String,
      required: true
    }
  },

  setup (props) {
    const toast = inject('$toast');

    const accept = async(orderId) => {
      const index = props.orders.findIndex(order => order.id === orderId);
      props.orders[index].loading = true;
      try {
        const allowance = await checkAllowance(props.address);
        if (allowance < props.orders[index].collateral) {
          if (!await approveTransaction(props.orders[index].collateral)) {
            toast.error(`Error approving euro transaction #${orderId}`);
            props.orders[index].loading = false;
            return;
          }
        }
        if (!await acceptOrder(orderId)) {
          toast.error(`Error accepting order #${orderId}`);
        }
      } finally {
        props.orders[index].loading = false;
      }
    };

    return {
      accept
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