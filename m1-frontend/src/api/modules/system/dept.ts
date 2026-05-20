import request from '@/utils/request';
import type { ApiResult, PageResult } from '@/types';

export interface DeptItem {
  id: string;
  code: string;
  name: string;
  parentName: string;
  status: 'enabled' | 'disabled';
  sort: number;
}

export type DeptPayload = {
  code: string;
  name: string;
  parentName: string;
  status: 'enabled' | 'disabled';
  sort: number;
};

export const getDeptList = (params: Record<string, unknown>) =>
  request.get<unknown, ApiResult<PageResult<DeptItem>>>('/system/depts', { params });

export const toggleDeptStatus = (id: string) =>
  request.post<unknown, ApiResult<null>>(`/system/depts/${id}/toggle-status`);

export const createDept = (data: DeptPayload) =>
  request.post<unknown, ApiResult<null>>('/system/depts', data);

export const updateDept = (id: string, data: DeptPayload) =>
  request.put<unknown, ApiResult<null>>(`/system/depts/${id}`, data);

export const deleteDept = (id: string) =>
  request.delete<unknown, ApiResult<null>>(`/system/depts/${id}`);
