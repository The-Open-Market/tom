<template>
    <div class="container">
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

            orderIds.find(order=>order.id===orderId).status = "Approved";
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
        
        const events = await tnoEats.queryFilter("OrderApproved", 0); // Filter from block 0
        for(var order in orders){
            let approved = false;

            // Check if orderId exists in events
            for(const event of events) {
               if(parseInt(event.args.orderId._hex, 16) === parseInt(order)) {
                    approved = true;
                } 
            }

            if(!approved) {
                this.orderIds.push({id: order, status: "Pending"});
            } else {
                console.log("Order " + order + " already Approved.");
                this.orderIds.push({id: order, status: "Approved"});
            }
        }
    }
}
</script>
<style>
</style>
