import request from '@/utils/request';
import type { ApiResult, PageResult } from '@/types';

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

export const getLogList = (params: Record<string, unknown>) =>
  request.get<unknown, ApiResult<PageResult<LogItem>>>('/system/logs', { params });

export const batchDeleteLogs = (ids: string[]) =>
  request.post<unknown, ApiResult<null>>('/system/logs/batch-delete', { ids });
