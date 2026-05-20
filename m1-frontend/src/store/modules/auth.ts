import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import type { RouteLocationNormalizedLoaded, RouteRecordRaw } from 'vue-router';
import type { RoleCode } from './user';
import { canAccessRouteMeta, DEFAULT_ROLE_PERMISSIONS, DEFAULT_ROLE_ROUTE_NAMES } from '@/utils/auth';

const AUTH_PERMISSIONS_KEY = 'm1_permissions';
const AUTH_MENU_ROUTE_NAMES_KEY = 'm1_menu_route_names';

const readStoredArray = (key: string) => {
  const raw = localStorage.getItem(key);
  if (!raw) {
    return [] as string[];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : [];
  } catch {
    localStorage.removeItem(key);
    return [];
  }
};

const persistArray = (key: string, value: string[]) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const useAuthStore = defineStore('auth', () => {
  const permissions = ref<string[]>(readStoredArray(AUTH_PERMISSIONS_KEY));
  const menuRouteNames = ref<string[]>(readStoredArray(AUTH_MENU_ROUTE_NAMES_KEY));
  const hasInitialized = ref(Boolean(permissions.value.length || menuRouteNames.value.length));

  const setAuthorization = (payload: { permissions: string[]; menuRouteNames: string[] }) => {
    permissions.value = [...payload.permissions];
    menuRouteNames.value = [...payload.menuRouteNames];
    persistArray(AUTH_PERMISSIONS_KEY, permissions.value);
    persistArray(AUTH_MENU_ROUTE_NAMES_KEY, menuRouteNames.value);
    hasInitialized.value = true;
  };

  const setAuthorizationByRole = (roleCode: RoleCode) => {
    setAuthorization({
      permissions: DEFAULT_ROLE_PERMISSIONS[roleCode] || [],
      menuRouteNames: DEFAULT_ROLE_ROUTE_NAMES[roleCode] || [],
    });
  };

  const hydrateAuthorization = (roleCode: RoleCode) => {
    if (permissions.value.length || menuRouteNames.value.length) {
      hasInitialized.value = true;
      return;
    }

    setAuthorizationByRole(roleCode);
  };

  const clearAuthorization = () => {
    permissions.value = [];
    menuRouteNames.value = [];
    hasInitialized.value = false;
    localStorage.removeItem(AUTH_PERMISSIONS_KEY);
    localStorage.removeItem(AUTH_MENU_ROUTE_NAMES_KEY);
  };

  const canAccessRoute = (
    route: Pick<RouteRecordRaw, 'name' | 'meta'> | Pick<RouteLocationNormalizedLoaded, 'name' | 'meta'>,
    roleCode: RoleCode
  ) => {
    const routeName = typeof route.name === 'string' ? route.name : '';
    const routeAuthorizedByMeta = canAccessRouteMeta(route.meta, roleCode, permissions.value);

    if (!routeAuthorizedByMeta) {
      return false;
    }

    if (!route.meta?.requiresAuth) {
      return true;
    }

    if (!routeName) {
      return true;
    }

    return !menuRouteNames.value.length || menuRouteNames.value.includes(routeName);
  };

  const hasPermissionCode = computed(() => (code: string | string[]) => {
    const codes = Array.isArray(code) ? code : [code];
    if (permissions.value.includes('*')) {
      return true;
    }

    return codes.some((item) => permissions.value.includes(item));
  });

  return {
    permissions,
    menuRouteNames,
    hasInitialized,
    setAuthorization,
    setAuthorizationByRole,
    hydrateAuthorization,
    clearAuthorization,
    canAccessRoute,
    hasPermissionCode,
  };
});
