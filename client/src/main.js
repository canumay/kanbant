import '@babel/polyfill'
import 'mutationobserver-shim'
import Vue from 'vue'
import './plugins/bootstrap-vue'
import App from './App.vue'
import VueRouter from 'vue-router';
import routes from './routes';
import axios from 'axios';
import moment from 'vue-moment';

const axiosInstance = axios.create({
  withCredentials: true,
  baseURL: "http://127.0.0.1:3000/api"
})

Vue.config.productionTip = false

Vue.use(VueRouter);

Vue.use(moment);

Vue.prototype.$http = axiosInstance;

const router = new VueRouter({
  mode: 'history',
  routes,
});


new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
