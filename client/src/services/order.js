const OrderStatus = Object.freeze({
  Pending:     { value: 0, name: "Pending", color: "yellow" },
  Approved:    { value: 1, name: "Approved", color: "light-green" },
  Rejected:    { value: 2, name: "Rejected", color: "red" },
  Accepted:    { value: 3, name: "Accepted", color: "green" },
  PickedUp:    { value: 4, name: "Picked up", color: "green" },
  Transferred: { value: 5, name: "Transferred", color: "green" },
  InTransit:   { value: 6, name: "In transit", color: "green" },
  Received:    { value: 7, name: "Received", color: "green" },
  Delivered:   { value: 8, name: "Delivered", color: "green" },
  Completed:   { value: 9, name: "Completed", color: "blue" },
  Disputed:    { value: 10, name: "Disputed", color: "orange" },
  Cancelled:   { value: 11, name: "Cancelled", color: "red" }
})

const OrderStatusMap = {
  0: OrderStatus.Pending,
  1: OrderStatus.Approved,
  2: OrderStatus.Rejected,
  3: OrderStatus.Accepted,
  4: OrderStatus.PickedUp,
  5: OrderStatus.Transferred,
  6: OrderStatus.InTransit,
  7: OrderStatus.Received,
  8: OrderStatus.Delivered,
  9: OrderStatus.Completed,
  10: OrderStatus.Disputed,
  11: OrderStatus.Cancelled
}

export { OrderStatus, OrderStatusMap }
