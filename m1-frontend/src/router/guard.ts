import type { Router } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '@/store/modules/auth';
import { usePlatformStore } from '@/store/modules/platform';
import { useUserStore } from '@/store/modules/user';

export const setupRouterGuard = (router: Router) => {
  router.beforeEach((to) => {
    const userStore = useUserStore();
    const authStore = useAuthStore();
    const requiresAuth = Boolean(to.meta.requiresAuth);

    if (requiresAuth && !userStore.isLoggedIn) {
      return '/login';
    }

    if (userStore.isLoggedIn && !authStore.hasInitialized) {
      authStore.hydrateAuthorization(userStore.roleCode);
    }

    if (to.path === '/login' && userStore.isLoggedIn) {
      return '/dashboard';
    }

    if (requiresAuth && !authStore.canAccessRoute(to, userStore.roleCode)) {
      ElMessage.warning('鏃犳潈闄愯闂椤甸潰');
      return '/dashboard';
    }

    return true;
  });

  router.afterEach((to) => {
    const platformStore = usePlatformStore();
    platformStore.setCurrentPageTitle(String(to.meta.title || ''));
  });
};
