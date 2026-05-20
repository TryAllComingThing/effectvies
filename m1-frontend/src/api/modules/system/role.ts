import request from '@/utils/request';
import type { ApiResult, PageResult } from '@/types';

export interface RoleItem {
  id: string;
  roleCode: string;
  roleName: string;
  deptName: string;
  userCount: number;
  createdAt: string;
}

export type RolePayload = {
  roleCode: string;
  roleName: string;
  deptName: string;
};

export const getRoleList = (params: Record<string, unknown>) =>
  request.get<unknown, ApiResult<PageResult<RoleItem>>>('/system/roles', { params });

export const deleteRole = (id: string) =>
  request.delete<unknown, ApiResult<null>>(`/system/roles/${id}`);

export const createRole = (data: RolePayload) =>
  request.post<unknown, ApiResult<null>>('/system/roles', data);

export const updateRole = (id: string, data: RolePayload) =>
  request.put<unknown, ApiResult<null>>(`/system/roles/${id}`, data);
