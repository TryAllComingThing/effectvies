import request from '@/utils/request';
import type { ApiResult, PageResult } from '@/types';

export interface SemanticItem {
  id: string;
  code: string;
  name: string;
  keyword: string;
  deptName: string;
  status: 'enabled' | 'disabled';
}

export type SemanticPayload = {
  code: string;
  name: string;
  keyword: string;
  deptName: string;
  status: 'enabled' | 'disabled';
};

export interface SqlTemplateItem {
  id: string;
  code: string;
  name: string;
  sqlBrief: string;
  sqlContent: string;
  deptName: string;
  status: 'enabled' | 'disabled';
}

export type SqlTemplatePayload = {
  code: string;
  name: string;
  sqlBrief: string;
  sqlContent?: string;
  deptName: string;
  status: 'enabled' | 'disabled';
};

export const getSemanticList = (params: Record<string, unknown>) =>
  request.get<unknown, ApiResult<PageResult<SemanticItem>>>('/system/semantics', { params });

export const toggleSemanticStatus = (id: string) =>
  request.post<unknown, ApiResult<null>>(`/system/semantics/${id}/toggle-status`);

export const createSemantic = (data: SemanticPayload) =>
  request.post<unknown, ApiResult<null>>('/system/semantics', data);

export const updateSemantic = (id: string, data: SemanticPayload) =>
  request.put<unknown, ApiResult<null>>(`/system/semantics/${id}`, data);

export const deleteSemantic = (id: string) =>
  request.delete<unknown, ApiResult<null>>(`/system/semantics/${id}`);

export const getSqlTemplateList = (params: Record<string, unknown>) =>
  request.get<unknown, ApiResult<PageResult<SqlTemplateItem>>>('/system/sql-templates', { params });

export const createSqlTemplate = (data: SqlTemplatePayload) =>
  request.post<unknown, ApiResult<null>>('/system/sql-templates', data);

export const updateSqlTemplate = (id: string, data: SqlTemplatePayload) =>
  request.put<unknown, ApiResult<null>>(`/system/sql-templates/${id}`, data);

export const deleteSqlTemplate = (id: string) =>
  request.delete<unknown, ApiResult<null>>(`/system/sql-templates/${id}`);

export const testSqlTemplate = (id: string, sqlContent: string) =>
  request.post<unknown, ApiResult<{ preview: string }>>(`/system/sql-templates/${id}/test`, { sqlContent });
