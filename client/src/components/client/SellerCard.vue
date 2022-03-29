<template>
  <Card class="seller-card h-52 cursor-pointer">
    <h2 class="font-semibold text-gray-700 transition duration-100">{{ model.name }}</h2>
    <div class="absolute left-0 bottom-0 h-3/4 w-full">
      <div class="h-full relative overflow-hidden">
        <img :src="model.imageUrl" class="absolute left-0 bottom-0 h-full w-full rounded-b object-cover transition-transform duration-200"/>
      </div>
    </div>
  </Card>
</template>

<script>
import Card from '@/components/shared/Card.vue';

export default {
  name: "SellerCard",

  props: {
    model: {
      type: Object,
      required: true
    }
  },

  components: {
    Card
  }
}
</script>

<style lang="scss">
  .seller-card:hover {
    
    h2 {
      @apply text-yellow-700;
    }

    img {
      @apply scale-110;
    }
  }
</style>