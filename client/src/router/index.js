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
    meta: { title: 'TNO-Eats - Dashboard' },
  },
  {
    path: "/seller",
    name: "Seller",
    component: Seller,
    meta: { title: 'TNO-Eats - Seller' },
  },
  {
    path: "/delivery",
    name: "Delivery",
    component: Delivery,
    meta: { title: 'TNO-Eats - Delivery' },
  },
  {
    path: "/client",
    name: "Client",
    component: Client,
    meta: { title: 'TNO-Eats - Client' },
  }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router
