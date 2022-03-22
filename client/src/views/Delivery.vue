<template>
  <AddressValidator/>
  <OrderGrid :nrColumns="3" class="mt-12">
    <OrderContainer title="Accepted">
      <OrderCard v-for="order in orders.filter(order => order.status.value === OrderStatus.Accepted.value)" :key="order.id" :order="order" :loading="order.loading">
        <template v-slot:contents>
          <OrderInfo :order="order" pov="delivery"/>
        </template>
        <template v-slot:controls>
          <Button text="Pick Up" class="blue" @click="pickup(order.id)" :disabled="order.loading"/>
        </template>
      </OrderCard>
    </OrderContainer>
    <OrderContainer title="In transit">
      <OrderCard v-for="order in orders.filter(order => OrderStatus.PickedUp.value <= order.status.value && order.status.value <= OrderStatus.InTransit.value)" :key="order.id" :order="order" :loading="order.loading">
        <template v-slot:contents>
          <OrderInfo :order="order" pov="delivery"/>
        </template>
        <template v-slot:controls v-if="order.status.value === OrderStatus.Transferred.value">
          <Button text="PickUp" class="blue" @click="pickup(order.id)" :disabled="order.loading"/>
        </template>
        <template v-slot:controls v-else-if="order.status.value === OrderStatus.InTransit.value">
          <Button text="Deliver" class="blue" @click="deliver(order.id)" :disabled="order.loading"/>
        </template>
      </OrderCard>
    </OrderContainer>
    <OrderContainer title="Completed">
      <OrderCard v-for="order in orders.filter(order => OrderStatus.Received.value <= order.status.value && order.status.value <= OrderStatus.Completed.value)" :key="order.id" :order="order" :loading="order.loading">
        <template v-slot:contents>
          <OrderInfo :order="order" pov="delivery"/>
        </template>
        <template v-slot:controls v-if="order.status.value === OrderStatus.Received.value">
          <Button text="Deliver" class="blue" @click="deliver(order.id)" :disabled="order.loading"/>
        </template>
      </OrderCard>
    </OrderContainer>
  </OrderGrid>

  <OrderContainer title="Approved" flow="row" class="mt-12">
    <OrderCard v-for="order in orders.filter(order => order.status.value === OrderStatus.Approved.value )" :key="order.id" :order="order" :loading="order.loading">
      <template v-slot:contents>
        <OrderInfo :order="order" pov="delivery"/>
      </template>
      <template v-slot:controls>
        <Button text="Accept" class="green" @click="accept(order.id)" :disabled="order.loading"/>
      </template>
    </OrderCard>
  </OrderContainer>
</template>

<script>
import OrderCard from '@/components/shared/OrderCard.vue';
import Button from '@/components/shared/Button.vue';
import OrderGrid from '@/components/shared/OrderGrid.vue';
import OrderContainer from '@/components/shared/OrderContainer.vue';
import AddressValidator from '@/components/deliveryService/AddressValidator.vue';
import OrderInfo from '@/components/shared/OrderInfo.vue';

import { inject, ref, reactive, onMounted } from 'vue';

import { getSmartContract, getSignerAddress } from '@/services/ethereum';

import { getOrdersByDeliveryService, getApprovedOrders, acceptOrder, pickupOrder, deliverOrder } from '@/endpoints/deliveryService';

import { OrderStatus, OrderStatusMap, orderFromData } from '@/utils/order';

export default {
  name: "Delivery",

  setup() {
    const orders = reactive([]);
    const address = ref("");
    const toast = inject('$toast');

    const accept = async(orderId) => {
      const index = orders.findIndex(order => order.id === orderId);
      orders[index].loading = true;
      try {
        if (await acceptOrder(orderId)) {
          toast.success(`Order #${orderId} successfully accepted`);
        } else {
          toast.error(`Error accepting order #${orderId}`);
        }
      } finally {
        orders[index].loading = false;
      }
    };

    const pickup = async(orderId) => { 
      const index = orders.findIndex(order => order.id === orderId);
      orders[index].loading = true;
      try {
        if (await pickupOrder(orderId)) {
          toast.success(`Order #${orderId} successfully picked up`);
        } else {
          toast.error(`Error picking up order #${orderId}`);
        }
      }
      finally {
        orders[index].loading = false;
      }
    };

    const deliver = async(orderId) => {
      const index = orders.findIndex(order => order.id === orderId);
      orders[index].loading = true;
      try {
        if (await deliverOrder(orderId)) {
          toast.success(`Order #${orderId} successfully delivered`);
        } else {
          toast.error(`Error delivering order #${orderId}`);
        }
      } finally {
        orders[index].loading = false;
      }
    };

    const onOrderStatusChanged = async (id, amount, deliveryFee, status, client, seller, deliveryService, orderContentsUrl, originZipCode, destinationZipCode) => {
      const orderId = parseInt(id._hex, 16);
      const data = {id, amount, deliveryFee, status, client, seller, deliveryService, orderContentsUrl, originZipCode, destinationZipCode};

      if (orders.every(order => order.id !== orderId)) {
        const order = await orderFromData(data, 'delivery');
        orders.push(order);
        toast.info(`Order #${orderId} is now ${OrderStatusMap[status].name.toLowerCase()}`);
        return;
      }

      const index = orders.findIndex(order => order.id === orderId);
      
      if (orders[index].status.value < OrderStatusMap[status].value) {
        const order = await orderFromData(data, 'delivery');
        orders[index] = order;
        toast.info(`Order #${orderId} is now ${OrderStatusMap[status].name.toLowerCase()}`);
      }
    }

    const onAccountChanged = async () => {
      orders.splice(0);

      address.value = await getSignerAddress();
      const myOrders = await getOrdersByDeliveryService(address.value);
      orders.push(...myOrders);

      const approvedOrders = await getApprovedOrders();
      orders.push(...approvedOrders);

      const { tnoEats } = await getSmartContract();

      tnoEats.removeAllListeners();

      const filteredEventListener = tnoEats.filters.OrderStatusChanged(null, null, null, null, null, null, address.value, null, null, null);
      tnoEats.on(filteredEventListener, onOrderStatusChanged);
    }

    onMounted(onAccountChanged);

    window.ethereum.on('accountsChanged', async (accounts) => {
      await onAccountChanged();
    });

    return {
      orders,
      accept,
      pickup,
      deliver,
      OrderStatus
    }
  },

  components: {
    OrderGrid,
    OrderContainer,
    OrderCard,
    Button,
    AddressValidator,
    OrderInfo
  }
}
</script>
