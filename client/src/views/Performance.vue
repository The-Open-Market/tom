<template>
  <h1>Performance</h1>
</template>

<script>
import { onMounted } from 'vue';
import { measurePerformance } from '@/utils/performance';

export default {
  name: "Performance",

  setup() {
    onMounted(measurePerformance);

    return {}
  }
}
</script>