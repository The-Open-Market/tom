<template>
  <div :class="'grid grid-flow-col gap-4 grid-cols-' + nrColumns">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: "OrderGrid",

  props: {
    nrColumns: {
      type: Number,
      required: true
    }
  }
}
</script>