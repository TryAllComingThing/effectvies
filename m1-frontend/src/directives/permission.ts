import type { App, Directive } from 'vue';
import { useAuthStore } from '@/store/modules/auth';
import { useUserStore } from '@/store/modules/user';
import { canAccessByBinding, normalizePermissionBinding } from '@/utils/auth';

const permissionDirective: Directive = {
  mounted(el, binding) {
    const userStore = useUserStore();
    const authStore = useAuthStore();
    const normalizedBinding = normalizePermissionBinding(binding.value);

    if (!canAccessByBinding(normalizedBinding, userStore.roleCode, authStore.permissions)) {
      el.parentNode?.removeChild(el);
    }
  },
};

export const setupPermissionDirective = (app: App) => {
  app.directive('permission', permissionDirective);
};
