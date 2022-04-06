<template>
  <div v-if="orders.length === 0">
    <p class="italic text-lg text-gray-700 font-semibold">No orders yet. Hopefully someone places some soon!</p>
  </div>
  <Grid v-else>
    <OrderCard v-for="order in orders" :key="order.id" :order="order" :loading="order.loading">
      <template v-slot:contents>
        <OrderInfo :order="order" pov="seller" />
      </template>
      <template v-slot:controls>
        <Button text="Reject" class="red" @click="reject(order.id)" :disabled="order.loading"/>
        <div class="flex flex-wrap justify-end gap-1 items-center">
          <Input type="checkbox" title="Wait on ready" class="small" v-model="order.waitOnReady"/>
          <Input type="number" title="Collateral" class="small" v-model="order.collateral"/>
          <Input type="number" title="Delivery fee" class="small" v-model="order.deliveryFee"/>
          <Button text="Approve" class="green" @click="approve(order.id)" :disabled="order.loading || order.deliveryFee <= 0"/>
        </div>
      </template>
    </OrderCard>
  </Grid>
</template>

<script>
import Grid from '@/components/shared/Grid.vue';
import OrderCard from '@/components/shared/OrderCard.vue';
import OrderInfo from '@/components/shared/OrderInfo.vue';
import Input from '@/components/shared/Input.vue';
import Button from '@/components/shared/Button.vue';

import { inject } from "vue";
import { approveOrder, rejectOrder } from '@/endpoints/seller';
import { getSellers } from '@/storage/seller';

export default {
  name: "PendingOrders",

  props: {
    orders: {
      type: Array,
      required: true
    }
  },

  setup (props) {
    const toast = inject('$toast');

    const approve = async (orderId) => {
      const index = props.orders.findIndex(order => order.id === orderId);
      props.orders[index].loading = true;
      try {
        const seller = getSellers().filter(s => s.etherAddress === props.orders[index].seller).pop();
        const origin = seller.address.zipCode;
        const destination = props.orders[index].orderInformation.deliveryAddress.zip;
        const success = await approveOrder(orderId, props.orders[index].deliveryFee, props.orders[index].collateral, origin, destination, props.orders[index].waitOnReady);
        if (!success) toast.error(`Error approving order #${orderId}`);
      } finally {
        props.orders[index].loading = false;
      }
    }

    const reject = async (orderId) => {
      const index = props.orders.findIndex(order => order.id === orderId);
      props.orders[index].loading = true;
      try {
        const success = await rejectOrder(orderId);
        if (!success) toast.error(`Error rejecting order #${orderId}`);
      } finally {
        props.orders[index].loading = false;
      }
    }

    return {
      approve,
      reject
    }
  },

  components: {
    Grid,
    OrderCard,
    OrderInfo,
    Input,
    Button,
  }
}
</script>