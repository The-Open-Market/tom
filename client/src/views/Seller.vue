<template>
    <OrderTable :orders="this.pendingOrders" @approveOrder="approveOrder" @rejectOrder="rejectOrder"/>
</template>

<script>
import { reactive } from "vue";
import { getSmartContract } from '../services/ethereum'
import OrderTable from '../components/OrderTable.vue'

export default {
    name: 'Seller',

    setup() {
        const pendingOrders = reactive([])
        const approvedOrders = reactive([])
        const sellerAddress = "0x59Ce492d182688239C118AcFEb1A4872Ce3B1231";    

        const approveOrder = async(orderId) => {
            const { tnoEats } = await getSmartContract();
            await tnoEats.approveOrder(orderId);
            console.log("Seller " + sellerAddress + " approved order " + orderId); 

            // TODO: Figure out way of having pending and approved arrays
            pendingOrders.find(order=>order.id===orderId).status = "Approved";
        }

        const rejectOrder = async(orderId) => {
            const { tnoEats } = await getSmartContract();
            await tnoEats.rejectOrder(orderId);
            console.log("Seller " + sellerAddress + " rejected order " + orderId); 

            // TODO: Maybe remove the rejected orders from view?
            pendingOrders.find(order=>order.id===orderId).status = "Rejected";
        }

        return {
            pendingOrders,
            approvedOrders,
            approveOrder,
            rejectOrder
        }
    },

    components: {
        OrderTable
    },
    
    async mounted() {
        const { tnoEats } = await getSmartContract();
        const sellerAddress = "0x59Ce492d182688239C118AcFEb1A4872Ce3B1231";    
        let orders = await tnoEats.getOrdersBySeller(sellerAddress);

        const OrderApprovedEvents = await tnoEats.queryFilter("OrderApproved", 0); // On mount filter from block 0
        const OrderPlacedEvents = await tnoEats.queryFilter("OrderPlaced", 0);
        tnoEats.on('OrderPlaced', (seller, orderId, ipfsUrl) => {
            console.log("Order Placed event listener " + orderId);
            if(!this.pendingOrders.some(pendingOrder => pendingOrder.id === parseInt(orderId._hex, 16))) {
                this.pendingOrders.push({
                    id: parseInt(orderId._hex, 16),
                    status: "Pending",
                    ipfsUrl: ipfsUrl
                })
            }
        })

        // TODO: Refactor this, probably a better way of doing this
        for(var order in orders){
            let approved = false;
            let ipfsUrl = "PLACEHOLDER";

            // Check if orderId exists in OrderApprovedOrderApprovedEvents
            for(const event of OrderApprovedEvents) {
               if(parseInt(event.args.orderId._hex, 16) === parseInt(order)) {
                    approved = true;
                } 
            }
              // Get the ipfsURL from the placedOrderEvents
            for(const event of OrderPlacedEvents) {
               if(parseInt(event.args.orderId._hex, 16) === parseInt(order)) {
                    ipfsUrl = event.args.orderContentsUrl;
                } 
            }

            if(!approved && !this.pendingOrders.some(pendingOrder => pendingOrder.id === parseInt(order))) {
                this.pendingOrders.push({id: parseInt(order), status: "Pending", ipfsUrl: ipfsUrl});
            } else if (!this.pendingOrders.some(pendingOrder => pendingOrder.id === parseInt(order))) {
                console.log("Order " + order + " already Approved.");
                this.pendingOrders.push({id: parseInt(order), status: "Approved", ipfsUrl: ipfsUrl});
            }
        }
    }
}
</script>
<style>
</style>
