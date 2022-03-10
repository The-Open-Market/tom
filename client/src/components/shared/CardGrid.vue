<template>
  <div clas="mb-4">
    <h1 class="mb-2">{{title}}</h1>
    <div class="grid grid-cols-4 gap-4">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: "CardGrid",

  props: {
    title: {
      type: String,
      required: true
    }
  }
}
</script>