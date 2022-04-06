<template>
  <StyledTabs>
    <StyledTab name="Available orders">
      <AvailableOrders :orders="orders.filter(order => order.status.value === OrderStatus.Approved.value)" :address="address"/>
    </StyledTab>
    <StyledTab name="Active orders">
      <ActiveOrders :orders="orders.filter(order => OrderStatus.Accepted.value <= order.status.value && order.status.value < OrderStatus.Completed.value)"/>
    </StyledTab>
    <StyledTab name="Order history">
      <OrderHistory :orders="orders.filter(order => order.status.value === OrderStatus.Completed.value)"/>
    </StyledTab>
  </StyledTabs>
</template>

<script>
import StyledTabs from '@/components/shared/StyledTabs.vue';
import StyledTab from '@/components/shared/StyledTab.vue';
import AvailableOrders from '@/components/delivery/AvailableOrders.vue';
import ActiveOrders from '@/components/delivery/ActiveOrders.vue';
import OrderHistory from '@/components/delivery/OrderHistory.vue';

import { inject, ref, reactive, onMounted } from 'vue';
import { getSmartContract, getSignerAddress, listenToAccountChanges } from '@/services/ethereum';
import { getOrdersByDeliveryService, getApprovedOrders } from '@/endpoints/deliveryService';
import { OrderStatus, OrderStatusMap, orderFromData } from '@/utils/order';

export default {
  name: "Delivery",

  setup() {
    const toast = inject('$toast');

    const orders = reactive([]);
    const address = ref("");

    const onOrderStatusChanged = async (id, amount, deliveryFee, collateral, status, client, seller, deliveryService, orderContentsUrl, originZipCode, destinationZipCode, waitOnReady) => {
      const orderId = parseInt(id._hex, 16);
      const data = {id, amount, deliveryFee, collateral, status, client, seller, deliveryService, orderContentsUrl, originZipCode, destinationZipCode, waitOnReady};

      if (orders.every(order => order.id !== orderId)) {
        const order = await orderFromData(data, 'delivery');
        if (order) {
          orders.push(order);
          toast.info(`Order #${orderId} is now ${OrderStatusMap[status].name.toLowerCase()}`);
        }
        return;
      }

      const index = orders.findIndex(order => order.id === orderId);
      
      if (orders[index].status.value < OrderStatusMap[status].value) {
        const order = await orderFromData(data, 'delivery');
        if (order) {
          orders[index] = order;
          toast.info(`Order #${orderId} is now ${OrderStatusMap[status].name.toLowerCase()}`);
        }
      }
    }

    const onAccountChanged = async () => {
      orders.splice(0);

      address.value = await getSignerAddress();
      const myOrders = await getOrdersByDeliveryService(address.value);
      orders.push(...myOrders);

      const approvedOrders = await getApprovedOrders();
      orders.push(...approvedOrders);

      const { tom } = await getSmartContract();

      tom.removeAllListeners();

      const filteredEventListener = tom.filters.OrderStatusChanged(null, null, null, null, null, null, null, address.value, null, null, null);
      tom.on(filteredEventListener, onOrderStatusChanged);

      const approvedEventListener = tom.filters.ApprovedOrder(null, null, null, null, OrderStatus.Approved.value, null, null, null, null, null, null);
      tom.on(approvedEventListener, onOrderStatusChanged);
    }

    onMounted(onAccountChanged);
    listenToAccountChanges(onAccountChanged);

    return {
      orders,
      address,
      OrderStatus
    }
  },

  components: {
    StyledTabs,
    StyledTab,
    AvailableOrders,
    ActiveOrders,
    OrderHistory
  }
}
</script>
