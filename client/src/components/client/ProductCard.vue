<template>
  <Card class="seller-card h-52 cursor-pointer bg-gray-200">
    <div class="absolute left-0 top-0 h-1/2 w-full">
      <div class="h-full relative overflow-hidden">
        <img :src="product.img" class="absolute left-0 bottom-0 h-full w-full rounded-t object-cover transition-transform duration-200"/>
      </div>
    </div>
    <div class="flex justify-between content-center mt-24">
      <h3>{{ product.name }}</h3>
      <span class="text-lg font-medium text-gray-900">€ {{ (Math.round(product.price * 100) / 100).toFixed(2) }}</span>
    </div>
    <Button class="mt-4 ml-auto w-36 blue transparent" text="+ Add to cart" @click="click"/>
  </Card>
</template>

<script>
import Card from '@/components/shared/Card.vue';
import Button from '@/components/shared/Button.vue';

export default {
  name: "ProductCard",

  emits: ["click"],

  props: {
    product: {
      type: Object,
      required: true
    }
  },

  setup (_, context) {
    const click = () => {
      context.emit("click");
    }

    return {
      click
    }
  },

  components: {
    Card,
    Button
  }
}
</script>