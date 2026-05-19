import type { App, Directive } from 'vue';
import { useUserStore } from '@/store/modules/user';

const permissionDirective: Directive = {
  mounted(el, binding) {
    const store = useUserStore();
    const requiredRoles = binding.value as Array<'admin' | 'user'>;

    if (!requiredRoles?.includes(store.roleCode)) {
      el.parentNode?.removeChild(el);
    }
  },
};

export const setupPermissionDirective = (app: App) => {
  app.directive('permission', permissionDirective);
};
