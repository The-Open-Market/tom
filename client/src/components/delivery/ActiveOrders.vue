<template>
  <AddressValidator class="mb-8"/>
  <div v-if="orders.length === 0">
    <p class="italic text-lg text-gray-700 font-semibold">No active orders at the moment.</p>
  </div>
  <Grid v-else>
    <OrderCard v-for="order in orders" :key="order.id" :order="order" :loading="order.loading">
      <template v-slot:contents>
        <OrderInfo :order="order" pov="delivery"/>
      </template>
      <template v-slot:controls
                v-if="OrderStatus.Accepted.value <= order.status.value 
                   && order.status.value < OrderStatus.InTransit.value
                   && order.status.value !== OrderStatus.PickedUp.value">
        <Button text="Pick up" class="blue" @click="pickup(order.id)" :disabled="order.loading"/>
      </template>
      <template v-slot:controls 
                v-else-if="OrderStatus.InTransit.value <= order.status.value 
                        && order.status.value < OrderStatus.Completed.value
                        && order.status.value !== OrderStatus.Delivered.value">
        <Button text="Deliver" class="blue" @click="deliver(order.id)" :disabled="order.loading"/>
      </template>
    </OrderCard>
  </Grid>
</template>

<script>
import Grid from '@/components/shared/Grid.vue';
import OrderCard from '@/components/shared/OrderCard.vue';
import OrderInfo from '@/components/shared/OrderInfo.vue';
import Button from '@/components/shared/Button.vue';
import AddressValidator from '@/components/delivery/AddressValidator.vue';

import { pickupOrder, deliverOrder } from '@/endpoints/deliveryService';
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
    const pickup = async(orderId) => { 
      const index = props.orders.findIndex(order => order.id === orderId);
      props.orders[index].loading = true;
      try {
        const success = await pickupOrder(orderId);
        if (!success) toast.error(`Error picking up order #${orderId}`);
      }
      finally {
        props.orders[index].loading = false;
      }
    };

    const deliver = async(orderId) => {
      const index = props.orders.findIndex(order => order.id === orderId);
      props.orders[index].loading = true;
      try {
        const success = await deliverOrder(orderId);
        if (!success) toast.error(`Error delivering order #${orderId}`);
      } finally {
        props.orders[index].loading = false;
      }
    };

    return {
      pickup,
      deliver,
      OrderStatus
    }
  },

  components: {
    Grid,
    OrderCard,
    OrderInfo,
    Button,
    AddressValidator
  }
}
</script>