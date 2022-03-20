<template>
  <div>
    <p v-if="pov === 'delivery'">
      TODO: integrate open maps
    </p>

    <p class="flex" v-if="pov === 'delivery'">
      <span class="font-medium uppercase">Address hash: </span>
      <Button text="Copy" @click="copyHash"/>
    </p>

    <p v-if="pov !== 'delivery'">
      <span class="font-medium uppercase">Delivery address: </span>
      {{ deliveryAddress.street }} {{ deliveryAddress.hnr }} {{ deliveryAddress.hnr_add }}, {{ deliveryAddress.zip }}
    </p>

    <p v-if="pov !== 'delivery'">
      <span class="font-medium uppercase">Order details: </span>
      ({{ items }} item{{ items > 1 ? 's' : '' }}):
    </p>

    <p v-if="pov === 'seller'">
      <span class="font-medium uppercase">Salt: </span>
      {{ salt }}
    </p>

    <p v-if="order.status.name !== 'Pending'">
      <span class="font-medium uppercase">Delivery Fee: </span>
      €{{ order.deliveryFee.toFixed(2) }}
    </p>
    
    <template v-if="pov !== 'delivery'">
      <div v-for="product in cart" :key="product.id">
        <p>{{ product.quantity }}x {{ product.name }}: €{{ parseFloat(product.price * product.quantity).toFixed(2) }}</p>
      </div>
    </template>
  </div>
</template>

<script>
import Button from '@/components/shared/Button.vue';

import useClipboard from 'vue-clipboard3'

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

    const copyHash = async () => {
      try {
        await toClipboard(hashedAddress);
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
      copyHash
    }
  },

  components: {
    Button
  }
}
</script>
