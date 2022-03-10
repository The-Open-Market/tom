<template>
  <OrderGrid :nrColumns="3" class="mt-12">
    <OrderContainer title="Accepted">
      <OrderCard v-for="order in orders.filter(order => order.status.value === OrderStatus.Accepted.value)" :key="order.id" :order="order">
        <template v-slot:contents>
          <p>TODO: integrate open maps</p>
        </template>
        <template v-slot:controls>
          <Button text="Pick Up" styles="blue" @click="pickup(order.id)"/>
        </template>
      </OrderCard>
    </OrderContainer>
    <OrderContainer title="In transit">
      <OrderCard v-for="order in orders.filter(order => OrderStatus.PickedUp.value <= order.status.value && order.status.value <= OrderStatus.InTransit.value)" :key="order.id" :order="order">
        <template v-slot:contents>
          <p>TODO: integrate open maps</p>
        </template>
        <template v-slot:controls v-if="order.status.value === OrderStatus.Transferred.value">
          <Button text="PickUp" styles="blue" @click="pickup(order.id)"/>
        </template>
        <template v-slot:controls v-else-if="order.status.value === OrderStatus.InTransit.value">
          <Button text="Deliver" styles="blue" @click="deliver(order.id)"/>
        </template>
      </OrderCard>
    </OrderContainer>
    <OrderContainer title="Completed">
      <OrderCard v-for="order in orders.filter(order => OrderStatus.Received.value <= order.status.value && order.status.value <= OrderStatus.Completed.value)" :key="order.id" :order="order">
        <template v-slot:contents>
          <p>TODO: integrate open maps</p>
        </template>
        <template v-slot:controls v-if="order.status.value === OrderStatus.Received.value">
          <Button text="Deliver" styles="blue" @click="deliver(order.id)"/>
        </template>
      </OrderCard>
    </OrderContainer>
  </OrderGrid>

  <OrderContainer title="Approved" flow="row" class="mt-12">
    <OrderCard v-for="order in orders.filter(order => order.status.value === OrderStatus.Approved.value )" :key="order.id" :order="order">
      <template v-slot:contents>
        <p>TODO: integrate open maps</p>
      </template>
      <template v-slot:controls>
        <Button text="Accept" styles="green" @click="accept(order.id)"/>
      </template>
    </OrderCard>
  </OrderContainer>
</template>

<script>
import OrderCard from '@/components/shared/OrderCard.vue';
import Button from '@/components/shared/Button.vue';
import OrderGrid from '@/components/shared/OrderGrid.vue';
import OrderContainer from '@/components/shared/OrderContainer.vue';

import { reactive, onMounted } from 'vue';
import { OrderStatus } from '@/services/order';
import { getSmartContract } from '@/services/ethereum';
import { getOrdersByDeliveryService, getApprovedOrders } from '@/services/smartContract';
import { acceptOrder, pickupOrder, deliverOrder } from '@/services/deliveryService';

export default {
  name: "Delivery",

  setup() {
    const orders = reactive([]);

    const accept = async(orderId) => { 
      if (await acceptOrder(orderId)) {
        const index = orders.findIndex(order => order.id === orderId);
        orders[index].status = OrderStatus.Accepted;
      }
    };

    const pickup = async(orderId) => { 
      if (await pickupOrder(orderId)) {
        const index = orders.findIndex(order => order.id === orderId);
        orders[index].status = OrderStatus.PickedUp;
      }
    };

    const deliver = async(orderId) => { 
      if (await deliverOrder(orderId)) {
        const index = orders.findIndex(order => order.id === orderId);
        orders[index].status = OrderStatus.Delivered;
      }
    };
    
    const onOrderApproved = (id, client, seller, sellerZipCode, clientZipCode) => {
      const orderId = parseInt(id._hex, 16);
      if(orders.every(order => order.id !== orderId)) {
        orders.push({
          id: orderId,
          status: OrderStatus.Approved,
          client,
          seller,
          sellerZipCode,
          clientZipCode
        });
      }
    };

    const onOrderAccepted = (id, client, seller, deliveryService) => {
      if (deliveryService !== this.address) {
        const orderId = parseInt(id._hex, 16);
        const index = orders.findIndex(order => order.id === orderId);
        orders.splice(index, 1);
      }
    };

    const onOrderStatusChanged = (id, client, seller, deliveryService, status) => {
      const orderId = parseInt(id._hex, 16);
      const index = orders.findIndex(order => order.id === orderId);
      orders[index].status = status;
    };

    onMounted(async () => {
      const address = "0x15f5319b330D8Da1E3a3852Fabcc60BFBA062919";
      const myOrders = await getOrdersByDeliveryService(address);
      orders.push(...myOrders);
      const approvedOrders = await getApprovedOrders();
      orders.push(...approvedOrders);
      console.log(orders);
      const { tnoEats } = await getSmartContract();

      tnoEats.on("OrderApproved", onOrderApproved);

      const onOrderAcceptedFilter = tnoEats.filters.OrderAccepted(null, null, null, address);
      tnoEats.on(onOrderAcceptedFilter, onOrderAccepted);

      const onOrderTransferredFilter = tnoEats.filters.OrderTransferred(null, null, null, address);
      tnoEats.on(onOrderTransferredFilter, (id, client, seller, deliveryService) => +
        onOrderStatusChanged(id, client, seller, deliveryService, OrderStatus.Transferred));

      const onOrderInTransitFilter = tnoEats.filters.OrderInTransit(null, null, null, address);
      tnoEats.on(onOrderInTransitFilter, (id, client, seller, deliveryService) => +
        onOrderStatusChanged(id, client, seller, deliveryService, OrderStatus.InTransit));

      const onOrderReceivedFilter = tnoEats.filters.OrderReceived(null, null, null, address);
      tnoEats.on(onOrderReceivedFilter, (id, client, seller, deliveryService) => +
        onOrderStatusChanged(id, client, seller, deliveryService, OrderStatus.Received));

      const onOrderCompletedFilter = tnoEats.filters.OrderCompleted(null, null, null, address);
      tnoEats.on(onOrderCompletedFilter, (id, client, seller, deliveryService) => +
        onOrderStatusChanged(id, client, seller, deliveryService, OrderStatus.Completed));
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
  }
}
</script>
