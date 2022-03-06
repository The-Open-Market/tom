<template>
    <div class="container">
        <h2 class="text-center mt-5">Order List</h2>
    </div>
    <div class="d-flex" v-for="(order, index) in this.orderIds" :key="index">
        <h3 class="text-center mt-4 text-sm text-gray-700">Order: {{order.id}}
            <button class="px-6 py-2 mt-3 transition ease-in duration-200 
            uppercase rounded-full hover:bg-gray-800 hover:text-white border-2 
            border-gray-900 focus:outline-none"
            @click="approveOrder(order.id)">
                Approve Order
            </button>
        </h3>
    </div>
</template>

<script>
import { reactive } from "vue";
import { getSmartContract } from '../services/ethereum'

export default {
    name: 'Seller',

    setup() {
        const orderIds = reactive([])
        const sellerAddress = "0x59Ce492d182688239C118AcFEb1A4872Ce3B1231";    

        const approveOrder = async(orderId) => {
            const { tnoEats } = await getSmartContract();
            await tnoEats.approveOrder(orderId);
            console.log("Seller " + sellerAddress + " approved order " + orderId); 

            // TEMP Checking if approved
            const events = await tnoEats.queryFilter("OrderApproved", 6);
            console.log("Approve event: " + events);
        }

        return {
            orderIds,
            approveOrder
        }
    },
    
    async mounted() {
        const { tnoEats } = await getSmartContract();
        const sellerAddress = "0x59Ce492d182688239C118AcFEb1A4872Ce3B1231";    

        let orders = await tnoEats.getOrdersBySeller(sellerAddress);
        console.log("Order ids: " + orders);

        for(var order in orders){
            /* const events = await tnoEats.queryFilter("OrderApproved", order); */
            // TODO: This would just not display already approved orders. 
            /* if(Object.keys(events).length === 0) { */
                /* console.log(order + " already Approved."); */
            /* } else { */
                this.orderIds.push({id: order})
            /* } */
        }
    }
}
</script>
<style>
</style>
