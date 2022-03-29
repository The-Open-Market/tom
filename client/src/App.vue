<template>
  <NavBar />
  <main class="container max-w-6xl mx-auto px-4">
    <router-view />
  </main>
</template>

<script>
import 'vue-toast-notification/dist/theme-sugar.css';

import NavBar from "@/components/navigation/NavBar.vue";

import { onBeforeMount } from 'vue';

import { setupKeysAsync } from '@/storage/keys';
import { getSellers } from '@/storage/seller';

export default {
  setup () {
    onBeforeMount(async () => {
      getSellers();
      await setupKeysAsync();
    });

    window.ethereum.on('accountsChanged', async (accounts) => {
      await setupKeysAsync();
    });
  },

  components: {
    NavBar,
  }
};
</script>