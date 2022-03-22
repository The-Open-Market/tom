<template>
  <button @click="clicked" class="green" :disabled="disabled || loading">
    <Loader v-if="loading"/>
    <span v-else>{{ text }}</span>
  </button>
</template>

<script>
import Loader from '@/components/shared/Loader.vue';

export default {
  name: "Button",

  props: {
    text: {
      type: String,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  emits: ["click"],

  setup(_, context) {
    const clicked = () => {
      context.emit("click");
    }

    return {
      clicked
    }
  },

  components: {
    Loader,
  }
}
</script>

<style scoped>
  .green {
    @apply bg-emerald-500 hover:bg-emerald-700 border-emerald-500 hover:border-emerald-700;
  }

  .red {
    @apply bg-rose-500 hover:bg-rose-700 border-rose-500 hover:border-rose-700;
  }

  .blue {
    @apply bg-sky-500 hover:bg-sky-700 border-sky-500 hover:border-sky-700;
  }

  .green, .red, .blue {
    min-width: 6rem;
    @apply flex items-center justify-center h-9 disabled:bg-gray-500 hover:disabled:cursor-not-allowed text-white font-semibold py-1 px-4 rounded;
  }

  .green.transparent {
    @apply hover:bg-emerald-500 hover:border-emerald-500 text-emerald-500 hover:text-white;
  }

  .red.transparent {
    @apply hover:bg-rose-500 hover:border-rose-500 text-rose-500 hover:text-white;
  }

  .blue.transparent {
    @apply hover:bg-sky-500 hover:border-sky-500 text-sky-500 hover:text-white;
  }

  .transparent {
    @apply bg-transparent border disabled:text-white hover:disabled:bg-gray-500 disabled:border-gray-500 hover:disabled:border-gray-500;
  }

  .small {
    min-width: auto;
    @apply h-6 text-xs px-2;
  }
</style>