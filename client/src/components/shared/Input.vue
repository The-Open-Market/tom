<template>
  <div class="flex flex-col focus-within:text-sky-700">
    <span class="text-xs font-medium">{{ title }}</span>
    <input :type="type" 
           :value="modelValue"
           @input="onChange"
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
    }
  },

  setup(props, context) {
    const onChange = (e) => {
      context.emit("update:modelValue", e.currentTarget.value);
    }
    return {
      onChange
    }
  }
}
</script>

<style>
  .small > input {
    @apply h-5 w-24;
  }
</style>