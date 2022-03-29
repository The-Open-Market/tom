<template>
  <OrderContainer title="Pending" flow="row">
    <OrderCard v-for="order in orders.filter(order => order.status.value === OrderStatus.Pending.value)" :key="order.id" :order="order" :loading="order.loading">
      <template v-slot:contents>
        <OrderInfo :order="order" pov="seller" />
      </template>
      <template v-slot:controls>
        <Button text="Reject" class="red" @click="reject(order.id)" :disabled="order.loading"/>
        <div class="flex flex-wrap justify-end gap-1 items-center">
          <MoneyInput title="Collateral" class="small" v-model="order.collateral"/>
          <MoneyInput title="Delivery fee" class="small" v-model="order.deliveryFee"/>
          <Button text="Approve" class="green" @click="approve(order.id)" :disabled="order.loading || order.deliveryFee <= 0"/>
        </div>
      </template>
    </OrderCard>
  </OrderContainer>

  <OrderContainer title="Approved" flow="row" class="mt-12">
    <OrderCard v-for="order in orders.filter(order => order.status.value === OrderStatus.Approved.value)" :key="order.id" :order="order" :loading="order.loading">
      <template v-slot:contents>
        <OrderInfo :order="order" pov="seller" />
      </template>
    </OrderCard>
  </OrderContainer>

  <OrderGrid :nrColumns="3" class="mt-12">
    <OrderContainer title="Accepted">
      <OrderCard v-for="order in orders.filter(order => order.status.value === OrderStatus.Accepted.value)" :key="order.id" :order="order" :loading="order.loading">
        <template v-slot:contents>
          <OrderInfo :order="order" pov="seller" />
        </template>
        <template v-slot:controls>
          <Button text="Transfer" class="blue" @click="transfer(order.id)" :disabled="order.loading"/>
        </template>
      </OrderCard>
    </OrderContainer>
    <OrderContainer title="In transit">
      <OrderCard v-for="order in orders.filter(order => OrderStatus.PickedUp.value <= order.status.value && order.status.value <= OrderStatus.InTransit.value)" :key="order.id" :order="order" :loading="order.loading">
        <template v-slot:contents>
          <OrderInfo :order="order" pov="seller" />
        </template>
        <template v-slot:controls v-if="order.status.value === OrderStatus.PickedUp.value">
          <Button text="Transfer" class="blue" @click="transfer(order.id)" :disabled="order.loading"/>
        </template>
      </OrderCard>
    </OrderContainer>
    <OrderContainer title="Completed">
      <OrderCard v-for="order in orders.filter(order => OrderStatus.Received.value <= order.status.value && order.status.value <= OrderStatus.Completed.value)" :key="order.id" :order="order" :loading="order.loading">
        <template v-slot:contents>
          <OrderInfo :order="order" pov="seller" />
        </template>
      </OrderCard>
    </OrderContainer>
  </OrderGrid>

  <OrderContainer title="Rejected and cancelled" flow="row" class="mt-12">
    <OrderCard v-for="order in orders.filter(order => order.status.value === OrderStatus.Rejected.value || order.status.value === OrderStatus.Cancelled.value)" :key="order.id" :order="order" :loading="order.loading">
      <template v-slot:contents>
          <OrderInfo :order="order" pov="seller" />
      </template>
    </OrderCard>
  </OrderContainer>
</template>

<script>
import OrderCard from '@/components/shared/OrderCard.vue';
import Button from '@/components/shared/Button.vue';
import Input from '@/components/shared/Input.vue';
import MoneyInput from '@/components/shared/MoneyInput.vue';
import OrderGrid from '@/components/shared/OrderGrid.vue';
import OrderContainer from '@/components/shared/OrderContainer.vue';
import OrderInfo from '@/components/shared/OrderInfo.vue';

import { inject, ref, reactive, onMounted } from "vue";

import { getSmartContract, getSignerAddress } from '@/services/ethereum';

import { getOrdersBySeller, approveOrder, rejectOrder, transferOrder } from '@/endpoints/seller';

import { OrderStatus, OrderStatusMap, orderFromData } from '@/utils/order';
import { sellerData } from '@/utils/constants';

export default {
  name: 'Seller',

  setup() {
    // HARDCODE SELLER ZIP FOR NOW
    const sellerZip = '1234AB';
    
    const orders = reactive([]);
    const collateralPercentage = .5;
    let address = ref("");
    const toast = inject('$toast');

    const approve = async (orderId) => {
      const index = orders.findIndex(order => order.id === orderId);
      orders[index].loading = true;
      try {
        const success = await approveOrder(orderId, orders[index].deliveryFee, orders[index].collateral, orders[index].destinationZipCode, sellerZip);
        if (!success) toast.error(`Error approving order #${orderId}`);
      } finally {
        orders[index].loading = false;
      }
    }

    const reject = async (orderId) => {
      const index = orders.findIndex(order => order.id === orderId);
      orders[index].loading = true;
      try {
        const success = await rejectOrder(orderId);
        if (!success) toast.error(`Error rejecting order #${orderId}`);
      } finally {
        orders[index].loading = false;
      }
    }

    const transfer = async (orderId) => {
      const index = orders.findIndex(order => order.id === orderId);
      orders[index].loading = true;
      try {
        const success = await transferOrder(orderId);
        if (!success) toast.error(`Error transferring order #${orderId}`);
      } finally {
        orders[index].loading = false;
      }
    }

    const onOrderStatusChanged = async (id, amount, deliveryFee, collateral, status, client, seller, deliveryService, orderContentsUrl, originZipCode, destinationZipCode) => {
      const orderId = parseInt(id._hex, 16);
      const data = {id, amount, deliveryFee, collateral, status, client, seller, deliveryService, orderContentsUrl, originZipCode, destinationZipCode};

      if (orders.every(order => order.id !== orderId)) {
        const order = await orderFromData(data, 'seller', sellerData.keys.private);
        orders.push(order);
        toast.info(`Order #${orderId} is now ${OrderStatusMap[status].name.toLowerCase()}`);
        return;
      }

      const index = orders.findIndex(order => order.id === orderId);
      
      if (orders[index].status.value < OrderStatusMap[status].value) {
        const order = await orderFromData(data, 'seller', sellerData.keys.private);
        orders[index] = order;
        toast.info(`Order #${orderId} is now ${OrderStatusMap[status].name.toLowerCase()}`);
      }
    }

    const onAccountChanged = async () => {
      orders.splice(0);

      address.value = await getSignerAddress();
      const myOrders = await getOrdersBySeller(address.value, sellerData.keys.private);
      orders.push(...myOrders);

      const { tnoEats } = await getSmartContract();

      tnoEats.removeAllListeners();

      const filteredEventListener = tnoEats.filters.OrderStatusChanged(null, null, null, null, null, null, address.value, null, null, null, null);
      tnoEats.on(filteredEventListener, onOrderStatusChanged);
    }

    onMounted(onAccountChanged);

    window.ethereum.on('accountsChanged', async (accounts) => {
      await onAccountChanged();
    });

    return {
      orders,
      approve,
      reject,
      transfer,
      OrderStatus
    }
  },

  components: {
    OrderGrid,
    OrderContainer,
    OrderCard,
    Button,
    Input,
    OrderInfo,
    MoneyInput,
  },
}
</script>
<style>
</style>
