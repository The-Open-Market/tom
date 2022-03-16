<template>
  <div>
    <p>Delivery address: {{ deliveryAddress.street }} {{ deliveryAddress.hnr }}, {{ deliveryAddress.zip }}</p>
    <p>Order details ({{ items }} item{{ items > 1 ? 's' : '' }}):</p>
    <div v-for="product in cart" :key="product.id">
      <p>{{ product.quantity }}x {{ product.name }}: €{{ parseFloat(product.price).toFixed(2) }}</p>
    </div>
    <p v-if="order.status.name !== 'Pending'">Delivery Fee: €{{ order.deliveryFee.toFixed(2) }}</p>
  </div>
</template>

<script>
export default {
  name: "OrderInfo",

  props: {
    order: {
      type: Object,
      required: true
    }
  },

  setup(props) {
    const { deliveryAddress, cart } = props.order.orderInformation;
    const items = cart.reduce((a,b) => a + b.quantity, 0);

    return {
      deliveryAddress,
      cart,
      items,
    }
  }
}
</script>
