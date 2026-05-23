import type { Router } from 'vue-router';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '@/store/modules/auth';
import { usePlatformStore } from '@/store/modules/platform';
import { useUserStore } from '@/store/modules/user';

const resolveAuthorizedHomePath = (router: Router, menuRouteNames: string[]) => {
  const candidateRoute = menuRouteNames
    .map((routeName) => router.getRoutes().find((route) => route.name === routeName))
    .find((route) => route && typeof route.path === 'string');

  return candidateRoute?.path || '/dashboard';
};

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

    const homePath = resolveAuthorizedHomePath(router, authStore.menuRouteNames);

    if (to.path === '/login' && userStore.isLoggedIn) {
      return homePath;
    }

    if (requiresAuth && !authStore.canAccessRoute(to, userStore.roleCode)) {
      ElMessage.warning('无权限访问该页面');

      if (to.path === homePath) {
        return false;
      }

      return homePath;
    }

    return true;
  });

  router.afterEach((to) => {
    const platformStore = usePlatformStore();
    platformStore.setCurrentPageTitle(String(to.meta.title || ''));
  });
};
