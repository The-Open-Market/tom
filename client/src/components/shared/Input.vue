<template>
  <div class="flex flex-col focus-within:text-sky-700">
    <span class="text-xs font-medium">{{ title }}</span>
    <input :type="type"
           :value="modelValue"
           :step="step"
           @input="onInput"
           :placeholder="placeholder"
           class="h-7 text-sm pl-1 border border-gray-400 focus:border-sky-700 outline-none rounded"/>
  </div>
</template>

<script>
export default {
  name: "Input",

  emits: ["update:modelValue"],

  props: {
    modelValue: {
      required: true
    },
    type: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    placeholder: {
      type: String
    },
    step: {
      type: Number,
      default: 0.01
    }
  },

  setup(props, context) {
    const onInput = (e) => {
      context.emit("update:modelValue", e.currentTarget.value);
    }
    return {
      onInput
    }
  }
}
</script>

<style>
  .small > input {
    @apply h-5 w-20;
  }
</style>