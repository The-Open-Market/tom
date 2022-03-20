<template>
  <NavBar />
  <main class="container mx-auto px-2 pt-6">
    <router-view />
  </main>
</template>

<script type="text/javascript">
import NavBar from "@/components/shared/NavBar.vue";
import 'vue-toast-notification/dist/theme-sugar.css';

export default {
  components: {
    NavBar,
  },
};
</script>