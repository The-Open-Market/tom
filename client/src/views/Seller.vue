<template>
  <StyledTabs>
    <StyledTab name="Pending orders">
      <PendingOrders :orders="orders.filter(order => order.status.value === OrderStatus.Pending.value)"/>
    </StyledTab>
    <StyledTab name="Active orders">
      <ActiveOrders :orders="orders.filter(order => OrderStatus.Approved.value <= order.status.value 
                                                 && order.status.value < OrderStatus.Completed.value)"/>
    </StyledTab>
    <StyledTab name="Order history">
      <OrderHistory :orders="orders.filter(order => order.status.value === OrderStatus.Rejected.value 
                                                 || order.status.value === OrderStatus.Cancelled.value
                                                 || order.status.value === OrderStatus.Completed.value)" />
    </StyledTab>
  </StyledTabs>  
</template>

<script>
import StyledTabs from '@/components/shared/StyledTabs.vue';
import StyledTab from '@/components/shared/StyledTab.vue';
import PendingOrders from '@/components/seller/PendingOrders.vue';
import ActiveOrders from '@/components/seller/ActiveOrders.vue';
import OrderHistory from '@/components/seller/OrderHistory.vue';

import { inject, ref, reactive, onMounted } from "vue";
import { getSmartContract, getSignerAddress, listenToAccountChanges } from '@/services/ethereum';
import { getOrdersBySeller } from '@/endpoints/seller';
import { OrderStatus, OrderStatusMap, orderFromData } from '@/utils/order';
import { getCurrentKeysAsync } from '@/storage/keys';

export default {
  name: 'Seller',

  setup() {
    const toast = inject('$toast');

    const orders = reactive([]);
    let address = ref("");

    const onOrderStatusChanged = async (id, amount, deliveryFee, collateral, status, client, seller, deliveryService, orderContentsUrl, originZipCode, destinationZipCode) => {
      const orderId = parseInt(id._hex, 16);
      const data = {id, amount, deliveryFee, collateral, status, client, seller, deliveryService, orderContentsUrl, originZipCode, destinationZipCode};
      const userKeys = await getCurrentKeysAsync();
      if (orders.every(order => order.id !== orderId)) {
        const order = await orderFromData(data, 'seller', userKeys.private);
        if (order) {
          orders.push(order);
          toast.info(`Order #${orderId} is now ${OrderStatusMap[status].name.toLowerCase()}`);
        }
        return;
      }

      const index = orders.findIndex(order => order.id === orderId);
      
      if (orders[index].status.value < OrderStatusMap[status].value) {
        const order = await orderFromData(data, 'seller', userKeys.private);
        if (order) {
          orders[index] = order;
          toast.info(`Order #${orderId} is now ${OrderStatusMap[status].name.toLowerCase()}`);
        }
      }
    }

    const onAccountChanged = async () => {
      orders.splice(0);

      const userKeys = await getCurrentKeysAsync();

      address.value = await getSignerAddress();
      const myOrders = await getOrdersBySeller(address.value, userKeys.private);
      orders.push(...myOrders);

      const { tnoEats } = await getSmartContract();

      tnoEats.removeAllListeners();

      const filteredEventListener = tnoEats.filters.OrderStatusChanged(null, null, null, null, null, null, address.value, null, null, null, null);
      tnoEats.on(filteredEventListener, onOrderStatusChanged);
    }

    onMounted(onAccountChanged);
    listenToAccountChanges(onAccountChanged);

    return {
      orders,
      OrderStatus
    }
  },

  components: {
    StyledTabs,
    StyledTab,
    PendingOrders,
    ActiveOrders,
    OrderHistory
  },
}
</script>
<style>
</style>
