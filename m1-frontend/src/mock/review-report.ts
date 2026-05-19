import type { MockMethod } from 'vite-plugin-mock';
import type { ExportJobItem, PerformanceItem, PerfReviewItem } from '@/types';

const now = '2026-05-17 20:00:00';

const reviewDb: PerfReviewItem[] = Array.from({ length: 54 }, (_, idx) => ({
  id: `r${idx + 1}`,
  title: `绩效主题-${idx + 1}`,
  content: `绩效内容描述-${idx + 1}`,
  routeName: ['一号线', '二号线', '三号线'][idx % 3],
  deptName: ['科室一', '科室二', '科室三'][idx % 3],
  proposer: ['张三', '李四', '王五'][idx % 3],
  score: 60 + (idx % 40),
  eventAt: now,
  parsedAt: now,
  confidence: Number((0.72 + (idx % 20) * 0.01).toFixed(2)),
  reviewStatus: 'pending',
  reviewComment: '',
  sourceTaskNo: `Task-20260517-${String(idx + 1).padStart(8, '0')}`,
  sourceBatchNo: `JXData-20260517-${String(idx + 1).padStart(8, '0')}`,
}));

const performanceDb: PerformanceItem[] = Array.from({ length: 36 }, (_, idx) => ({
  id: `p${idx + 1}`,
  title: `绩效主题-${idx + 1}`,
  content: `绩效内容描述-${idx + 1}`,
  routeName: ['一号线', '二号线', '三号线'][idx % 3],
  deptName: ['科室一', '科室二', '科室三'][idx % 3],
  proposer: ['张三', '李四', '王五'][idx % 3],
  score: 65 + (idx % 30),
  eventAt: now,
  parsedAt: now,
  confidence: Number((0.76 + (idx % 18) * 0.01).toFixed(2)),
  sourceTaskNo: `Task-20260517-${String(idx + 101).padStart(8, '0')}`,
  sourceBatchNo: `JXData-20260517-${String(idx + 101).padStart(8, '0')}`,
  matchedAt: now,
}));

const exportJobs: ExportJobItem[] = [];

const ok = (data: unknown) => ({ code: 0, message: 'success', traceId: `trace_${Date.now()}`, data });
const fail = (code: number, message: string) => ({ code, message, traceId: `trace_${Date.now()}`, data: null });

const paginate = <T>(list: T[], pageNum: number, pageSize: number) => {
  const start = (pageNum - 1) * pageSize;
  return {
    list: list.slice(start, start + pageSize),
    total: list.length,
    pageNum,
    pageSize,
  };
};

export default [
  {
    url: '/api/perf/reviews',
    method: 'get',
    response: ({ query }: { query: Record<string, string> }) => {
      const pageNum = Number(query.pageNum || 1);
      const pageSize = Number(query.pageSize || 10);
      const keyword = (query.keyword || '').trim();
      const filtered = keyword
        ? reviewDb.filter((item) => item.title.includes(keyword) || item.proposer.includes(keyword) || item.routeName.includes(keyword))
        : reviewDb;
      return ok(paginate(filtered, pageNum, pageSize));
    },
  },
  {
    url: '/api/perf/reviews/:id/approve',
    method: 'post',
    response: ({ url }: { url: string }) => {
      const id = url.split('/api/perf/reviews/')[1].split('/approve')[0];
      const idx = reviewDb.findIndex((item) => item.id === id);
      if (idx < 0) return fail(40410, '审核记录不存在');
      const item = reviewDb[idx];
      const approved: PerformanceItem = {
        ...item,
        matchedAt: now,
      };
      reviewDb.splice(idx, 1);
      performanceDb.unshift(approved);
      return ok(null);
    },
  },
  {
    url: '/api/perf/reviews/:id/reject',
    method: 'post',
    response: ({ url, body }: { url: string; body: { reviewComment: string } }) => {
      const id = url.split('/api/perf/reviews/')[1].split('/reject')[0];
      const item = reviewDb.find((it) => it.id === id);
      if (!item) return fail(40410, '审核记录不存在');
      if (!body?.reviewComment?.trim()) return fail(40010, '驳回意见必填');
      item.reviewStatus = 'rejected';
      item.reviewComment = body.reviewComment;
      return ok(null);
    },
  },
  {
    url: '/api/performance',
    method: 'get',
    response: ({ query }: { query: Record<string, string> }) => {
      const pageNum = Number(query.pageNum || 1);
      const pageSize = Number(query.pageSize || 10);
      const keyword = (query.keyword || '').trim();
      const filtered = keyword
        ? performanceDb.filter((item) => item.title.includes(keyword) || item.proposer.includes(keyword) || item.routeName.includes(keyword))
        : performanceDb;
      return ok(paginate(filtered, pageNum, pageSize));
    },
  },
  {
    url: '/api/reports/export/table',
    method: 'post',
    response: () => {
      const id = `job_${Date.now()}`;
      exportJobs.unshift({
        id,
        jobType: 'table',
        reportType: 'current',
        status: 'running',
        progress: 15,
        fileName: `绩效报表_${Date.now()}.xlsx`,
        createdAt: now,
      });
      return ok({ jobId: id });
    },
  },
  {
    url: '/api/reports/export/docx',
    method: 'post',
    response: ({ body }: { body: { reportType: ExportJobItem['reportType'] } }) => {
      const id = `job_${Date.now()}`;
      exportJobs.unshift({
        id,
        jobType: 'docx',
        reportType: body?.reportType || 'daily',
        status: 'running',
        progress: 10,
        fileName: `绩效报告_${body?.reportType || 'daily'}_${Date.now()}.docx`,
        createdAt: now,
      });
      return ok({ jobId: id });
    },
  },
  {
    url: '/api/reports/export/jobs',
    method: 'get',
    response: ({ query }: { query: Record<string, string> }) => {
      const pageNum = Number(query.pageNum || 1);
      const pageSize = Number(query.pageSize || 10);
      return ok(paginate(exportJobs, pageNum, pageSize));
    },
  },
  {
    url: '/api/reports/export/:jobId/status',
    method: 'get',
    response: ({ url }: { url: string }) => {
      const id = url.split('/api/reports/export/')[1].split('/status')[0];
      const job = exportJobs.find((it) => it.id === id);
      if (!job) return fail(40420, '导出任务不存在');
      if (job.status === 'running') {
        job.progress = Math.min(job.progress + 30, 100);
        if (job.progress >= 100) {
          job.status = 'done';
        }
      }
      return ok(job);
    },
  },
  {
    url: '/api/reports/export/:jobId/download',
    method: 'get',
    response: ({ url }: { url: string }) => {
      const id = url.split('/api/reports/export/')[1].split('/download')[0];
      const job = exportJobs.find((it) => it.id === id);
      if (!job) return fail(40420, '导出任务不存在');
      if (job.status !== 'done') return fail(40920, '任务未完成，无法下载');
      return ok({ url: `/mock-download/${job.fileName}` });
    },
  },
] as MockMethod[];
