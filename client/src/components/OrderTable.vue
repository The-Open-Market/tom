<template>
  <!--<div class="container">
        <h2 class="text-center mt-5">Order List</h2>
    </div>
    <div class="d-flex" v-for="(order, index) in this.orderIds" :key="index">
        <h3 class="text-center mt-4 text-sm text-gray-700">Order: {{order.id}}
            <button class="px-6 py-2 mt-3 transition ease-in duration-200 
            uppercase rounded-full hover:bg-gray-800 hover:text-white border-2 
            border-gray-900 focus:outline-none"
            @click="approveOrder(order.id)" v-if="order.status==='Pending'">
                Approve Order
            </button>
            <button class="px-6 py-2 mt-3 uppercase rounded-full border-2 border-gray-900"
            v-if="order.status==='Approved'">
            Approved
            </button>
        </h3>
    </div>-->
  <div class="bg-white">
    <div
      class="max-w-2xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:max-w-7xl lg:px-8"
    >
      <div class="flex flex-col">
        <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div
            class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8"
          >
            <div
              class="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg"
            >
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Pending orders
                    </th>
                    <th
                      scope="col"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Distance
                    </th>
                    <th
                      scope="col"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Products
                    </th>
                    <th
                      scope="col"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Price
                    </th>
                    <th scope="col" class="relative px-6 py-3">
                      <span class="sr-only">Accept</span>
                    </th>
                    <th scope="col" class="relative px-6 py-3">
                      <span class="sr-only">Reject</span>
                    </th>
                  </tr>
                </thead>
                <tbody
                  v-if="orders && orders.length > 0"
                  class="bg-white divide-y divide-gray-200"
                >
                  <tr v-for="order in orders" :key="order.id">
                    <td class="px-6 py-4 whitespace-nowrap">
                      <!--<div class="flex items-center">
                                <div class="flex-shrink-0 h-10 w-10">
                                    <img class="h-10 w-10 rounded-full" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=4&w=256&h=256&q=60" alt="">
                                </div>
                                <div class="ml-4">
                                    <div class="text-sm font-medium text-gray-900">Jane Cooper</div>
                                    <div class="text-sm text-gray-500">jane.cooper@example.com</div>
                                </div>
                                </div>-->
                      {{ order.id }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">xxx</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">
                        Regional Paradigm Technician
                      </div>
                      <div class="text-sm text-gray-500">Optimization</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span
                        class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"
                      >
                      </span>
                    </td>
                    <td
                      class="px-4 py-4 whitespace-nowrap text-right text-sm font-medium"
                    >
                      <button
                        type="button"
                        class="text-green-700 hover:text-white transition-colors duration-200 border border-green-700 hover:bg-gren-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:border-green-500 dark:text-green-500 dark:hover:text-white dark:hover:bg-green-600 dark:focus:ring-green-800"
                      >
                        Accept
                      </button>
                    </td>
                    <td
                      class="px-4 py-4 whitespace-nowrap text-right text-sm font-medium"
                    >
                      <button
                        type="button"
                        class="text-red-700 hover:text-white transition-colors duration-200 border border-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-800"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                </tbody>
                <tbody velse>
                  <td>No entries yet</td>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "OrderTable",
  props: {
    orders: [],
  },
 
};
</script>
