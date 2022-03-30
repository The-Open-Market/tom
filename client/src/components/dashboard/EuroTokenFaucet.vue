<template>
  <h1 class="font-semibold text-2xl my-4">Euro token faucet</h1>
  <p class="mb-4">Get EURT tokens here</p>
  <div class="flex flex-col justify-between gap-4">
    <div class="flex items-end gap-4">
      <span class="text-sm">Amount:</span>
      <MoneyInput class="small" title="EURT" type="number" v-model="amount"/>
      <Button class="small blue" text="Get" @click="mintToken()"/>
    </div>
  </div>
</template>

<script>
import MoneyInput from '@/components/shared/MoneyInput.vue';
import Button from '@/components/shared/Button.vue';

import { ref, inject } from 'vue';
import { getEuroTokens } from '@/endpoints/euroToken';
import { getSignerAddress } from '@/services/ethereum';

export default {
  name: "EuroTokenFaucet",

  setup () {
    const toast = inject('$toast');

    const amount = ref(10);

    const mintToken = async () => {
      const address = await getSignerAddress();
      if (!await getEuroTokens(address, amount.value)) {
        toast.error('Error approving euro transaction');
      }
    };

    return {
      amount,
      mintToken
    }
  },

  components: {
    MoneyInput,
    Button
  }
}
</script>