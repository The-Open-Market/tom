<template>
  <div id="summary" class="w-full py-10">
    <h2 class="font-semibold border-b pb-8">Checkout</h2>
    <div class="flex justify-between mt-10 mb-5">
      <span class="font-semibold text-sm uppercase">Items {{ itemAmount }}</span>
      <span class="font-semibold text-sm">€ {{ totalCost }}</span>
    </div>
    <AddressForm v-model="address"/>
    <div class="flex justify-between items-center border-t mt-8">
      <div class="flex font-semibold justify-between py-6 text-sm uppercase">
        <span>Total cost</span>
        <span>€ {{ totalCost }}</span>
      </div>
      <Button @click="checkout" text="Order now!" class="blue transparent" :disabled="!isOrderValid" :loading="loading"/>
    </div>
  </div>
</template>

<script>
import Input from '@/components/shared/Input.vue';
import Button from '@/components/shared/Button.vue';
import AddressForm from '@/components/shared/AddressForm.vue';

import { ref, computed } from 'vue';

export default {
  name: "Checkout",

  props: {
    cartContents: {
      type: Array,
      default: []
    },
    address: {
      type: Object,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  emits: ["checkout"],

  setup(props, context) {
    const itemAmount = computed(() => {
      return props.cartContents.map(x => x.quantity).reduce((prev, current) => prev + current, 0);
    });
    
    const totalCost = computed(() => {
      return (Math.round(props.cartContents.map(x => x.quantity * x.price).reduce((prev, current) => prev + current, 0) * 100) / 100).toFixed(2);
    });

    const isOrderValid = computed(() => {
      return props.address.street && props.address.houseNumber && props.address.zipCode && itemAmount.value > 0 && totalCost.value > 0;
    });

    const checkout = () => {
      if (isOrderValid) {
        context.emit("checkout", 
          { street: props.address.street,
            hnr: props.address.houseNumber,
            hnr_add: props.address.houseAddition,
            zip: props.address.zipCode 
          });
      }
    }

    return {
       itemAmount,
       totalCost,
       isOrderValid,
       checkout
     }
  },
  
  components: {
    Input,
    Button,
    AddressForm
  }
}
</script>