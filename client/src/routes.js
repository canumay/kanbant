import Login from './components/general/Login.vue';
import Dashboard from './components/dashboard/Dashboard.vue';
import axios from 'axios';

const axiosInstance = axios.create({
    withCredentials: true,
    baseURL: process.env.VUE_APP_BASE_URL
})

export default [
    {
        path: '/login',
        component: Login,
    },
    {
        path: '/dashboard',
        component: Dashboard,
        beforeEnter: (to, from, next) => {
            axiosInstance.get('/auth/status')
                .then(res => {
                    if (res.data.status === true) {
                        next();
                    } else {
                        next('/login');
                    }
                })
                .catch(err => {
                    console.log("Error occurred", err.response);
                    next();
                })
        }
    },
    {
        path: "*",
        redirect: '/login'
    }
];