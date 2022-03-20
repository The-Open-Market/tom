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

import { ethers } from 'ethers';
import { inject, ref, reactive, onMounted } from 'vue';
import { OrderStatus } from '@/services/order';
import { getSmartContract, getSignerAddress } from '@/services/ethereum';
import { getOrdersByDeliveryService, getApprovedOrders } from '@/services/tnoEats';
import { acceptOrder, pickupOrder, deliverOrder } from '@/services/deliveryService';
import { downloadDeliveryInfo } from "@/services/ipfs";

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
          orders[index].status = OrderStatus.Accepted;
          toast.success(`Order #${orderId} successfully accepted!`);
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
          orders[index].status = OrderStatus.PickedUp;
          toast.success(`Order #${orderId} successfully picked up!`);
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
          orders[index].status = OrderStatus.Delivered;
          toast.success(`Order #${orderId} successfully delivered!`);
        } else {
          toast.error(`Error delivering order #${orderId}`);
        }
      } finally {
        orders[index].loading = false;
      }
    };

    const addOrders = async (myOrders) => {
      for (const order of myOrders) {
        const { hashedAddress } = await downloadDeliveryInfo(order.orderContentsUrl);
        order.hashedAddress = hashedAddress;
        order.loading = false;
        orders.push(order);
      }
    }
    
    const onOrderApproved = async (id, client, seller, sellerZipCode, clientZipCode, deliveryFee, ipfsUrl) => {
      const orderId = parseInt(id._hex, 16);
      if (orders.every(order => order.id !== orderId)) {
        await addOrders([{
          id: orderId,
          status: OrderStatus.Approved,
          client,
          seller,
          sellerZipCode,
          clientZipCode,
          orderContentsUrl: ipfsUrl,
          deliveryFee: parseFloat(ethers.utils.formatEther(deliveryFee)),
        }]);
        toast.info(`Order #${orderId} is now Approved!`);
      }
    };

    const onOrderAccepted = (id, client, seller, deliveryService) => {
      if (deliveryService !== address.value) {
        const orderId = parseInt(id._hex, 16);
        const index = orders.findIndex(order => order.id === orderId);
        orders.splice(index, 1);
        toast.info(`Order #${orderId} is now Accepted!`);
      }
    };

    const onOrderStatusChanged = (id, client, seller, deliveryService, status) => {
      const orderId = parseInt(id._hex, 16);
      const index = orders.findIndex(order => order.id === orderId);
      orders[index].status = status;
      toast.info(`Order #${orderId} is now ${status.name}!`);
    };

    const onAccountChanged = async () => {
      while (orders.length) {
        orders.pop();
      }

      address.value = await getSignerAddress();
      const myOrders = await getOrdersByDeliveryService(address.value);
      await addOrders(myOrders);
      const approvedOrders = await getApprovedOrders();
      await addOrders(approvedOrders);
      const { tnoEats } = await getSmartContract();

      tnoEats.on("OrderApproved", onOrderApproved);

      const onOrderAcceptedFilter = tnoEats.filters.OrderAccepted(null, null, null, address.value);
      tnoEats.on(onOrderAcceptedFilter, onOrderAccepted);

      const onOrderTransferredFilter = tnoEats.filters.OrderTransferred(null, null, null, address.value);
      tnoEats.on(onOrderTransferredFilter, (id, client, seller, deliveryService) => +
        onOrderStatusChanged(id, client, seller, deliveryService, OrderStatus.Transferred));

      const onOrderInTransitFilter = tnoEats.filters.OrderInTransit(null, null, null, address.value);
      tnoEats.on(onOrderInTransitFilter, (id, client, seller, deliveryService) => +
        onOrderStatusChanged(id, client, seller, deliveryService, OrderStatus.InTransit));

      const onOrderReceivedFilter = tnoEats.filters.OrderReceived(null, null, null, address.value);
      tnoEats.on(onOrderReceivedFilter, (id, client, seller, deliveryService) => +
        onOrderStatusChanged(id, client, seller, deliveryService, OrderStatus.Received));

      const onOrderCompletedFilter = tnoEats.filters.OrderCompleted(null, null, null, address.value);
      tnoEats.on(onOrderCompletedFilter, (id, client, seller, deliveryService) => +
        onOrderStatusChanged(id, client, seller, deliveryService, OrderStatus.Completed));
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
