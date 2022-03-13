<template>
  <div>
    <p>Delivery address: {{ deliveryAddress.street }} {{ deliveryAddress.hnr }}, {{ deliveryAddress.zip }}</p>
    <p>Order details ({{ cart.length }} item{{ cart.length > 1 ? 's' : '' }}):</p>
    <div v-for="product in cart" :key="product.id">
      <p>{{ product.quantity }}x {{ product.name }}: €{{ parseFloat(product.price).toFixed(2) }}</p>
    </div>
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

    return {
      deliveryAddress,
      cart,
    }
  }
}
</script>
