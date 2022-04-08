<template>
  <div class="h-64">
    <img :src="`${publicPath}/Tom.png`" class="m-auto max-h-full"/>
  </div>
  <div class="flex flex-col gap-4">
    <h1>Welcome to TOM: The Open Market</h1>
    <p>TOM implements a city distribution framework for supply-chain management over an Ethereum smart contract, without any intermediate parties. We additionally provide a prototype web-application to demonstrate interacting with the smart contract.</p>
    <p>The contract allows connecting client, seller, and delivery service and providing the following functions:</p>
    <ul class="pl-8 list-disc">
      <li>Clients can select a seller and place an order</li>
      <li>Sellers can accept orders from a client and set a delivery reward and collateral required from the delivery service</li>
      <li>Delivery Service can accept an order and provides the collateral</li>
      <li>Seller transfers goods to the Delivery Service and Delivery Service picks up the goods from the Seller</li>
      <li>Delivery Service delivers the order to the Client and Client receives the order from the Delivery Service</li>
      <li>Additionally, the Client can tip the Delivery Service</li>
    </ul>
    <p>Payments and collateral are using an ERC20 token (EURTno Token). The EURTno tokens are distributed to the pre-defined accounts for development, and can additionally be minted by any address for usage of the web-application, using the dashboard in the application.</p>
    <p><b>Disclaimer:</b> Due to limitations in GitHub Pages, text rendering might not always be updated on new events, refresh the page to fix it.</p>
  </div>
</template>

<script>
export default {
  name: "Home",

  setup () {
    const publicPath = process.env.NODE_ENV === 'production' ? '/tom' : '';

    return {
      publicPath
    }
  }
}
</script>