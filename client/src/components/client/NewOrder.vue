<template>
  <Sellers v-if="typeof seller.id === 'undefined'" @selected="setSeller"/>
  <OrderPlacement v-else :seller="seller" @back="unsetSeller"/>
</template>

<script>
import Sellers from '@/components/client/Sellers.vue';
import OrderPlacement from '@/components/client/OrderPlacement.vue'

import { reactive } from 'vue';

export default {
  name: "NewOrder",

  setup(_, context) {
    const seller = reactive({});

    const setSeller = (selectedSeller) => {
      Object.assign(seller, selectedSeller);
    }

    const unsetSeller = () => {
      Object.keys(seller).forEach(key => seller[key] = undefined);
    }

    return {
      seller,
      setSeller,
      unsetSeller
    }
  },

  components: {
    Sellers,
    OrderPlacement
  }
}
</script>