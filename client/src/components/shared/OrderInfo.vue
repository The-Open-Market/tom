<template>
  <div>
    <p v-if="pov === 'delivery'">TODO: integrate open maps</p>
    <p v-if="pov === 'delivery'">Address hash: {{ hashedAddress }}</p>

    <p v-if="pov !== 'delivery'">Delivery address: {{ deliveryAddress.street }} {{ deliveryAddress.hnr }} {{ deliveryAddress.hnr_add }}, {{ deliveryAddress.zip }}</p>
    <p v-if="pov !== 'delivery'">Order details: ({{ items }} item{{ items > 1 ? 's' : '' }}):</p>

    <p v-if="pov === 'seller'">Salt: {{ salt }}</p>
    
    <template v-if="pov !== 'delivery'">
      <div v-for="product in cart" :key="product.id">
        <p>{{ product.quantity }}x {{ product.name }}: €{{ parseFloat(product.price).toFixed(2) }}</p>
      </div>
    </template>
  </div>
</template>

<script>
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
    var deliveryAddress;
    var cart;
    var salt;
    var items;
    
    if (props.order.orderInformation) {
      var { deliveryAddress, cart, salt } = props.order.orderInformation;
      items = cart.reduce((a,b) => a + b.quantity, 0);
    }
    const hashedAddress = props.order.hashedAddress;

    return {
      deliveryAddress,
      salt,
      cart,
      items,
      hashedAddress
    }
  }
}
</script>
