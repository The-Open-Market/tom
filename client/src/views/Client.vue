<template>
  <OrderContainer title="My orders" flow="row">
    <OrderCard v-for="order in orders" :key="order.id" :order="order">
      <template v-slot:contents>
        <p>TODO: add contents from IPFS</p>
      </template>
      <template v-slot:controls v-if="order.status.value === OrderStatus.Pending.value">
        <Button text="Cancel" styles="red" @click="cancel(order.id)"/>
      </template>
      <template v-slot:controls v-if="order.status.value === OrderStatus.InTransit.value || order.status.value === OrderStatus.Delivered.value">
        <Button text="Receive" styles="green" @click="receive(order.id)"/>
      </template>
    </OrderCard>
  </OrderContainer>

  <div class="mt-24">
    <ProductList @addToCart="addToCart"/>
    <ShoppingCart :cartContents="this.cartContents" @increment="increment" @decrement="decrement" @remove="remove" @checkout="checkout"/>
  </div>
</template>

<script>
import ProductList from '@/components/client/ProductList.vue'
import ShoppingCart from '@/components/client/ShoppingCart.vue'
import OrderCard from '@/components/shared/OrderCard.vue';
import Button from '@/components/shared/Button.vue';
import OrderContainer from '@/components/shared/OrderContainer.vue';

import { reactive, onMounted } from "vue";
import { OrderStatus } from '@/services/order';
import { getOrdersByClient } from '@/services/smartContract';
import { getSmartContract } from '@/services/ethereum';
import { placeOrder, cancelOrder, receiveOrder } from '@/services/client';
import { encryptOrderInfo, decryptOrderInfo } from "@/services/crypto";
import { uploadDeliveryInfo, downloadDeliveryInfo } from "@/services/ipfs";

export default {
  name: "Client",

  setup() {
    let cartContents = reactive([]);
    const orders = reactive([]);

    const addToCart = (product) => {
      if (cartContents.filter(entry => entry.id == product.id).length == 0) {
        product['quantity'] = 1
        cartContents.push(product)
      } else {
        cartContents.find(entry => entry.id == product.id)['quantity']++
      }
      console.log(cartContents)
    }

    const increment = (id) => {
      cartContents.find(entry => entry.id == id)['quantity']++
    }

    const decrement = (id) => {
      if (cartContents.find(entry => entry.id == id)['quantity'] == 1) {
        cartContents = cartContents.filter(entry => entry.id != id)
      } else {
        cartContents.find(entry => entry.id == id)['quantity']--
      }
    }

    const remove = (id) => {
      cartContents = cartContents.filter(entry => entry.id != id)
    }

    const checkout = async (clientAddress) => {
      const sellerPublicKey = 'sm0/a19e0Ojgh05dXX7nwL7QiGJ02HiKgZQGiLvW70w=';
      const clientPublicKey = 'sm0/a19e0Ojgh05dXX7nwL7QiGJ02HiKgZQGiLvW70w=';
      const clientSecretKey = 'z6bXpb5tnHlTc/B9N53ig455/o0lX3eienBkcHbNLeM=';

      const sellerAddress = "0x59Ce492d182688239C118AcFEb1A4872Ce3B1231";

      // TODO: Add all necessary information to be encrypted
      const orderInfo = { cartContents, clientAddress };
      const encrypted = await encryptOrderInfo(sellerPublicKey, clientPublicKey, clientSecretKey, orderInfo);
      const path = await uploadDeliveryInfo(encrypted);

      await placeOrder(sellerAddress, path);
    }

    const cancel = async (orderId) => {
      if (await cancelOrder(orderId)) {
        const index = orders.findIndex(order => order.id === orderId);
        orders[index].status = OrderStatus.Cancelled;
      }
    }

    const receive = async (orderId) => {
      if (await receiveOrder(orderId)) {
        const index = orders.findIndex(order => order.id === orderId);
        orders[index].status = OrderStatus.Received;
      }
    }

    const addOrders = async (myOrders) => {
      const sellerSecretKey = 'z6bXpb5tnHlTc/B9N53ig455/o0lX3eienBkcHbNLeM=';

      for (const order of myOrders) {
        // TODO: Do not use sellerSecretKey to decrypt
        const downloadedInfo = await downloadDeliveryInfo(order.orderContentsUrl);
        const orderInformation = await decryptOrderInfo(JSON.parse(downloadedInfo), sellerSecretKey);
        order.orderInformation = orderInformation;
        orders.push(order);
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
      }
    }

    const onOrderRejected = (id, client, seller) => {
      const orderId = parseInt(id._hex, 16);
      const index = orders.findIndex(order => order.id === orderId);
      orders[index].status = OrderStatus.Rejected;
    }

    const onOrderApproved = (id, client, seller) => {
      const orderId = parseInt(id._hex, 16);
      const index = orders.findIndex(order => order.id === orderId);
      orders[index].status = OrderStatus.Approved;
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
      const address = "0x3096cc43379D09d411A6f979E00e29f057929579";
      const myOrders = await getOrdersByClient(address);
      addOrders(myOrders);

      const { tnoEats } = await getSmartContract();

      const onOrderPendingFilter = tnoEats.filters.OrderPending(null, address, null, null);
      tnoEats.on(onOrderPendingFilter, onOrderPending);

      const onOrderApprovedFilter = tnoEats.filters.OrderApproved(null, address, null);
      tnoEats.on(onOrderApprovedFilter, onOrderApproved);

      const onOrderRejectedFilter = tnoEats.filters.OrderRejected(null, address, null);
      tnoEats.on(onOrderRejectedFilter, onOrderRejected);

      const onOrderAcceptedFilter = tnoEats.filters.OrderAccepted(null, address, null, null);
      tnoEats.on(onOrderAcceptedFilter, onOrderAccepted);

      const onOrderPickedUpFilter = tnoEats.filters.OrderPickedUp(null, address, null, null);
      tnoEats.on(onOrderPickedUpFilter, (id, client, seller, deliveryService) => +
        onOrderStatusChanged(id, client, seller, deliveryService, OrderStatus.PickedUp));

      const onOrderTransferredFilter = tnoEats.filters.OrderTransferred(null, address, null, null);
      tnoEats.on(onOrderTransferredFilter, (id, client, seller, deliveryService) => +
        onOrderStatusChanged(id, client, seller, deliveryService, OrderStatus.Transferred));

      const onOrderInTransitFilter = tnoEats.filters.OrderInTransit(null, address, null, null);
      tnoEats.on(onOrderInTransitFilter, (id, client, seller, deliveryService) => +
        onOrderStatusChanged(id, client, seller, deliveryService, OrderStatus.InTransit));

      const onOrderDeliveredFilter = tnoEats.filters.OrderDelivered(null, address, null, null);
      tnoEats.on(onOrderDeliveredFilter, (id, client, seller, deliveryService) => +
        onOrderStatusChanged(id, client, seller, deliveryService, OrderStatus.Delivered));

      const onOrderCompletedFilter = tnoEats.filters.OrderCompleted(null, address, null, null);
      tnoEats.on(onOrderCompletedFilter, (id, client, seller, deliveryService) => +
        onOrderStatusChanged(id, client, seller, deliveryService, OrderStatus.Completed));        
    })

    return {
      cartContents,
      addToCart,
      increment,
      decrement,
      remove,
      checkout,

      orders,
      cancel,
      receive,
      OrderStatus
    }
  },

  components: {
    ProductList,
    ShoppingCart,
    OrderContainer,
    OrderCard,
    Button
  },
}
</script>

<style>

</style>
