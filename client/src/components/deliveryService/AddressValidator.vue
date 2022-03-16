<template>
  <div class="flex flex-wrap gap-4 items-end">
    <div class="flex flex-col w-80 focus-within:text-sky-700">
      <span class="text-xs font-medium">Address</span>
      <input type="text" v-model="address" class="h-7 text-sm pl-1 border border-gray-400 focus:border-sky-700 outline-none rounded"/>
    </div>
    <div class="flex flex-col w-32 focus-within:text-sky-700">
      <span class="text-xs font-medium">Salt</span>
      <input type="text" v-model="salt" class="h-7 text-sm pl-1 border border-gray-400 focus:border-sky-700 outline-none rounded"/>
    </div>
    <div class="flex flex-col w-48 focus-within:text-sky-700">
      <span class="text-xs font-medium">Hash</span>
      <input type="text" v-model="hash" class="h-7 text-sm pl-1 border border-gray-400 focus:border-sky-700 outline-none rounded"/>
    </div>

    <Button text="Validate" styles="blue" :disabled="!address || !salt || !hash" @click="validateHash"/>

    <div v-if="hashValidated" class="ml-1">
      <span v-if="isHashValid" class="text-lg text-green-500">✓</span>
      <span v-else class="text-lg text-red-500">✗</span>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

import Button from '@/components/shared/Button.vue';
import { isValidHash } from '@/services/crypto';

export default {
  name: "AddressValidator",

  setup() {
    const address = ref("");
    const salt = ref("");
    const hash = ref("");
    const isHashValid = ref(false);
    const hashValidated = ref(false);

    const validateHash = async () => {
      if (address.value && salt.value && hash.value) {
        isHashValid.value = await isValidHash(address.value, salt.value, hash.value);
        hashValidated.value = true;
      }
    }

    return {
      address,
      salt,
      hash,
      isHashValid,
      validateHash,
      hashValidated
    }
  },

  components: {
    Button
  }
}
</script>