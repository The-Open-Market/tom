<template>
  <Tabs wrapper-class="" 
        panels-wrapper-class="" 
        nav-class="flex justify-center gap-8 py-4 border-y mb-4" 
        nav-item-class="text-gray-700 font-semibold hover:text-yellow-600 transition duration-100"
        nav-item-active-class="text-yellow-600"
        nav-item-disabled-class=""
        nav-item-link-class=""
        nav-item-link-active-class=""
        nav-item-link-disabled-class=""
        :options="{ useUrlFragment:false }">
    <slot></slot>
  </Tabs>
</template>

<script>
import { Tabs } from 'vue3-tabs-component';

export default {
  name: "StyledTabs",

  components: {
    Tabs
  }
}
</script>