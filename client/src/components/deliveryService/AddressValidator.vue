<template>
  <div class="flex flex-wrap gap-4 items-end">
    <Input v-model="address" type="text" title="Address" placeholder="Address without separators and spaces" class="w-64"/>
    <Input v-model="salt" type="text" title="Salt" placeholder="Provided by the seller" class="w-36"/>
    <Input v-model="hash" type="text" title="Hash" placeholder="Copy and paste from the respective order" class="w-48 grow"/>

    <Button text="Validate" class="blue" :disabled="!address || !salt || !hash" @click="validateHash"/>

    <div class="ml-1 w-2">
      <div v-if="hashValidated">
        <span v-if="isHashValid" class="text-lg text-green-500">✓</span>
        <span v-else class="text-lg text-red-500">✗</span>
      </div>
    </div>
  </div>
</template>

<script>
import Button from '@/components/shared/Button.vue';
import Input from '@/components/shared/Input.vue';

import { ref } from 'vue';

import { isValidHash } from '@/utils/crypto';

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
    Button,
    Input
  }
}
</script>