import request from '@/utils/request';
import type { ApiResult, ExportJobItem, PageResult } from '@/types';

export const createTableExportJob = (payload: Record<string, unknown>) =>
  request.post<unknown, ApiResult<{ jobId: string }>>('/reports/export/table', payload);

export const createDocExportJob = (payload: Record<string, unknown>) =>
  request.post<unknown, ApiResult<{ jobId: string }>>('/reports/export/docx', payload);

export const getExportJobStatus = (jobId: string) =>
  request.get<unknown, ApiResult<ExportJobItem>>(`/reports/export/${jobId}/status`);

export const downloadExportJob = (jobId: string) =>
  request.get<unknown, ApiResult<{ url: string }>>(`/reports/export/${jobId}/download`);

export const getExportJobList = (params: Record<string, unknown>) =>
  request.get<unknown, ApiResult<PageResult<ExportJobItem>>>('/reports/export/jobs', { params });
