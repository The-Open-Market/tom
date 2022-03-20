import { createApp } from 'vue'
import App from './App.vue'
import "./assets/css/tailwind.css"
import router from './router'
import VueToast from 'vue-toast-notification';

createApp(App).use(router).use(VueToast).mount('#app')