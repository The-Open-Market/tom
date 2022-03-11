<template>
  <div class="bg-gray-100 rounded shadow drop-shadow px-6 py-4 divide-y">
    <div class="flex justify-between">
      <h3 class="font-medium">
        Order #{{ order.id }}
      </h3>
      <div :class="'px-2 my-auto text-xs font-semibold rounded-full ' + order.status.color">
        {{ order.status.name }}
      </div>
    </div>
    <div>
      <slot name="contents"></slot>
    </div>
    <div class="flex flex-wrap justify-end space-x-4 pt-4">
      <slot name="controls">
        No controls are available
      </slot>
    </div>
  </div>
</template>

<script>
import { OrderStatus } from '@/services/order';

export default {
  name: "OrderCard",

  props: {
    order: {
      type: Object,
      required: true
    }
  },

  setup() {

  }
}
</script>

<style scoped>
  .yellow {
    @apply bg-yellow-100 text-yellow-800;
  }

  .light-green {
    @apply bg-lime-100 text-lime-800;
  }

  .green {
    @apply bg-green-100 text-green-800;
  }

  .blue {
    @apply bg-blue-100 text-blue-800;
  }

  .red {
    @apply bg-red-100 text-red-800;
  }

  .orange {
    @apply bg-orange-100 text-orange-800;
  }
</style>