import request from '@/utils/request';
import type { ApiResult, PageResult, PerfReviewItem, PerformanceItem } from '@/types';

export const getReviewList = (params: Record<string, unknown>) =>
  request.get<unknown, ApiResult<PageResult<PerfReviewItem>>>('/perf/reviews', { params });

export const approveReview = (id: string) =>
  request.post<unknown, ApiResult<null>>(`/perf/reviews/${id}/approve`);

export const rejectReview = (id: string, reviewComment: string) =>
  request.post<unknown, ApiResult<null>>(`/perf/reviews/${id}/reject`, { reviewComment });

export const getPerformanceList = (params: Record<string, unknown>) =>
  request.get<unknown, ApiResult<PageResult<PerformanceItem>>>('/performance', { params });
