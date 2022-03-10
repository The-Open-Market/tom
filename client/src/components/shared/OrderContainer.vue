<template>
  <div class="tno-grid-column">
    <h1 class="mb-2">{{title}}</h1>
    <div :class="'grid ' + (isRow ? 'grid-cols-4 grid-flow-row' : 'grid-cols-1') + ' gap-4'">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "OrderContainer",

  props: {
    title: {
      type: String,
      required: true
    },
    flow: {
      type: String,
      default: "col"
    }
  },

  setup(props) {
    const isRow = props.flow === "row";

    return {
      isRow
    }
  }
}
</script>