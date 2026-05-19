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

export interface RoleItem {
  id: string;
  roleCode: string;
  roleName: string;
  deptName: string;
  userCount: number;
  createdAt: string;
}

export interface DictItem {
  id: string;
  dictType: string;
  dictLabel: string;
  dictValue: string;
  status: 'enabled' | 'disabled';
  remark?: string;
}

export interface LogItem {
  id: string;
  logType: 'login' | 'operation';
  module: string;
  operator: string;
  deptName: string;
  ip: string;
  content: string;
  createdAt: string;
}

export const getUserList = (params: Record<string, unknown>) =>
  request.get<unknown, ApiResult<PageResult<UserItem>>>('/system/users', { params });

export const toggleUserStatus = (id: string) =>
  request.post<unknown, ApiResult<null>>(`/system/users/${id}/toggle-status`);

export const getRoleList = (params: Record<string, unknown>) =>
  request.get<unknown, ApiResult<PageResult<RoleItem>>>('/system/roles', { params });

export const deleteRole = (id: string) =>
  request.delete<unknown, ApiResult<null>>(`/system/roles/${id}`);

export const getDictList = (params: Record<string, unknown>) =>
  request.get<unknown, ApiResult<PageResult<DictItem>>>('/system/dicts', { params });

export const toggleDictStatus = (id: string) =>
  request.post<unknown, ApiResult<null>>(`/system/dicts/${id}/toggle-status`);

export const createDict = (data: Omit<DictItem, 'id'>) =>
  request.post<unknown, ApiResult<null>>('/system/dicts', data);

export const updateDict = (id: string, data: Omit<DictItem, 'id'>) =>
  request.put<unknown, ApiResult<null>>(`/system/dicts/${id}`, data);

export const deleteDict = (id: string) =>
  request.delete<unknown, ApiResult<null>>(`/system/dicts/${id}`);

export const getLogList = (params: Record<string, unknown>) =>
  request.get<unknown, ApiResult<PageResult<LogItem>>>('/system/logs', { params });

export const batchDeleteLogs = (ids: string[]) =>
  request.post<unknown, ApiResult<null>>('/system/logs/batch-delete', { ids });
