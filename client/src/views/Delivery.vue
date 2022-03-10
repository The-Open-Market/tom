<template>
  <div class="flex flex-col space-y-4">
    <CardGrid title="Current orders">
      <OrderCard v-for="order in currentOrders" :key="order.id" :order="order">
        <template v-slot:contents>
          <p>TODO: add map integration</p>
        </template>
      </OrderCard>
    </CardGrid>
    <CardGrid title="Approved orders">
      <OrderCard v-for="order in approvedOrders" :key="order.id" :order="order">
        <template v-slot:contents>
          <p>TODO: add map integration</p>
        </template>
        <template v-slot:controls>
          <Button text="Accept" styles="blue" @click="accept(order.id)"/>
        </template>
      </OrderCard>
    </CardGrid>
  </div>
</template>

<script>
import OrderCard from '@/components/shared/OrderCard.vue';
import Button from '@/components/shared/Button.vue';
import CardGrid from '@/components/shared/CardGrid.vue';

import { reactive, onMounted } from 'vue';
import { OrderStatus } from '@/services/order';
import { getSmartContract } from '@/services/ethereum';
import { getOrdersByDeliveryService, getApprovedOrders } from '@/services/smartContract';
import { acceptOrder, pickupOrder, deliverOrder } from '@/services/deliveryService';

export default {
  name: "Delivery",

  setup() {
    const address = "0x15f5319b330D8Da1E3a3852Fabcc60BFBA062919";
    const currentOrders = reactive([]);
    const approvedOrders = reactive([]);

    const accept = async(orderId) => { 
      if (await acceptOrder(orderId)) {
        const index = approvedOrders.findIndex(order => order.id === orderId);
        approvedOrders[index].status = OrderStatus.Accepted;
        currentOrders.push(approvedOrders.find(order => order.id === orderId));
        approvedOrders.splice(index, 1);
      }
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
        status: OrderStatus.Approved,
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

      orders.filter(order => {
        if (order.status.value >= OrderStatus.Accepted.value) {
          currentOrders.push(order);
        }
      });

      const appOrders = await getApprovedOrders();

      console.log(appOrders);

      for (const index in appOrders) {
        approvedOrders.push(appOrders[index]);
      }

      const { tnoEats } = await getSmartContract();
      tnoEats.on('OrderApproved', this.onOrderApproved);
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
    CardGrid,
    OrderCard,
    Button
  }
}
</script>
