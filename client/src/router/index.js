import { createWebHistory, createRouter } from "vue-router"
import Home from "@/views/Home.vue"
import Dashboard from "@/views/Dashboard.vue"
import Client from "@/views/Client.vue"
import Seller from "@/views/Seller.vue"
import Delivery from "@/views/Delivery.vue"
import Styles from "@/views/Styles.vue"

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
    meta: {
      title: 'Home',
    },
  },
  {
    path: "/dashboard",
    name: "Dashboard",
    component: Dashboard,
    meta: {
      title: 'Dashboard',
    },
  },
  {
    path: "/seller",
    name: "Seller",
    component: Seller,
    meta: { 
      title: 'Seller',
    },
  },
  {
    path: "/delivery",
    name: "Delivery",
    component: Delivery,
    meta: { 
      title: 'Delivery',
    },
  },
  {
    path: "/client",
    name: "Client",
    component: Client,
    meta: { 
      title: 'Client',
    },
  },
  {
    path: "/styles",
    name: "Styles",
    component: Styles,
    meta: { 
      title: 'Styles',
    },
  }
]

const router = createRouter({
    history: createWebHistory(),
    routes
});

router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title}`;
  next();
});

export default router
