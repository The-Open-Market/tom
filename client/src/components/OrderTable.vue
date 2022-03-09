<template>
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
                      Order ID
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
                    <th
                      scope="col"
                      class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th scope="col" class="relative px-6 py-3">
                      <span class="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody
                  v-if="orders && orders.length > 0"
                  class="bg-white divide-y divide-gray-200"
                >
                  <tr v-for="order in orders" :key="order.id">
                    <td class="px-6 py-4 whitespace-nowrap">
                      {{ order.id }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">xxx</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">
                        PLACEHOLDER
                      </div>
                      <div class="text-sm text-gray-500">TNO</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">∞</td>
                    <td class="px-6 py-4 whitespace-nowrap" v-if="order.status === 0">
                      <span
                        class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800"
                      > Pending
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap" v-if="order.status === 1">
                      <span
                        class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"
                      > Approved
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap" v-if="order.status === 2">
                      <span
                        class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800"
                      > Rejected
                      </span>
                    </td>
                    <td v-if="isSeller" class="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button v-if="order.status === 0" type="button"
                        class="text-green-700 hover:text-white transition-colors duration-200 border border-green-700 hover:bg-gren-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:border-green-500 dark:text-green-500 dark:hover:text-white dark:hover:bg-green-600 dark:focus:ring-green-800"
                        @click="approveOrder(order.id)" :disabled="order.status >= 1"
                      >
                          Approve
                      </button>
                      <button v-if="order.status === 0" type="button"
                          class="opacity-50 cursor-not-allowed text-red-700 hover:text-white transition-colors duration-200 border border-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-800"
                          @click="rejectOrder(order.id)" :disabled="order.status >= 1"
                      >
                        Reject
                      </button>
                    </td>
                    <td v-else>
                      <button v-if="order.status !== 3" type="button"
                          class="text-red-700 hover:text-white transition-colors duration-200 border border-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:border-red-500 dark:text-red-500 dark:hover:text-white dark:hover:bg-red-600 dark:focus:ring-red-800"
                          @click="acceptOrder(order.id)" :disabled="order.status === 3"
                      >
                          Accept
                      </button>
                    </td>
                  </tr>
                </tbody>
                <tbody v-else>
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

  emits: ["approveOrder", "rejectOrder", "acceptOrder"],

  props: {
    orders: [],
    isSeller: {
      type: Boolean,
      default: true
    }
  },
  
  setup(_, context) {
    const approveOrder = (orderId) => {
      context.emit("approveOrder", orderId);
    };

    const rejectOrder = (orderId) => {
      context.emit("rejectOrder", orderId);
    };

    const acceptOrder = (orderId) => {
      context.emit("acceptOrder", orderId);
    };

    return {
      acceptOrder,
      approveOrder,
      rejectOrder
    }
  }
 
};
</script>
