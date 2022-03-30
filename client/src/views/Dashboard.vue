<template>
  <EuroTokenFaucet/>
  <Allowance/>
  <SellerList/>
</template>

<script>
import SellerList from '@/components/dashboard/SellerList.vue';
import Allowance from '@/components/dashboard/Allowance.vue';
import EuroTokenFaucet from '@/components/dashboard/EuroTokenFaucet.vue';

export default {
  name: "Dashboard",

  components: {
    Allowance,
    SellerList,
    EuroTokenFaucet
  }
}
</script>