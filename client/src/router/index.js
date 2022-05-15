import { createWebHistory, createRouter } from "vue-router"
import Home from "@/views/Home.vue"
import Dashboard from "@/views/Dashboard.vue"
import Client from "@/views/Client.vue"
import Seller from "@/views/Seller.vue"
import Delivery from "@/views/Delivery.vue"
import Styles from "@/views/Styles.vue"
import Performance from "@/views/Performance.vue"

const publicPath = process.env.NODE_ENV === 'production' ? '/tom' : '';

const routes = [
  {
    path: `${publicPath}/`,
    name: "Home",
    component: Home,
    meta: {
      title: 'Home',
    },
  },
  {
    path: `${publicPath}/dashboard`,
    name: "Dashboard",
    component: Dashboard,
    meta: {
      title: 'Dashboard',
    },
  },
  {
    path: `${publicPath}/seller`,
    name: "Seller",
    component: Seller,
    meta: { 
      title: 'Seller',
    },
  },
  {
    path: `${publicPath}/delivery`,
    name: "Delivery",
    component: Delivery,
    meta: { 
      title: 'Delivery',
    },
  },
  {
    path: `${publicPath}/client`,
    name: "Client",
    component: Client,
    meta: { 
      title: 'Client',
    },
  },
  {
    path: `${publicPath}/styles`,
    name: "Styles",
    component: Styles,
    meta: { 
      title: 'Styles',
    },
  },
  {
    path: `${publicPath}/performance`,
    name: "Performance",
    component: Performance,
    meta: { 
      title: 'Performance',
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
