<template>
  <div class="flex flex-wrap gap-4">
    <div class="flex flex-col grow gap-4 min-w-4/5">
      <Input v-model="seller.name" required type="text" title="Name" placeholder="The seller's name" />
      <Input v-model="seller.etherAddress" required type="text" title="Ethereum address" placeholder="The seller's wallet address" />
      <Input v-model="seller.phone" type="text" title="Phone" placeholder="Contact phone number" />
      <Input v-model="seller.email" type="text" title="Email" placeholder="Contact email address" />
      <Input v-model="seller.description" type="textarea" title="Description" placeholder="Describe the seller" />
      <Input v-model="seller.imageUrl" type="text" title="Image URL" placeholder="Image" />
      <AddressForm v-model="seller.address"/>
    </div>
    <div class="flex lg:flex-col grow lg:grow-0 justify-between">
      <Button text="Save" class="order-last lg:order-first green" @click="save"/>
      <Button v-if="typeof seller.id !== 'undefined'" text="Delete" class="red" @click="remove"/>
    </div>
  </div>
</template>

<script>
import Input from '@/components/shared/Input.vue';
import Button from '@/components/shared/Button.vue';
import AddressForm from '@/components/shared/AddressForm.vue';

import { reactive } from 'vue';

import { saveSeller, removeSeller } from '@/storage/seller';

export default {
  name: "SellerForm",

  emits: ["sellerSaved"],

  props: {
    model: {
      type: Object,
      default: undefined
    }
  },

  setup (props, context) {
    /* make it reactive, but if model is provided, 
      the reactivity must be separated from the provided model */
    const seller = reactive({
      id: props.model ? props.model.id : undefined,
      name: props.model ? props.model.name : undefined,
      etherAddress: props.model ? props.model.etherAddress : undefined,
      phone: props.model ? props.model.phone : undefined,
      email: props.model ? props.model.email : undefined,
      description: props.model ? props.model.description : undefined,
      imageUrl: props.model ? props.model.imageUrl : undefined,
      address: {
        street: props.model ? props.model.address.street : undefined,
        houseNumber: props.model ? props.model.address.houseNumber : undefined,
        houseAddtion: props.model ? props.model.address.houseAddition : undefined,
        zipCode: props.model ? props.model.address.zipCode : undefined
      }
    });

    const save = () => {
      if (saveSeller(seller)) {
        context.emit("sellerSaved");
      }
    }

    const remove = () => {
      removeSeller(seller.id);
    }

    return {
      seller,
      save,
      remove
    }
  },

  components: {
    Input,
    Button,
    AddressForm
  }
}
</script>