<template>
  <OrderContainer title="Pending" flow="row">
    <OrderCard v-for="order in orders.filter(order => order.status.value === OrderStatus.Pending.value)" :key="order.id" :order="order">
      <template v-slot:contents>
        <p>TODO: add contents from IPFS</p>
      </template>
      <template v-slot:controls>
        <Button text="Reject" styles="red" @click="reject(order.id)"/>
        <Button text="Approve" styles="green" @click="approve(order.id)"/>
      </template>
    </OrderCard>
  </OrderContainer>

  <OrderContainer title="Approved" flow="row" class="mt-12">
    <OrderCard v-for="order in orders.filter(order => order.status.value === OrderStatus.Approved.value)" :key="order.id" :order="order">
      <template v-slot:contents>
        <p>TODO: add contents from IPFS</p>
      </template>
    </OrderCard>
  </OrderContainer>

  <OrderGrid :nrColumns="3" class="mt-12">
    <OrderContainer title="Accepted">
      <OrderCard v-for="order in orders.filter(order => order.status.value === OrderStatus.Accepted.value)" :key="order.id" :order="order">
        <template v-slot:contents>
          <p>TODO: add contents from IPFS</p>
        </template>
        <template v-slot:controls>
          <Button text="Transfer" styles="blue" @click="transfer(order.id)"/>
        </template>
      </OrderCard>
    </OrderContainer>
    <OrderContainer title="In transit">
      <OrderCard v-for="order in orders.filter(order => OrderStatus.PickedUp.value <= order.status.value && order.status.value <= OrderStatus.InTransit.value)" :key="order.id" :order="order">
        <template v-slot:contents>
          <p>TODO: add contents from IPFS</p>
        </template>
        <template v-slot:controls v-if="order.status.value === OrderStatus.PickedUp.value">
          <Button text="Transfer" styles="blue" @click="transfer(order.id)"/>
        </template>
      </OrderCard>
    </OrderContainer>
    <OrderContainer title="Completed">
      <OrderCard v-for="order in orders.filter(order => OrderStatus.Received.value <= order.status.value && order.status.value <= OrderStatus.Completed.value)" :key="order.id" :order="order">
        <template v-slot:contents>
          <p>TODO: add contents from IPFS</p>
        </template>
      </OrderCard>
    </OrderContainer>
  </OrderGrid>

  <OrderContainer title="Rejected and cancelled" flow="row" class="mt-12">
    <OrderCard v-for="order in orders.filter(order => order.status.value === OrderStatus.Rejected.value || order.status.value === OrderStatus.Cancelled.value)" :key="order.id" :order="order">
      <template v-slot:contents>
        <p>TODO: add contents from IPFS</p>
      </template>
    </OrderCard>
  </OrderContainer>
</template>

<script>
import OrderCard from '@/components/shared/OrderCard.vue';
import Button from '@/components/shared/Button.vue';
import OrderGrid from '@/components/shared/OrderGrid.vue';
import OrderContainer from '@/components/shared/OrderContainer.vue';

import { reactive, onMounted } from "vue";
import { OrderStatus } from '@/services/order';
import { getOrdersBySeller } from '@/services/smartContract';
import { getSmartContract } from '@/services/ethereum';
import { approveOrder, rejectOrder, transferOrder } from '@/services/seller';

export default {
  name: 'Seller',

  setup() {
    const orders = reactive([]);

    const approve = async(orderId) => { 
      if (await approveOrder(orderId)) {
        const index = orders.findIndex(order => order.id === orderId);
        orders[index].status = OrderStatus.Approved;
      }
    }

    const reject = async(orderId) => {
      if (await rejectOrder(orderId)) {
        const index = orders.findIndex(order => order.id === orderId);
        orders[index].status = OrderStatus.Rejected;
      }
    }

    const transfer = async(orderId) => {
      if (await transferOrder(orderId)) {
        const index = orders.findIndex(order => order.id === orderId);
        orders[index].status = OrderStatus.Transferred;
      }
    }

    const onOrderPending = (id, client, seller, ipfsUrl) => {
      const orderId = parseInt(id._hex, 16);
      if (orders.every(order => order.id !== orderId)) {
        orders.push({
          id: orderId,
          status: OrderStatus.Pending,
          client,
          seller,
          ipfsUrl
        });
      }
    }

    const onOrderCancelled = (id, client, seller) => {
      const orderId = parseInt(id._hex, 16);
      const index = orders.findIndex(order => order.id === orderId);
      orders[index].status = OrderStatus.Cancelled;
    }

    const onOrderAccepted = (id, client, seller, deliveryService) => {
      const orderId = parseInt(id._hex, 16);
      const index = orders.findIndex(order => order.id === orderId);
      orders[index].status = OrderStatus.Accepted;
      orders[index].deliveryService = deliveryService;
    }

    const onOrderStatusChanged = (id, client, seller, deliveryService, status) => {
      const orderId = parseInt(id._hex, 16);
      const index = orders.findIndex(order => order.id === orderId);
      orders[index].status = status;
    }

    onMounted(async () => {
      const address = "0x59Ce492d182688239C118AcFEb1A4872Ce3B1231";
      const myOrders = await getOrdersBySeller(address);
      orders.push(...myOrders);

      const { tnoEats } = await getSmartContract();

      const onOrderPendingFilter = tnoEats.filters.OrderPending(null, null, address, null);
      tnoEats.on(onOrderPendingFilter, onOrderPending);

      const onOrderCancelledFilter = tnoEats.filters.OrderCancelled(null, null, address);
      tnoEats.on(onOrderCancelledFilter, onOrderCancelled);

      const onOrderAcceptedFilter = tnoEats.filters.OrderAccepted(null, null, address, null);
      tnoEats.on(onOrderAcceptedFilter, onOrderAccepted);

      const onOrderPickedUpFilter = tnoEats.filters.OrderPickedUp(null, null, address, null);
      tnoEats.on(onOrderPickedUpFilter, (id, client, seller, deliveryService) => +
        onOrderStatusChanged(id, client, seller, deliveryService, OrderStatus.PickedUp));

      const onOrderInTransitFilter = tnoEats.filters.OrderInTransit(null, null, address, null);
      tnoEats.on(onOrderInTransitFilter, (id, client, seller, deliveryService) => +
        onOrderStatusChanged(id, client, seller, deliveryService, OrderStatus.InTransit));

      const onOrderReceivedFilter = tnoEats.filters.OrderReceived(null, null, address, null);
      tnoEats.on(onOrderReceivedFilter, (id, client, seller, deliveryService) => +
        onOrderStatusChanged(id, client, seller, deliveryService, OrderStatus.Received));

      const onOrderDeliveredFilter = tnoEats.filters.OrderDelivered(null, null, address, null);
      tnoEats.on(onOrderDeliveredFilter, (id, client, seller, deliveryService) => +
        onOrderStatusChanged(id, client, seller, deliveryService, OrderStatus.Delivered));

      const onOrderCompletedFilter = tnoEats.filters.OrderCompleted(null, null, address, null);
      tnoEats.on(onOrderCompletedFilter, (id, client, seller, deliveryService) => +
        onOrderStatusChanged(id, client, seller, deliveryService, OrderStatus.Completed));
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
  },
}
</script>
<style>
</style>
