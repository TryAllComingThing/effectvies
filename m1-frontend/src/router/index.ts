import { createRouter, createWebHistory } from 'vue-router';
import type { AppRouteRecordRaw } from './routes';
import { appRoutes } from './routes';

const baseRoutes: AppRouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/LoginView.vue'),
    meta: { title: '登录' },
  },
  {
    path: '/',
    name: 'Root',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/dashboard',
    meta: { title: '根路由', requiresAuth: true },
    children: appRoutes,
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/dashboard',
    meta: { title: '404' },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes: baseRoutes,
});

export default router;
