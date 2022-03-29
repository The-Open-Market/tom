<template>
  <div class="flex flex-wrap items-end gap-4">
    <Input class="grow" type="text" v-model="modelValue.street" required title="Street" placeholder="Enter the street name"/>
    <div class="flex flex-wrap grow items-end gap-4">
      <Input class="min-w-16 grow" inputClass="appearance-none" type="number" v-model="modelValue.houseNumber" required title="House number" placeholder="Enter the house number"/>
      <Input class="min-w-16 grow" type="text" v-model="modelValue.houseAddition" title="House addition" placeholder="Enter the house addition"/>
      <Input class="grow" type="text" v-model="modelValue.zipCode" required title="Zip code" placeholder="Enter the zip code"/>
    </div>
  </div>
</template>

<script>
import Input from '@/components/shared/Input.vue';

export default {
  name: "AddressForm",

  props: {
    modelValue: {
      type: Object,
      required: true
    }
  },

  components: {
    Input
  }
}
</script>