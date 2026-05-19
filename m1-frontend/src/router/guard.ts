import type { Router } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useUserStore } from '@/store/modules/user';

export const setupRouterGuard = (router: Router) => {
  router.beforeEach((to) => {
    const userStore = useUserStore();
    const requiresAuth = Boolean(to.meta.requiresAuth);

    if (requiresAuth && !userStore.isLoggedIn) {
      return '/login';
    }

    if (to.path === '/login' && userStore.isLoggedIn) {
      return '/dashboard';
    }

    const roles = to.meta.roles as string[] | undefined;
    if (roles && !roles.includes(userStore.roleCode)) {
      ElMessage.warning('无权限访问该页面');
      return '/dashboard';
    }

    return true;
  });
};
