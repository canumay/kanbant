import Login from './components/general/Login.vue';
import Dashboard from './components/dashboard/Dashboard.vue';

export default [
    {
        path: '/login',
        component: Login,
    },
    {
        path: '/dashboard',
        component: Dashboard
    },
    {
        path: "*",
        redirect: '/login'
    }
];