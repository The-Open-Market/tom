<template>
  <h1 class="font-semibold text-2xl my-4">Allowance management</h1>
  <p class="mb-4">Manage your EURT tokens allowance to the contract</p>
  <div class="flex flex-col justify-between gap-4">
    <div class="flex items-end gap-4">
      <span class="text-sm">Current allowance:</span>
      <span v-if="currentAllowance">{{ currentAllowance }} <span class="italic font-semibold text-xs">EURT</span></span>
      <Loader v-else class="text-black"/>
    </div>
    <div class="flex items-end gap-4">
      <span class="text-sm">Set new allowance:</span>
      <MoneyInput class="small" title="Allowance" type="number" v-model="newAllowance"/>
      <Button class="small blue" text="Set" @click="setAllowance()"/>
    </div>
  </div>
</template>

<script>
import MoneyInput from '@/components/shared/MoneyInput';
import Button from '@/components/shared/Button';
import Loader from '@/components/shared/Loader';

import { ref, inject, onMounted } from 'vue';

import { approveTransaction, checkAllowance } from '@/endpoints/euroToken';
import { getSignerAddress, listenToAccountChanges } from '@/services/ethereum';

export default {
  name: "Allowance",

  setup() {
    const toast = inject('$toast');

    const currentAllowance = ref();
    const newAllowance = ref(0);
    
    const updateAllowance = async () => {
      const address = await getSignerAddress();
      currentAllowance.value = await checkAllowance(address);
      newAllowance.value = currentAllowance.value;
    };

    const setAllowance = async () => {
      if (!await approveTransaction(newAllowance.value)) {
        toast.error('Error approving euro transaction');
        return;
      }

      await updateAllowance();
    };

    onMounted(updateAllowance);
    listenToAccountChanges(updateAllowance);

    return {
      currentAllowance,
      newAllowance,
      setAllowance
    }
  },

  components: {
    MoneyInput,
    Button,
    Loader
  }
}
</script>