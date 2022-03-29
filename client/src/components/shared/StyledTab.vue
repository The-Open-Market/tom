<template>
  <Tab :name="name">
    <slot></slot>
  </Tab>
</template>

<script>
import { Tab } from 'vue3-tabs-component';

export default {
  name: "StyledTab",

  props: {
    name: {
      type: String,
      required: true
    }
  },

  components: {
    Tab
  }
}
</script>