<template>
  <NavBar />
  <main class="container max-w-6xl mx-auto px-4 pt-6">
    <router-view />
  </main>
</template>

<script>
import NavBar from "@/components/navigation/NavBar.vue";

import 'vue-toast-notification/dist/theme-sugar.css';

export default {
  components: {
    NavBar,
  },
};
</script>