<template>
  <nav class="bg-white shadow-lg">
    <div class="max-w-6xl mx-auto px-4">
      <div class="flex justify-between">
        <!-- Primary Navbar items -->
        <div class="hidden md:flex space-x-7">
          <div class="flex items-center space-x-1">
            <router-link :to="`${publicPath}/`" class="py-4 px-2 text-gray-700 font-semibold hover:text-yellow-600 transition duration-100">
              Home
            </router-link>
            <router-link :to="`${publicPath}/client`" class="py-4 px-2 text-gray-700 font-semibold hover:text-yellow-600 transition duration-100">
              Client POV
            </router-link>
            <router-link :to="`${publicPath}/seller`" class="py-4 px-2 text-gray-700 font-semibold hover:text-yellow-600 transition duration-100">
              Seller POV
            </router-link>
            <router-link :to="`${publicPath}/delivery`" class="py-4 px-2 text-gray-700 font-semibold hover:text-yellow-600 transition duration-100">
              Delivery POV
            </router-link>
            <router-link :to="`${publicPath}/dashboard`" class="py-4 px-2 text-gray-700 font-semibold hover:text-yellow-600 transition duration-100">
              Dashboard
            </router-link>
          </div>
        </div>
        <!-- Secondary Navbar items -->
        <div class="flex items-center space-x-3">
          <span v-if="address" class="text-black text-sm font-semibold w-48 md:w-full truncate">{{ address }}</span>
          <a v-else class="font-semibold text-sm text-red-500 italic hover:underline" href="https://metamask.io/" target="_blank">Use a web3 enabled browser</a>
        </div>
        <!-- Mobile menu button -->
        <div class="md:hidden flex items-center py-4">
          <button class="outline-none mobile-menu-button" @click="toggleMobileMenu()">
            <svg class=" w-6 h-6 hover:text-yellow-600 "
                 x-show="!showMenu"
                 fill="none"
                 stroke-linecap="round"
                 stroke-linejoin="round"
                 stroke-width="2"
                 viewBox="0 0 24 24"
                 stroke="currentColor">
              <path d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
    <!-- mobile menu -->
    <div class="hidden mobile-menu">
      <ul class="">
        <li>
          <router-link :to="`${publicPath}/`" class="block text-sm px-2 py-4 text-gray-700 font-semibold hover:text-yellow-600 transition duration-100">
            Home
          </router-link>
        </li>
        <li>
          <router-link :to="`${publicPath}/client`" class="block text-sm px-2 py-4 text-gray-700 font-semibold hover:text-yellow-600 transition duration-100">
            Client POV
          </router-link>
        </li>
        <li>
          <router-link :to="`${publicPath}/seller`" class="block text-sm px-2 py-4 text-gray-700 font-semibold hover:text-yellow-600 transition duration-100">
            Seller POV
          </router-link>
        </li>
        <li>
          <router-link :to="`${publicPath}/delivery`" class="block text-sm px-2 py-4 text-gray-700 font-semibold hover:text-yellow-600 transition duration-100">
            Delivery POV
          </router-link>
        </li>
        <li>
          <router-link :to="`${publicPath}/dashboard`" class="block text-sm px-2 py-4 text-gray-700 font-semibold hover:text-yellow-600 transition duration-100">
            Dashboard
          </router-link>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script>
import { ref, onMounted } from 'vue';

import { getSignerAddress, listenToAccountChanges } from '@/services/ethereum';

export default {
  name: "NavBar",

  setup() {
    const publicPath = process.env.NODE_ENV === 'production' ? '/tom' : '';

    const address = ref("");
    const updateAddress = async () => {
      address.value = await getSignerAddress();
    };

    onMounted(updateAddress);
    listenToAccountChanges(updateAddress);

    const toggleMobileMenu = () => {
      const menu = document.querySelector(".mobile-menu");
      menu.classList.toggle("hidden");
    }

    return {
      publicPath,
      address,
      toggleMobileMenu,
      publicPath,
    };
  },
};
</script>

<style>
  .router-link-active {
    @apply text-yellow-600 border-b-2 border-yellow-600;
  }
</style>