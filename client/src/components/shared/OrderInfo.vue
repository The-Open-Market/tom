<template>
<!-- Client view: -->
  <div v-if="pov === 'client'">
    <div>
      <span class="font-medium uppercase">Address: </span>
      {{ deliveryAddress.street }} {{ deliveryAddress.hnr }} {{ deliveryAddress.hnr_add }}, {{ deliveryAddress.zip }}
    </div>
    <div>
      <span class="font-medium uppercase">Delivery Fee: </span>
      {{ 0 < order.deliveryFee ? `€${order.deliveryFee.toFixed(2)}` : 'N/a' }}
    </div>
    <div>
      <span class="font-medium uppercase">
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
      <span class="font-medium uppercase">Address: </span>
      {{ deliveryAddress.street }} {{ deliveryAddress.hnr }} {{ deliveryAddress.hnr_add }}, {{ deliveryAddress.zip }}
    </div>
    <div class="flex">
      <span class="font-medium uppercase">Salt: </span>
      <Button text="Copy" @click="copyValue(salt)" class="ml-1 uppercase green transparent small" />
    </div>
    <div>
      <span class="font-medium uppercase">Delivery Fee: </span>
      {{ 0 < order.deliveryFee ? `€${order.deliveryFee.toFixed(2)}` : 'N/a' }}
    </div>
    <div>
      <span class="font-medium uppercase">
        Order details <span class="text-sm lowercase">({{ items }} item{{ items > 1 ? 's' : '' }})</span>:
      </span>
      <div v-for="product in cart" :key="product.id">
        <p>{{ product.quantity }}x {{ product.name }}: €{{ parseFloat(product.price * product.quantity).toFixed(2) }}</p>
      </div>
    </div> 
  </div>

<!-- Delivery view: -->
  <div v-if="pov === 'delivery'">
    <div>TODO: integrate open maps</div>
    <div class="flex">
      <span class="font-medium uppercase">Address hash: </span>
      <Button text="Copy" @click="copyValue(hashedAddress)" class="ml-1 uppercase green transparent small" />
    </div>
    <div>
      <span class="font-medium uppercase text-red-500">Delivery Fee: </span>
      {{ 0 < order.deliveryFee ? `€${order.deliveryFee.toFixed(2)}` : 'N/a' }}
    </div>
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
      copyValue
    }
  },

  components: {
    Button
  }
}
</script>
