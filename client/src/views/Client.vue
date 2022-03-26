<template>
  <OrderContainer title="My orders" flow="row">
    <OrderCard v-for="order in orders" :key="order.id" :order="order" :loading="order.loading">
      <template v-slot:contents>
        <OrderInfo :order="order" pov="client" />
      </template>
      <template v-slot:controls v-if="order.status.value === OrderStatus.Pending.value">
        <Button text="Cancel" class="red" @click="cancel(order.id)" :disabled="order.loading"/>
      </template>
      <template v-slot:controls v-if="order.status.value === OrderStatus.InTransit.value || order.status.value === OrderStatus.Delivered.value">
        <Button text="Receive" class="blue" @click="receive(order.id)" :disabled="order.loading"/>
      </template>
      <template v-slot:controls v-if="order.status.value === OrderStatus.Completed.value">
        <MoneyInput id="tip" title="Tip" class="small" v-model="order.tip" />
        <Button text="Tip" class="blue" @click="tip(order.id)" :disabled="order.loading"/>
      </template>
    </OrderCard>
  </OrderContainer>

  <OrderPlacement class="mt-24"/>
</template>

<script>
import OrderPlacement from '@/components/client/OrderPlacement.vue'
import OrderCard from '@/components/shared/OrderCard.vue';
import Button from '@/components/shared/Button.vue';
import MoneyInput from '@/components/shared/MoneyInput.vue';
import OrderContainer from '@/components/shared/OrderContainer.vue';
import OrderInfo from '@/components/shared/OrderInfo.vue';

import { ref, reactive, onMounted, inject } from "vue";

import { getSmartContract, getSignerAddress } from '@/services/ethereum';

import { getOrdersByClient, cancelOrder, receiveOrder, sendTip } from '@/endpoints/client';

import { OrderStatus, OrderStatusMap, orderFromData } from '@/utils/order';
import { clientData } from '@/utils/constants';


export default {
  name: "Client",

  setup() {
    const orders = reactive([]);
    const address = ref("");
    const toast = inject('$toast');

    const cancel = async (orderId) => {
      const index = orders.findIndex(order => order.id === orderId);
      orders[index].loading = true;
      try {
        if (!await cancelOrder(orderId)) {
          toast.error(`Error cancelling order #${orderId}`)
        }
      } finally {
        orders[index].loading = false;
      }
    }

    const receive = async (orderId) => {
      const index = orders.findIndex(order => order.id === orderId);
      orders[index].loading = true;
      try {
        if (!await receiveOrder(orderId)) {
          toast.error(`Error receiving order #${orderId}`);
        }        
      } finally {
        orders[index].loading = false;
      }
    }

    const tip = async (orderId) => {
      const index = orders.findIndex(order => order.id === orderId);
      orders[index].loading = true;
      try {
        if (!await sendTip(orders[index].deliveryService, orders[index].tip)) {
          toast.error(`Error tipping the delivery service for #${orderId}`);
        }
      } finally {
        orders[index].loading = false; 
      }
    }

    const onOrderStatusChanged = async (id, amount, deliveryFee, collateral, status, client, seller, deliveryService, orderContentsUrl, originZipCode, destinationZipCode) => {
      const orderId = parseInt(id._hex, 16);
      const data = {id, amount, deliveryFee, collateral, status, client, seller, deliveryService, orderContentsUrl, originZipCode, destinationZipCode};

      if (orders.every(order => order.id !== orderId)) {
        const order = await orderFromData(data, 'client', clientData.keys.symmetric);
        orders.push(order);
        toast.info(`Order #${orderId} is now ${OrderStatusMap[status].name.toLowerCase()}`);
        return;
      }

      const index = orders.findIndex(order => order.id === orderId);
      
      if (orders[index].status.value < OrderStatusMap[status].value) {
        const order = await orderFromData(data, 'client', clientData.keys.symmetric);
        orders[index] = order;
        toast.info(`Order #${orderId} is now ${OrderStatusMap[status].name.toLowerCase()}`);
      }
    }

    const onAccountChanged = async () => {
      orders.splice(0);

      address.value = await getSignerAddress();
      const myOrders = await getOrdersByClient(address.value, clientData.keys.symmetric);
      orders.push(...myOrders);

      const { tnoEats } = await getSmartContract();

      tnoEats.removeAllListeners();

      const filteredEventListener = tnoEats.filters.OrderStatusChanged(null, null, null, null, null, address.value, null, null, null, null, null);
      tnoEats.on(filteredEventListener, onOrderStatusChanged);
    };

    onMounted(onAccountChanged);

    window.ethereum.on('accountsChanged', async (accounts) => {
      await onAccountChanged();
    });

    return {
      orders,
      cancel,
      receive,
      tip,
      OrderStatus
    }
  },

  components: {
    OrderPlacement,
    OrderContainer,
    OrderCard,
    Button,
    OrderInfo,
    MoneyInput,
  },
}
</script>

<style>

</style>
