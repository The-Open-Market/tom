<template>
  <button @click="clicked" :class="styles" :disabled="disabled || loading">
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
    styles: {
      type: String,
      default: "green"
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
    @apply bg-emerald-500 hover:bg-emerald-700;
  }

  .red {
    @apply bg-rose-500 hover:bg-rose-700;
  }

  .blue {
    @apply bg-sky-500 hover:bg-sky-700;
  }

  .green, .red, .blue {
    min-width: 6rem;
    @apply flex items-center justify-center h-9 disabled:bg-gray-500 hover:disabled:cursor-not-allowed text-white font-semibold py-1 px-4 rounded;
  }
</style>