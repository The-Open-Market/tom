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
        <Button text="Receive" class="green" @click="receive(order.id)" :disabled="order.loading"/>
      </template>
    </OrderCard>
  </OrderContainer>

  <OrderPlacement class="mt-24"/>
</template>

<script>
import OrderPlacement from '@/components/client/OrderPlacement.vue'
import OrderCard from '@/components/shared/OrderCard.vue';
import Button from '@/components/shared/Button.vue';
import OrderContainer from '@/components/shared/OrderContainer.vue';
import OrderInfo from '@/components/shared/OrderInfo.vue';

import { ref, reactive, onMounted, inject } from "vue";
import { ethers } from 'ethers';
import { OrderStatus } from '@/services/order';
import { getOrdersByClient } from '@/services/tnoEats';
import { approveTransaction } from '@/services/eurTno';
import { getSmartContract, getSignerAddress } from '@/services/ethereum';
import { placeOrder, cancelOrder, receiveOrder } from '@/services/client';
import { encryptOrderInfo, decryptClientOrderInfo } from "@/services/crypto";
import { uploadDeliveryInfo, downloadDeliveryInfo } from "@/services/ipfs";

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
        if (await cancelOrder(orderId)) {
          orders[index].status = OrderStatus.Cancelled;
          toast.success(`Order #${orderId} successfully canceled!`);
        } else {
          toast.error(`Error canceling order #${orderId}`);
        }
      } finally {
        orders[index].loading = false;
      }
    }

    const receive = async (orderId) => {
      const index = orders.findIndex(order => order.id === orderId);
      orders[index].loading = true;
      try {
        if (await receiveOrder(orderId)) {
          orders[index].status = OrderStatus.Received;
          toast.success(`Order #${orderId} successfully received!`);
        } else {
          toast.error(`Error receiving order #${orderId}`);
        }
      } finally {
        orders[index].loading = false;
      }
    }

    const addOrders = async (myOrders) => {
      const clientKey = 'KXj1DmMm6caFY1ioIyBIy6Ovs1tCjFuj8yEXZgysSCk=';

      for (const order of myOrders) {
        try {
          const downloadedInfo = await downloadDeliveryInfo(order.orderContentsUrl);
          const orderInformation = await decryptClientOrderInfo(downloadedInfo, clientKey);
          order.orderInformation = orderInformation;
          order.loading = false;
          orders.push(order);
        } catch (_) {
          // Ignore download/decryption errors
        }
      }
    }

    const onOrderPending = (id, client, seller, ipfsUrl) => {
      const orderId = parseInt(id._hex, 16);
      if (orders.every(order => order.id !== orderId)) {
        addOrders([{
          id: orderId,
          status: OrderStatus.Pending,
          client,
          seller,
          orderContentsUrl: ipfsUrl
        }]);
        toast.info(`Order #${orderId} is now Pending!`);
      }
    }

    const onOrderRejected = (id, client, seller) => {
      const orderId = parseInt(id._hex, 16);
      const index = orders.findIndex(order => order.id === orderId);
      orders[index].status = OrderStatus.Rejected;
      toast.info(`Order #${orderId} is now Rejected!`);
    }

    const onOrderApproved = (id, client, seller, sellerZipCode, clientZipCode, deliveryFee) => {
      const orderId = parseInt(id._hex, 16);
      const index = orders.findIndex(order => order.id === orderId);
      orders[index].status = OrderStatus.Approved;
      orders[index].sellerZipCode = sellerZipCode;
      orders[index].clientZipCode = clientZipCode;
      orders[index].deliveryFee = parseFloat(ethers.utils.formatEther(deliveryFee));
      toast.info(`Order #${orderId} is now Approved!`);
    }

    const onOrderAccepted = (id, client, seller, deliveryService) => {
      const orderId = parseInt(id._hex, 16);
      const index = orders.findIndex(order => order.id === orderId);
      orders[index].status = OrderStatus.Accepted;
      orders[index].deliveryService = deliveryService;
      toast.info(`Order #${orderId} is now Accepted!`);
    }

    const onOrderStatusChanged = (id, client, seller, deliveryService, status) => {
      const orderId = parseInt(id._hex, 16);
      const index = orders.findIndex(order => order.id === orderId);
      orders[index].status = status;
      toast.info(`Order #${orderId} is now ${status.name}!`);
    }

    const onAccountChanged = async () => {
      while (orders.length) {
        orders.pop();
      }

      address.value = await getSignerAddress();
      const myOrders = await getOrdersByClient(address.value);
      addOrders(myOrders);

      const { tnoEats } = await getSmartContract();

      const onOrderPendingFilter = tnoEats.filters.OrderPending(null, address.value, null, null);
      tnoEats.on(onOrderPendingFilter, onOrderPending);

      const onOrderApprovedFilter = tnoEats.filters.OrderApproved(null, address.value, null, null, null, null);
      tnoEats.on(onOrderApprovedFilter, onOrderApproved);

      const onOrderRejectedFilter = tnoEats.filters.OrderRejected(null, address.value, null);
      tnoEats.on(onOrderRejectedFilter, onOrderRejected);

      const onOrderAcceptedFilter = tnoEats.filters.OrderAccepted(null, address.value, null, null);
      tnoEats.on(onOrderAcceptedFilter, onOrderAccepted);

      const onOrderPickedUpFilter = tnoEats.filters.OrderPickedUp(null, address.value, null, null);
      tnoEats.on(onOrderPickedUpFilter, (id, client, seller, deliveryService) => +
        onOrderStatusChanged(id, client, seller, deliveryService, OrderStatus.PickedUp));

      const onOrderTransferredFilter = tnoEats.filters.OrderTransferred(null, address.value, null, null);
      tnoEats.on(onOrderTransferredFilter, (id, client, seller, deliveryService) => +
        onOrderStatusChanged(id, client, seller, deliveryService, OrderStatus.Transferred));

      const onOrderInTransitFilter = tnoEats.filters.OrderInTransit(null, address.value, null, null);
      tnoEats.on(onOrderInTransitFilter, (id, client, seller, deliveryService) => +
        onOrderStatusChanged(id, client, seller, deliveryService, OrderStatus.InTransit));

      const onOrderDeliveredFilter = tnoEats.filters.OrderDelivered(null, address.value, null, null);
      tnoEats.on(onOrderDeliveredFilter, (id, client, seller, deliveryService) => +
        onOrderStatusChanged(id, client, seller, deliveryService, OrderStatus.Delivered));

      const onOrderCompletedFilter = tnoEats.filters.OrderCompleted(null, address.value, null, null);
      tnoEats.on(onOrderCompletedFilter, (id, client, seller, deliveryService) => +
        onOrderStatusChanged(id, client, seller, deliveryService, OrderStatus.Completed));
    };

    onMounted(onAccountChanged);

    window.ethereum.on('accountsChanged', async (accounts) => {
      await onAccountChanged();
    });

    return {
      orders,
      cancel,
      receive,
      OrderStatus
    }
  },

  components: {
    OrderPlacement,
    OrderContainer,
    OrderCard,
    Button,
    OrderInfo,
  },
}
</script>

<style>

</style>
