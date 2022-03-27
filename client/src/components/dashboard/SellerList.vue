<template>
  <h1 class="font-semibold text-2xl mb-2">Seller management</h1>
  <p class="mb-4">These sellers are saved in your browser's local storage</p>
  <div class="overflow-x-auto rounded shadow drop-shadow">
    <table class="w-full text-sm text-left text-gray-500">
      <thead class="text-xs text-gray-700 uppercase bg-gray-200">
        <tr>
          <th scope="col" class="px-6 py-3">
            Name
          </th>
          <th scope="col" class="px-6 py-3">
            Phone
          </th>
          <th scope="col" class="px-6 py-3">
            Email
          </th>
          <th scope="col" class="px-6 py-3">
            Address
          </th>
          <th scope="col" class="px-6 py-3">
          </th>
        </tr>
      </thead>
      <tbody>
        <template v-for="seller in sellers" :key="seller.id">
          <tr class="bg-white">
            <th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
              {{ seller.name }}
            </th>
            <td class="px-6 py-4">
              {{ seller.phone }}
            </td>
            <td class="px-6 py-4">
              {{ seller.email }}
            </td>
            <td class="px-6 py-4">
              {{ addressToString(seller.address) }}
            </td>
            <td class="px-6 py-4 flex gap-2">
              <Button text="Edit" class="blue ml-auto" @click="setEditId(seller.id)"/>
            </td>
          </tr>
          <tr class="bg-white border-b">
            <td class="px-6 overflow-hidden" colspan="100%">
              <Transition name="seller-form">
                <SellerForm v-if="editId === seller.id" class="pb-4" :model="seller" @sellerSaved="setEditId(seller.id)"/>
              </Transition>
            </td>
          </tr>
        </template>
        <tr class="bg-white">
          <td class="px-6 py-4" colspan="100%">
            <Button text="Add" class="green ml-auto" @click="toggleCreate()"/>
          </td>
        </tr>
        <tr class="bg-white border-b">
          <td class="px-6 overflow-hidden" colspan="100%">
            <Transition name="seller-form">
              <SellerForm v-if="create" class="pb-4" @sellerSaved="toggleCreate()"/>
            </Transition>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import Button from '@/components/shared/Button.vue';
import SellerForm from '@/components/dashboard/SellerForm.vue';

import { ref } from 'vue';

import { getSellers } from '@/storage/seller';
import { addressToString } from '@/utils/address';

export default {
  name: "SellerList",

  setup () {
    const sellers = getSellers();

    const editId = ref();
    const setEditId = (id) => {
      if (editId.value === id) {
        editId.value = null;
      } else {
        create.value = false;
        editId.value = id;
      }
    }

    const create = ref(false);
    const toggleCreate = () => {
      setEditId(editId.value);
      create.value = !create.value;
    }
    
    return {
      sellers,
      editId,
      setEditId,
      create,
      toggleCreate,
      addressToString
    }
  },

  components: {
    Button,
    SellerForm
  }
 }
</script>

<style>
  .seller-form-enter-active,
  .seller-form-leave-active {
    transition: all 0.2s ease-in-out;
  }

  .seller-form-enter-from,
  .seller-form-leave-to {
    transform: translateY(-100%);
    opacity: 0;
    height: 0;
  }

  .seller-form-enter-to,
  .seller-form-leave-from {
    transform: translateY(0);
    opacity: 100;
    height: 100%;
  }
</style>