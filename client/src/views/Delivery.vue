<template>
  <OrderTable :orders="approvedOrders" :isSeller="false"/>
  <OrderTable :orders="currentOrders" :isSeller="false" @acceptOrder="accept"/>
</template>

<script>
import OrderTable from '../components/OrderTable.vue'

import { reactive, onMounted } from 'vue';
import { getSmartContract } from '../services/ethereum';
import { getOrdersByDeliveryService, getApprovedOrders } from '../services/smartContract';
import { acceptOrder, pickupOrder, deliverOrder } from '../services/deliveryService';

export default {
  name: "Delivery",

  setup() {
    const address = "0x15f5319b330D8Da1E3a3852Fabcc60BFBA062919";
    const currentOrders = reactive([]);
    const approvedOrders = reactive([]);

    const accept = async(orderId) => { 
      await acceptOrder(orderId);
      currentOrders.push(approvedOrders.find(order => order.id === orderId));
      approvedOrders.remove(approvedOrders.findIndex(order => order.id === orderId));
    };

    const pickup = async(orderId) => { 
      await pickupOrder(orderId);
    };

    const deliver = async(orderId) => { 
      await deliverOrder(orderId);
    };
    
    const onOrderApproved = (id, client, seller, sellerZipCode, clientZipCode) => {
      approvedOrders.push({
        id: parseInt(id._hex, 16),
        status: 1,
        client,
        seller,
        sellerZipCode,
        clientZipCode
      });
    };

    const onOrderAccepted = (id, client, seller, deliveryService) => {
      if (deliveryService !== this.address) {
        let orderId = parseInt(id._hex, 16);
        approvedOrders.remove(approvedOrders.findIndex(order => order.id === orderId));
      }
    };

    onMounted(async () => {
      const address = "0x15f5319b330D8Da1E3a3852Fabcc60BFBA062919";
      const orders = await getOrdersByDeliveryService(address);

      // TODO: replace with enum type
      for (const order in orders.filter(order => order.status >= 3)) {
        currentOrders.push(order);
      }

      for (const order in await getApprovedOrders()) {
        approvedOrders.push(order);
      }

      const { tnoEats } = await getSmartContract();
      // Watch new approved orders
      tnoEats.on('OrderApproved', this.onOrderApproved);
      // Remove orders accepted by other deliverers
      tnoEats.on('orderAccepted', this.onOrderAccepted)
    });

    return {
      address,
      currentOrders, 
      approvedOrders,
      accept,
      pickup,
      deliver,
      onOrderApproved,
      onOrderAccepted,
    }
  },

  async mounted() {
    
  },

  components: {
    OrderTable
  }
}
</script>
