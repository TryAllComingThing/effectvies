import request from '@/utils/request';
import type { ApiResult, PageResult, PerfFileItem, PerfTaskItem } from '@/types';

export const getPerfFileList = (params: Record<string, unknown>) =>
  request.get<unknown, ApiResult<PageResult<PerfFileItem>>>('/perf/files', { params });

export const parsePerfFile = (fileId: string) =>
  request.post<unknown, ApiResult<null>>(`/perf/files/${fileId}/parse`);

export const coverPerfFile = (fileId: string) =>
  request.post<unknown, ApiResult<null>>(`/perf/files/${fileId}/cover`);

export const deletePerfFile = (fileId: string) =>
  request.delete<unknown, ApiResult<null>>(`/perf/files/${fileId}`);

export const getPerfTaskList = (params: Record<string, unknown>) =>
  request.get<unknown, ApiResult<PageResult<PerfTaskItem>>>('/perf/tasks', { params });

export const startPerfTask = (taskId: string) =>
  request.post<unknown, ApiResult<null>>(`/perf/tasks/${taskId}/start`);

export const stopPerfTask = (taskId: string) =>
  request.post<unknown, ApiResult<null>>(`/perf/tasks/${taskId}/stop`);

export const resumePerfTask = (taskId: string) =>
  request.post<unknown, ApiResult<null>>(`/perf/tasks/${taskId}/resume`);

export const clearPerfTask = (taskId: string) =>
  request.post<unknown, ApiResult<null>>(`/perf/tasks/${taskId}/clear`);
