<template>
    <OrderTable :orders="this.pendingOrders" />
</template>

<script>
import { reactive } from "vue";
import { getSmartContract } from '../services/ethereum'
import OrderTable from '../components/OrderTable.vue'

export default {
    name: 'Seller',

    setup() {
        const pendingOrders = reactive([])
        const sellerAddress = "0x59Ce492d182688239C118AcFEb1A4872Ce3B1231";    

        const approveOrder = async(orderId) => {
            const { tnoEats } = await getSmartContract();
            await tnoEats.approveOrder(orderId);
            console.log("Seller " + sellerAddress + " approved order " + orderId); 

            pendingOrders.find(order=>order.id===orderId).status = "Approved";
        }

        return {
            pendingOrders,
            approveOrder
        }
    },

    components: {
        OrderTable
    },
    
    // TODO: IPFS integration
    // TODO: with OrderPlaced query for the orderid and get the orderInfo
    // TODO: add listener to get newly placed orders so that we don't recheck entire chain from block 0 and need to refresh everytime
    async mounted() {
        const { tnoEats } = await getSmartContract();
        const sellerAddress = "0x59Ce492d182688239C118AcFEb1A4872Ce3B1231";    

        let orders = await tnoEats.getOrdersBySeller(sellerAddress);
        console.log("Order ids: " + orders);
        
        const events = await tnoEats.queryFilter("OrderApproved", 0); // On mount filter from block 0
        tnoEats.on('OrderPlaced', (seller, orderId, ipfsUrl) => {
            console.log(seller)
            console.log(ipfsUrl)
            this.pendingOrders.push({
                id: orderId
            })
        })

        for(var order in orders){
            let approved = false;

            // Check if orderId exists in events
            for(const event of events) {
               if(parseInt(event.args.orderId._hex, 16) === parseInt(order)) {
                    approved = true;
                } 
            }

            if(!approved) {
                this.pendingOrders.push({id: order, status: "Pending"});
            } else {
                console.log("Order " + order + " already Approved.");
                this.pendingOrders.push({id: order, status: "Approved"});
            }
        }
    }
}
</script>
<style>
</style>
