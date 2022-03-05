<template>
  This is the seller POV.
</template>

<script>
import { getSmartContract } from '../services/ethereum'

export default {
  name: "Seller",

  async setup() {
    const { tnoEats } = await getSmartContract();

    // let orders = reactive([]);

    // tnoEats.on("OrderPlaced", (seller, orderId, orderContentsUrl, event) => {
    //   console.log(seller, orderId, orderContentsUrl, event);
    // });

    // TODO: Get seller addresses automatically
    // const sellerAddress = "0x9777474265fa526d7C2271B72c9c81275e44D99d";    
    const clientAddress = "0x3096cc43379D09d411A6f979E00e29f057929579";
    const events = await tnoEats.queryFilter("OrderPlaced", 0);
    // const completed = await tnoEats.queryFilter("OrderCompleted", 0);

    console.log(events);

    console.log(tnoEats);

    let orderIds = await tnoEats.getOrdersByClient(clientAddress);

    console.log("Order ids:");
    console.log(orderIds);
  }
}
</script>