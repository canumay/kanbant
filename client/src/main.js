import '@babel/polyfill'
import 'mutationobserver-shim'
import Vue from 'vue'
import './plugins/bootstrap-vue'
import App from './App.vue'
import VueRouter from 'vue-router';
import routes from './routes';
import axios from 'axios';
import moment from 'vue-moment';
import 'vue-simple-context-menu/dist/vue-simple-context-menu.css'
import VueSimpleContextMenu from 'vue-simple-context-menu'
import VueSweetalert2 from 'vue-sweetalert2';
const axiosInstance = axios.create({
  withCredentials: true,
  baseURL: process.env.VUE_APP_BASE_URL
})

Vue.config.productionTip = false

Vue.use(VueRouter);

Vue.use(moment);

Vue.component('vue-simple-context-menu', VueSimpleContextMenu)

Vue.use(VueSweetalert2);

Vue.prototype.$http = axiosInstance;

const router = new VueRouter({
  mode: 'history',
  routes,
});


new Vue({
  router,
  render: h => h(App)
}).$mount('#app')