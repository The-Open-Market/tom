<template>
  <div class="flex flex-col focus-within:text-sky-700">
    <span class="text-xs font-medium">{{ title }}</span>
    <input type="text"
           v-model="valueDisplay"
           @blur="focus(false)"
           @focus="focus(true)"
           class="h-7 text-sm pl-1 border border-gray-400 focus:border-sky-700 outline-none rounded"
           />
  </div>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  name: "MoneyInput",

  emits: ["update:modelValue"],
  

  props: {
    modelValue: {
      required: true
    },
    title: {
      type: String,
      required: true
    },
  },

  setup(props, context) {
    const isFocused = ref(false);
    
    function focus(newValue) {
      // https://stackoverflow.com/questions/65108815/how-to-pass-a-ref-to-a-method-function-argument-without-unwrapping
      isFocused.value = newValue;
    }

    const valueDisplay = computed({
      // based on https://jsfiddle.net/mani04/bgzhw68m/
      get: function() {
        if (isFocused.value) {
          return props.modelValue.toString();
        } else {
          return "€ " + props.modelValue.toFixed(2);
        }
      },
      set: function(newValue) {
        let money = parseFloat(newValue.replace(/[^\d\.]/g, ""));
        if (isNaN(money)) {
          money = 0;
        }
        context.emit("update:modelValue", money);
      }
    });
    
    return {
      valueDisplay,
      focus,
    }
  }
}
</script>

<style>
  .small > input {
    @apply h-5 w-20;
  }
</style>