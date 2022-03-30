<template>
  <Allowance/>
  <SellerList/>
</template>

<script>
import SellerList from '@/components/dashboard/SellerList.vue';
import Allowance from '@/components/dashboard/Allowance.vue';

export default {
  name: "Dashboard",

  components: {
    Allowance,
    SellerList
  }
}
</script>