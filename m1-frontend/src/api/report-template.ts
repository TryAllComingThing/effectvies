import request from '@/utils/request';
import type { ApiResult, PageResult, ReportTemplateItem } from '@/types';

export const getReportTemplateList = (params: Record<string, unknown>) =>
  request.get<unknown, ApiResult<PageResult<ReportTemplateItem>>>('/report/templates', { params });

export const createReportTemplate = (payload: Partial<ReportTemplateItem>) =>
  request.post<unknown, ApiResult<ReportTemplateItem>>('/report/templates', payload);

export const updateReportTemplate = (id: string, payload: Partial<ReportTemplateItem>) =>
  request.put<unknown, ApiResult<ReportTemplateItem>>(`/report/templates/${id}`, payload);

export const updateReportTemplateStatus = (id: string, status: ReportTemplateItem['status']) =>
  request.post<unknown, ApiResult<null>>(`/report/templates/${id}/status`, { status });

export const setDefaultReportTemplate = (id: string) =>
  request.post<unknown, ApiResult<null>>(`/report/templates/${id}/default`);

export const deleteReportTemplate = (id: string) =>
  request.delete<unknown, ApiResult<null>>(`/report/templates/${id}`);
