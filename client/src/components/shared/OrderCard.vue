<template>
  <div class="relative bg-gray-100 rounded shadow drop-shadow px-6 py-4 divide-y">
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
    <div v-if="loading" class="flex absolute w-full h-full rounded top-0 left-0 z-10 bg-black/50">
      <Loader class="m-auto"/>
    </div>
  </div>
</template>

<script>
import Loader from '@/components/shared/Loader.vue';

import { OrderStatus } from '@/utils/order';

export default {
  name: "OrderCard",

  props: {
    order: {
      type: Object,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  components: {
    Loader
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