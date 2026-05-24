import request from '@/utils/request';
import type { ApiResult, PageResult } from '@/types';

export interface RuleItem {
  id: string;
  name: string;
  type: 'rule' | 'similarity';
  tag: string;
  content: string;
  deptName: string;
  status: 'enabled' | 'disabled';
  createdAt: string;
}

export type RulePayload = {
  name: string;
  type: 'rule' | 'similarity';
  tag: string;
  content: string;
  deptName: string;
  status: 'enabled' | 'disabled';
};

export const getRuleList = (params: Record<string, unknown>) =>
  request.get<unknown, ApiResult<PageResult<RuleItem>>>('/system/rules', { params });

export const toggleRuleStatus = (id: string) =>
  request.post<unknown, ApiResult<null>>(`/system/rules/${id}/toggle-status`);

export const createRule = (data: RulePayload) =>
  request.post<unknown, ApiResult<null>>('/system/rules', data);

export const updateRule = (id: string, data: RulePayload) =>
  request.put<unknown, ApiResult<null>>(`/system/rules/${id}`, data);

export const deleteRule = (id: string) =>
  request.delete<unknown, ApiResult<null>>(`/system/rules/${id}`);
