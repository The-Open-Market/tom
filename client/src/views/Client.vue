<template>
  <StyledTabs>
    <StyledTab name="My orders">
        <MyOrders/>
    </StyledTab>
    <StyledTab name="New order">
        <NewOrder/>
    </StyledTab>
  </StyledTabs>  
</template>

<script>
import StyledTabs from '@/components/shared/StyledTabs.vue';
import StyledTab from '@/components/shared/StyledTab.vue';
import MyOrders from '@/components/client/MyOrders.vue'
import NewOrder from '@/components/client/NewOrder.vue'

export default {
  name: "Client",

  components: {
    StyledTabs,
    StyledTab,
    MyOrders,
    NewOrder
  },
}
</script>

<style>

</style>
