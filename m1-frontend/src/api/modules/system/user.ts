import request from '@/utils/request';
import type { ApiResult, PageResult } from '@/types';

export interface UserItem {
  id: string;
  account: string;
  name: string;
  deptName: string;
  roleName: string;
  phone: string;
  userStatus: 'enabled' | 'disabled';
  createdAt: string;
  lastLoginAt: string;
}

export type UserPayload = {
  account: string;
  name: string;
  deptName: string;
  roleName: string;
  phone: string;
  userStatus: 'enabled' | 'disabled';
};

export const getUserList = (params: Record<string, unknown>) =>
  request.get<unknown, ApiResult<PageResult<UserItem>>>('/system/users', { params });

export const toggleUserStatus = (id: string) =>
  request.post<unknown, ApiResult<null>>(`/system/users/${id}/toggle-status`);

export const createUser = (data: UserPayload) =>
  request.post<unknown, ApiResult<null>>('/system/users', data);

export const updateUser = (id: string, data: UserPayload) =>
  request.put<unknown, ApiResult<null>>(`/system/users/${id}`, data);

export const resetUserPassword = (id: string) =>
  request.post<unknown, ApiResult<null>>(`/system/users/${id}/reset-password`);

export const deleteUser = (id: string) =>
  request.delete<unknown, ApiResult<null>>(`/system/users/${id}`);
