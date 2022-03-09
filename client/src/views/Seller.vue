<template>
    <OrderTable :orders="approvedOrders" :isSeller="true"/>
    <OrderTable :orders="pendingOrders" :isSeller="true" @approveOrder="approve" @rejectOrder="reject"/>
</template>

<script>
import { reactive, onMounted } from "vue";
import { getOrdersBySeller } from '../services/smartContract';
import { getSmartContract } from '../services/ethereum'
import OrderTable from '../components/OrderTable.vue'
import { approveOrder, rejectOrder } from '../services/seller'

export default {
    name: 'Seller',

    setup() {
        const pendingOrders = reactive([]);
        const approvedOrders = reactive([]);
        const rejectedOrders = reactive([]);

        const approve = async(orderId) => { 
            await approveOrder(orderId);
            approvedOrders.push(pendingOrders.find(order => order.id === orderId));
            pendingOrders.remove(pendingOrders.findIndex(order => order.id === orderId));
        }

        const reject = async(orderId) => {
            await rejectOrder(orderId);
            rejectedOrders.push(pendingOrders.find(order => order.id === orderId));
            pendingOrders.remove(pendingOrders.findIndex(order => order.id === orderId));
        }

        const onOrderPending = (id, client, seller, ipfsUrl) => {
            pendingOrders.push({
                id: parseInt(id._hex, 16),
                status: 0,
                client,
                seller,
                ipfsUrl
            });
        }

        onMounted(async () => {
            const address = "0x59Ce492d182688239C118AcFEb1A4872Ce3B1231";    
            const orders = await getOrdersBySeller(address);
            
            // TODO: replace status with enum
            for (const order in orders.filter(order => order.status === 0)) {
                pendingOrders.push(order);
            }

            for (const order in orders.filter(order => order.status === 1)) {
                approvedOrders.push(order);
            }

            for (const order in orders.filter(order => order.status === 2)) {
                rejectedOrders.push(order);
            }

            const { tnoEats } = await getSmartContract();
            tnoEats.on('OrderPending', onOrderPending);
        });

        return {
            onOrderPending,
            pendingOrders,
            approvedOrders,
            rejectedOrders,
            approve,
            reject
        }
    },

    components: {
        OrderTable
    },
}
</script>
<style>
</style>
