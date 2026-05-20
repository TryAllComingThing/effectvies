import { computed, type Ref } from 'vue';
import { useRoute } from 'vue-router';
import type { SystemModuleKey } from '@/types/system-module';

const MODULE_TITLE_MAP: Record<SystemModuleKey, string> = {
  users: '用户管理',
  roles: '角色管理',
  depts: '科室管理',
  rules: '规则管理',
  semantic: '语义管理',
  dicts: '字典管理',
  logs: '日志管理',
};

export const useSystemModuleMeta = (moduleRef: Ref<SystemModuleKey | undefined>) => {
  const route = useRoute();

  const routeModule = computed<SystemModuleKey>(() => {
    if (route.path.includes('/system/users')) return 'users';
    if (route.path.includes('/system/depts')) return 'depts';
    if (route.path.includes('/system/roles')) return 'roles';
    if (route.path.includes('/system/rules')) return 'rules';
    if (route.path.includes('/system/semantic')) return 'semantic';
    if (route.path.includes('/system/dicts')) return 'dicts';
    if (route.path.includes('/system/logs')) return 'logs';
    return 'users';
  });

  const activeModule = computed<SystemModuleKey>(() => moduleRef.value ?? routeModule.value);
  const moduleTitle = computed(() => MODULE_TITLE_MAP[activeModule.value]);

  return {
    activeModule,
    moduleTitle,
  };
};
