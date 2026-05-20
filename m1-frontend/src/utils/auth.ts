import type { AppRouteMeta } from '@/router/routes';
import type { RoleCode } from '@/store/modules/user';

export type PermissionCode = string;
export type PermissionCheckMode = 'and' | 'or';

export interface PermissionBinding {
  roles?: RoleCode[];
  permissions?: PermissionCode[];
  mode?: PermissionCheckMode;
}

const ADMIN_ROUTE_NAMES = [
  'Dashboard',
  'PerfFiles',
  'PerfFileLog',
  'PerfTasks',
  'PerfReview',
  'Performance',
  'AnalysisAsk',
  'AnalysisTable',
  'AnalysisReport',
  'AnalysisPerformanceReport',
  'AnalysisTemplate',
  'SystemUsers',
  'SystemDepts',
  'SystemRoles',
  'SystemRules',
  'SystemSemantic',
  'SystemDicts',
  'SystemLogs',
  'SystemPlatform',
] as const;

const USER_ROUTE_NAMES = [
  'Dashboard',
  'AnalysisAsk',
  'AnalysisTable',
  'AnalysisReport',
  'AnalysisPerformanceReport',
  'AnalysisTemplate',
] as const;

export const DEFAULT_ROLE_ROUTE_NAMES: Record<RoleCode, string[]> = {
  admin: [...ADMIN_ROUTE_NAMES],
  user: [...USER_ROUTE_NAMES],
};

export const DEFAULT_ROLE_PERMISSIONS: Record<RoleCode, PermissionCode[]> = {
  admin: ['*'],
  user: ['dashboard:view', 'analysis:ask:view', 'analysis:table:view', 'analysis:report:view', 'analysis:template:view'],
};

const isPermissionLike = (value: string) => value.includes(':') || value === '*';

export const normalizePermissionBinding = (value: string | string[] | PermissionBinding): PermissionBinding => {
  if (typeof value === 'string') {
    return isPermissionLike(value) ? { permissions: [value] } : { roles: [value as RoleCode] };
  }

  if (Array.isArray(value)) {
    const permissions = value.filter(isPermissionLike);
    const roles = value.filter((item) => !isPermissionLike(item)) as RoleCode[];
    return {
      permissions: permissions.length ? permissions : undefined,
      roles: roles.length ? roles : undefined,
    };
  }

  return value;
};

export const hasRole = (currentRole: RoleCode, requiredRoles?: RoleCode[]) => {
  if (!requiredRoles?.length) {
    return true;
  }

  return requiredRoles.includes(currentRole);
};

export const hasPermission = (
  ownedPermissions: PermissionCode[],
  requiredPermissions?: PermissionCode[],
  mode: PermissionCheckMode = 'or'
) => {
  if (!requiredPermissions?.length) {
    return true;
  }

  if (ownedPermissions.includes('*')) {
    return true;
  }

  return mode === 'and'
    ? requiredPermissions.every((permission) => ownedPermissions.includes(permission))
    : requiredPermissions.some((permission) => ownedPermissions.includes(permission));
};

export const canAccessByBinding = (
  binding: PermissionBinding,
  currentRole: RoleCode,
  ownedPermissions: PermissionCode[]
) => {
  const mode = binding.mode || 'or';
  const roleAllowed = hasRole(currentRole, binding.roles);
  const permissionAllowed = hasPermission(ownedPermissions, binding.permissions, mode);

  if (binding.roles?.length && binding.permissions?.length) {
    return mode === 'and' ? roleAllowed && permissionAllowed : roleAllowed || permissionAllowed;
  }

  if (binding.roles?.length) {
    return roleAllowed;
  }

  if (binding.permissions?.length) {
    return permissionAllowed;
  }

  return true;
};

export const canAccessRouteMeta = (
  meta: Partial<AppRouteMeta> | undefined,
  currentRole: RoleCode,
  ownedPermissions: PermissionCode[]
) => {
  if (!meta) {
    return true;
  }

  const roleAllowed = hasRole(currentRole, meta.roles);
  const permissionAllowed = hasPermission(ownedPermissions, meta.permissions);

  return roleAllowed && permissionAllowed;
};
