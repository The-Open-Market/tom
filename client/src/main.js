import { createApp } from 'vue'
import "./assets/css/tailwind.css"
import VueToast from 'vue-toast-notification';

import App from '@/App.vue'
import router from '@/router'

createApp(App).use(router).use(VueToast).mount('#app')