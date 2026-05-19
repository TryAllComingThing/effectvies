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

export interface RuleItem {
  id: string;
  name: string;
  tag: string;
  content: string;
  deptName: string;
  status: 'enabled' | 'disabled';
  createdAt: string;
}

export interface SemanticItem {
  id: string;
  code: string;
  name: string;
  keyword: string;
  deptName: string;
  status: 'enabled' | 'disabled';
}

export interface SqlTemplateItem {
  id: string;
  code: string;
  name: string;
  sqlBrief: string;
  sqlContent: string;
  deptName: string;
  status: 'enabled' | 'disabled';
}

export const getDeptList = (params: Record<string, unknown>) =>
  request.get<unknown, ApiResult<PageResult<DeptItem>>>('/system/depts', { params });

export const toggleDeptStatus = (id: string) =>
  request.post<unknown, ApiResult<null>>(`/system/depts/${id}/toggle-status`);

export const getRuleList = (params: Record<string, unknown>) =>
  request.get<unknown, ApiResult<PageResult<RuleItem>>>('/system/rules', { params });

export const toggleRuleStatus = (id: string) =>
  request.post<unknown, ApiResult<null>>(`/system/rules/${id}/toggle-status`);

export const getSemanticList = (params: Record<string, unknown>) =>
  request.get<unknown, ApiResult<PageResult<SemanticItem>>>('/system/semantics', { params });

export const toggleSemanticStatus = (id: string) =>
  request.post<unknown, ApiResult<null>>(`/system/semantics/${id}/toggle-status`);

export const getSqlTemplateList = (params: Record<string, unknown>) =>
  request.get<unknown, ApiResult<PageResult<SqlTemplateItem>>>('/system/sql-templates', { params });

export const testSqlTemplate = (id: string, sqlContent: string) =>
  request.post<unknown, ApiResult<{ preview: string }>>(`/system/sql-templates/${id}/test`, { sqlContent });
