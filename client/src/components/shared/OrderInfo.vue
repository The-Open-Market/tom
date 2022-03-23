<template>
<!-- Client view: -->
  <div v-if="pov === 'client'">
    <div>
      <span class="font-medium">Address: </span>
      {{ deliveryAddress.street }} {{ deliveryAddress.hnr }} {{ deliveryAddress.hnr_add }}, {{ deliveryAddress.zip }}
    </div>
    <div>
      <span class="font-medium">
        Order details <span class="text-sm lowercase">({{ items }} item{{ items > 1 ? 's' : '' }})</span>:
      </span>
      <div v-for="product in cart" :key="product.id">
        <p>{{ product.quantity }}x {{ product.name }}: €{{ parseFloat(product.price * product.quantity).toFixed(2) }}</p>
      </div>
    </div>
  </div>
  
<!-- Seller view: -->
  <div v-if="pov === 'seller'">
    <div>
      <span class="font-medium">Address: </span>
      {{ deliveryAddress.street }} {{ deliveryAddress.hnr }} {{ deliveryAddress.hnr_add }}, {{ deliveryAddress.zip }}
    </div>
    <div class="flex">
      <span class="font-medium">Salt: </span>
      <Button text="Copy" @click="copyValue(salt)" class="ml-1 green transparent small" />
    </div>
    <div v-if="order.status.value === OrderStatus.Pending.value">
      <span class="font-medium">Order history:</span>
      <div># Completed orders: <span class="font-medium">{{ order['completedOrders'] }}</span></div>
      <div># Cancelled orders: <span class="font-medium">{{ order['cancelledOrders'] }}</span></div>
    </div>
    <div v-if="order.status.value !== OrderStatus.Pending.value">
      <span class="font-medium">Collateral: </span>
      {{ 0 < order.collateral ? `€${order.collateral}` : 'N/a' }}
    </div>
    <div v-if="order.status.value !== OrderStatus.Pending.value">
      <span class="font-medium">Delivery Fee: </span>
      {{ 0 < order.deliveryFee ? `€${order.deliveryFee.toFixed(2)}` : 'N/a' }}
    </div>
    <div>
      <span class="font-medium">
        Order details <span class="text-sm lowercase">({{ items }} item{{ items > 1 ? 's' : '' }})</span>:
      </span>
      <div v-for="product in cart" :key="product.id">
        <p>{{ product.quantity }}x {{ product.name }}: €{{ parseFloat(product.price * product.quantity).toFixed(2) }}</p>
      </div>
    </div> 
  </div>

<!-- Delivery view: -->
  <div v-if="pov === 'delivery'">
    <div class="border-b pb-3 mb-3">
      <span class="text-sm italic">Possibility to integrate open maps</span>
      <div>
        <span class="font-medium">Origin: </span>
        {{ order.originZipCode }}
      </div>
      <div>
        <span class="font-medium">Destination: </span>
        {{ order.destinationZipCode }}
      </div>
    </div>
    <div class="flex">
      <span class="font-medium">Address hash: </span>
      <Button text="Copy" @click="copyValue(hashedAddress)" class="ml-1 green transparent small" />
    </div>
    <div class="text-red-500">
      <span class="font-medium">Collateral: </span>
      {{ 0 < order.collateral ? `€${order.collateral.toFixed(2)}` : 'N/a' }}
    </div>
    <div class="text-red-500">
      <span class="font-medium">Delivery Fee: </span>
      {{ 0 < order.deliveryFee ? `€${order.deliveryFee.toFixed(2)}` : 'N/a' }}
    </div>
  </div>
</template>

<script>
import Button from '@/components/shared/Button.vue';

import useClipboard from 'vue-clipboard3'

import { OrderStatus } from '@/utils/order';

export default {
  name: "OrderInfo",

  props: {
    order: {
      type: Object,
      required: true
    },
    pov: {
      type: String,
      default: "seller" // "client" or "delivery"
    }
  },

  setup(props) {
    const { toClipboard } = useClipboard();

    var deliveryAddress;
    var cart;
    var salt;
    var items;
    
    if (props.order.orderInformation) {
      var { deliveryAddress, cart, salt } = props.order.orderInformation;
      items = cart.reduce((a,b) => a + b.quantity, 0);
    }
    
    const hashedAddress = props.order.hashedAddress;

    const copyValue = async (value) => {
      try {
        await toClipboard(value);
      } catch (e) {
        console.error(e)
      }
    }

    return {
      deliveryAddress,
      salt,
      cart,
      items,
      hashedAddress,
      copyValue,
      OrderStatus
    }
  },

  components: {
    Button
  }
}
</script>
