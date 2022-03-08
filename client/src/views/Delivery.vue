<template>
  This is the delivery POV.
  <div>
  </div>
</template>

<script>
import { reactive } from 'vue';
import { getSmartContract } from '../services/ethereum';
import { acceptOrder, pickupOrder, deliverOrder } from '../services/deliveryService';

export default {
  name: "Delivery",

  setup() {
    const currentOrders = reactive([]);
    const approvedOrders = reactive([]);

    const accept = async(orderId) => { 
      await acceptOrder(orderId);
    };

    const pickup = async(orderId) => { 
      await pickupOrder(orderId);
    };

    const deliver = async(orderId) => { 
      await deliverOrder(orderId);
    };
    
    const onOrderApproved = (orderId, sellerZipCode, clientZipCode) => {
      console.log("Order accepted event listener " + orderId);
      let id = parseInt(orderId._hex, 16);
      if(approvedOrders.all(acceptedOrder => acceptedOrder.id !== id)) {
        approvedOrders.push({
            id: id,
            status: "Pending",
            sellerZipCode: sellerZipCode,
            clientZipCode: clientZipCode 
        });
      }
    };

    return {
      currentOrder, 
      approvedOrders,
      accept,
      pickup,
      deliver,
      onOrderAccepted
    }
  },

  async mounted() {
    const { tnoEats } = await getSmartContract();

    tnoEats.on('OrderApproved', onOrderApproved);

    const address = "0x15f5319b330D8Da1E3a3852Fabcc60BFBA062919";
    let orderIds = await tnoEats.getOrdersByDeliveryService(address);
    

    const orderCompletedEvents = await tnoEats.queryFilter("OrderCompleted", 0);
    // get the currentOrder which is not completed
    for (var orderId in orderIds) {
      let id = parseInt(orderId._hex, 16);
      // FIXME: double for loop. Can't this be done more efficient?
      for (const event in orderCompletedEvents) {
        let eventOrderId = parseInt(event.args.orderId._hex, 16);
        if (id != eventOrderId) {
          currentOrders.push({
            id: id,
            
          })
        }
      }
    }

    // get the approved orders
    const OrderApprovedEvents = await tnoEats.queryFilter("OrderApproved", 0);
    // filter away the accepted orders
    const OrderAcceptedEvents = await tnoEats.queryFilter("OrderAccepted", 0);
    OrderApprovedEvents
    
    
  }
}
</script>
