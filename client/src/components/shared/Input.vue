<template>
  <div class="flex flex-col focus-within:text-sky-700">
    <label class="text-xs font-medium">
      {{ title }}<span v-if="required" class="text-red-500">*</span>
    </label>

    <template v-if="type === 'textarea'">
      <textarea :value="modelValue"
                @input="onInput" 
                :placeholder="placeholder" 
                :class="`text-sm pl-1 border border-gray-400 focus:border-sky-700 outline-none rounded ${inputClass}`"
                rows="5"/>
    </template>
    <template v-else>
      <input :type="type"
           :value="modelValue"
           :step="step"
           @input="onInput"
           :placeholder="placeholder"
           :class="`h-7 text-sm pl-1 border border-gray-400 focus:border-sky-700 outline-none rounded ${inputClass}`"/>
    </template>
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
    },
    required: {
      type: Boolean,
      default: false
    },
    inputClass: {
      type: String
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