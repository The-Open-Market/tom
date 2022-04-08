<template>
  <NavBar/>
  <main class="container max-w-6xl mx-auto px-4 grow">
    <router-view/>
  </main>
  <Footer/>
</template>

<script>
import 'vue-toast-notification/dist/theme-sugar.css';

import NavBar from "@/components/navigation/NavBar.vue";
import Footer from "@/components/navigation/Footer.vue";

import { onBeforeMount } from 'vue';

import { listenToAccountChanges } from '@/services/ethereum';
import { setupKeysAsync } from '@/storage/keys';
import { getSellers } from '@/storage/seller';

export default {
  setup () {
    onBeforeMount(async () => {
      getSellers(); // sets up sellers and their keys
      await setupKeysAsync(); // sets up currently connected address keys
    });

    listenToAccountChanges(setupKeysAsync);
  },

  components: {
    NavBar,
    Footer
  }
};
</script>