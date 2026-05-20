import request from '@/utils/request';
import type { ApiResult, PageResult } from '@/types';

export interface DictItem {
  id: string;
  dictType: string;
  dictLabel: string;
  dictValue: string;
  status: 'enabled' | 'disabled';
  remark?: string;
}

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
