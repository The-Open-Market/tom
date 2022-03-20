<template>
  <div class="bg-gray-100 rounded shadow drop-shadow px-6 py-4 divide-y">
    <div class="flex justify-between py-3">
      <h3 class="font-medium">
        Order <span class="text-sm">#</span>{{ order.id }}
      </h3>
      <div :class="'px-2 my-auto text-xs font-semibold rounded-full ' + order.status.color">
        {{ order.status.name }}
      </div>
    </div>
    <div class="py-3">
      <slot name="contents"></slot>
    </div>
    <div class="flex flex-wrap justify-end gap-4 pt-3">
      <slot name="controls">
        <p class="text-sm italic font-thin text-slate-700">No controls are available</p>
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