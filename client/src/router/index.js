import { createWebHistory, createRouter } from "vue-router"
import Dashboard from "@/views/Dashboard.vue"
import Client from "@/views/Client.vue"
import Seller from "@/views/Seller.vue"
import Delivery from "@/views/Delivery.vue"

const routes = [
  {
    path: "/",
    name: "Dashboard",
    component: Dashboard,
  },
  {
    path: "/seller",
    name: "Seller",
    component: Seller,
  },
  {
    path: "/delivery",
    name: "Delivery",
    component: Delivery,
  },
  {
    path: "/client",
    name: "Client",
    component: Client,
  },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router