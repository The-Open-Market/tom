<template>
  <button @click="clicked" :class="styles" :disabled="disabled">
    {{ text }}
  </button>
</template>

<script>
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
    @apply h-9 disabled:bg-gray-500 hover:disabled:cursor-not-allowed text-white font-semibold py-1 px-4 rounded;
  }
</style>