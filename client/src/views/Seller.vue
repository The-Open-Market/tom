<template>
    <OrderGrid :nrColumns="3">
        <OrderContainer title="Pending orders">
            <OrderCard v-for="order in pendingOrders" :key="order.id" :order="order">
                <template v-slot:contents>
                    <p>TODO: add contents from IPFS</p>
                </template>
                <template v-slot:controls>
                    <Button text="Reject" styles="red" @click="reject(order.id)"/>
                    <Button text="Approve" styles="green" @click="approve(order.id)"/>
                </template>
            </OrderCard>
        </OrderContainer>
        <OrderContainer title="Approved orders">
            <OrderCard v-for="order in approvedOrders" :key="order.id" :order="order">
                <template v-slot:contents>
                    <p>TODO: add contents from IPFS</p>
                </template>
            </OrderCard>
        </OrderContainer>
    </OrderGrid>

    <OrderContainer title="Rejected orders" flow="row">
        <OrderCard v-for="order in rejectedOrders" :key="order.id" :order="order">
            <template v-slot:contents>
                <p>TODO: add contents from IPFS</p>
            </template>
        </OrderCard>
    </OrderContainer>
</template>

<script>
import OrderCard from '@/components/shared/OrderCard.vue';
import Button from '@/components/shared/Button.vue';
import OrderGrid from '@/components/shared/OrderGrid.vue';
import OrderContainer from '@/components/shared/OrderContainer.vue';

import { reactive, onMounted } from "vue";
import { OrderStatus } from '@/services/order';
import { getOrdersBySeller } from '@/services/smartContract';
import { getSmartContract } from '@/services/ethereum';
import { approveOrder, rejectOrder } from '@/services/seller';

export default {
    name: 'Seller',

    setup() {
        const pendingOrders = reactive([]);
        const approvedOrders = reactive([]);
        const rejectedOrders = reactive([]);

        const approve = async(orderId) => { 
            if (await approveOrder(orderId)) {
                const index = pendingOrders.findIndex(order => order.id === orderId);
                pendingOrders[index].status = OrderStatus.Approved;
                approvedOrders.push(pendingOrders.find(order => order.id === orderId));
                pendingOrders.splice(index, 1);
            }
        }

        const reject = async(orderId) => {
            if (await rejectOrder(orderId)) {
                const index = pendingOrders.findIndex(order => order.id === orderId);
                pendingOrders[index].status = OrderStatus.Rejected;
                rejectedOrders.push(pendingOrders.find(order => order.id === orderId));
                pendingOrders.splice(index, 1);
            }
        }

        const onOrderPending = (id, client, seller, ipfsUrl) => {
            pendingOrders.push({
                id: parseInt(id._hex, 16),
                status: OrderStatus.Pending,
                client,
                seller,
                ipfsUrl
            });
        }

        onMounted(async () => {
            const address = "0x59Ce492d182688239C118AcFEb1A4872Ce3B1231";    
            const orders = await getOrdersBySeller(address);

            orders.filter(order => {
                if (order.status.value === OrderStatus.Pending.value) {
                    pendingOrders.push(order);
                } else if (order.status.value === OrderStatus.Approved.value) {
                    approvedOrders.push(order);
                } else if (order.status.value === OrderStatus.Rejected.value) {
                    rejectedOrders.push(order);
                }
            });

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
        OrderGrid,
        OrderContainer,
        OrderCard,
        Button,
    },
}
</script>
<style>
</style>
