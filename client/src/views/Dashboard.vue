<template>
<div class="flex flex-col space-y-4">
  <div clas="mb-4">
    <h1 class="mb-2">Buttons</h1>
    <div class="grid grid-cols-4 gap-4">
      <Button text="Green button" class="green"/>
      <Button text="Blue button" class="blue"/>
      <Button text="Red button" class="red"/>
      <Button text="Disabled button" :disabled="true"/>
      <Button text="Green transparent button" class="green transparent"/>
      <Button text="Blue transparent button" class="blue transparent"/>
      <Button text="Red transparent button" class="red transparent"/>
      <Button text="Disabled transparent button" class="red transparent" :disabled="true"/>
      <Button text="Green small button" class="green small"/>
      <Button text="Blue small button" class="blue small"/>
      <Button text="Red small button" class="red small"/>
      <Button text="Disabled small button" class="red small" :disabled="true"/>
      <Button text="Green trans. small button" class="green transparent small"/>
      <Button text="Blue trans. small button" class="blue transparent small"/>
      <Button text="Red trans. small button" class="red transparent small"/>
      <Button text="Disabled trans. small button" class="red transparent small" :disabled="true"/>
      <Button text="Default button"/>
    </div>
  </div>
  <div clas="mb-4">
    <h1 class="mb-2">Cards</h1>
    <div class="grid grid-cols-4 gap-4">
      <OrderCard :order="order1">
        <template v-slot:contents>
          <p>This is what the seller sees</p>
        </template>
        <template v-slot:controls>
          <Button text="Reject" class="red"/>
          <Button text="Approve" class="green"/>
        </template>
      </OrderCard>
      <OrderCard :order="order2">
        <template v-slot:contents>
          <p>This is what the delivery service sees</p>
        </template>
        <template v-slot:controls>
          <Button text="Accept" class="green"/>
        </template>
      </OrderCard>
      <OrderCard :order="order3">
        <template v-slot:contents>
          <p>This a cancelled order</p>
        </template>
      </OrderCard>
      <OrderCard :order="order4">
        <template v-slot:contents>
          <p>This is a completed</p>
        </template>
      </OrderCard>
      <OrderCard :order="order5">
        <template v-slot:contents>
          <p>This is a disputed order</p>
        </template>
      </OrderCard>
      <OrderCard :order="order1" loading="true">
        <template v-slot:contents>
          <p>This is a disputed order</p>
        </template>
      </OrderCard>
    </div>
  </div>  
</div>
</template>

<script>
import Button from "@/components/shared/Button.vue";
import OrderCard from "@/components/shared/OrderCard.vue";
import { OrderStatus } from '@/services/order';
import { inject } from 'vue';

export default {
  name: "Dashboard",

  setup() {
    const toast = inject('$toast');

    toast.success('Order placed.');
    toast.error('Error submitting order.');
    toast.warning('Warning order.');
    toast.info('Updated order status.');

    const order1 = {
      id: 1,
      status: OrderStatus.Pending
    }

    const order2 = {
      id: 2,
      status: OrderStatus.Approved
    }

    const order3 = {
      id: 3,
      status: OrderStatus.Cancelled
    }

    const order4 = {
      id: 4,
      status: OrderStatus.Completed
    }
    
    const order5 = {
      id: 5,
      status: OrderStatus.Disputed
    }

    return {
      order1,
      order2,
      order3,
      order4,
      order5
    }
  },
  
  components: {
    Button,
    OrderCard
  }
}
</script>