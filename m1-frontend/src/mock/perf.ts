import type { MockMethod } from 'vite-plugin-mock';
import type { PerfFileItem, PerfTaskItem } from '@/types';

const now = '2026-05-17 20:00:00';
const reportDate = now.slice(0, 10);

const buildFile = (i: number): PerfFileItem => ({
  id: `f${i}`,
  batchNo: `JXData-20260517-${String(i).padStart(8, '0')}`,
  name: `绩效-${reportDate}`,
  format: i % 3 === 0 ? 'zip' : i % 2 === 0 ? 'xls' : 'xlsx',
  parseStatus: ['unparsed', 'parsing', 'success', 'fail'][i % 4] as PerfFileItem['parseStatus'],
  uploadedAt: now,
});

const buildTask = (i: number): PerfTaskItem => ({
  id: `t${i}`,
  taskNo: `Task-20260517-${String(i).padStart(8, '0')}`,
  batchNo: `JXData-20260517-${String(i).padStart(8, '0')}`,
  fileName: `绩效文件-${i}`,
  taskStatus: ['pending', 'running', 'stopped', 'done', 'fail'][i % 5] as PerfTaskItem['taskStatus'],
  progress: (i * 7) % 100,
  createdAt: now,
  checkpoint: (i * 7) % 100,
});

const fileDb: PerfFileItem[] = Array.from({ length: 56 }, (_, idx) => buildFile(idx + 1));
const taskDb: PerfTaskItem[] = Array.from({ length: 52 }, (_, idx) => buildTask(idx + 1));

const ok = (data: unknown) => ({ code: 0, message: 'success', traceId: `trace_${Date.now()}`, data });
const fail = (code: number, message: string) => ({ code, message, traceId: `trace_${Date.now()}`, data: null });

export default [
  {
    url: '/api/perf/files',
    method: 'get',
    response: ({ query }: { query: Record<string, string> }) => {
      const pageNum = Number(query.pageNum || 1);
      const pageSize = Number(query.pageSize || 10);
      const { batchNo = '', name = '', format = '', parseStatus = '' } = query;
      const filtered = fileDb.filter((item) =>
        item.batchNo.includes(batchNo) &&
        item.name.includes(name) &&
        (!format || item.format === format) &&
        (!parseStatus || item.parseStatus === parseStatus),
      );
      const start = (pageNum - 1) * pageSize;
      return ok({ list: filtered.slice(start, start + pageSize), total: filtered.length, pageNum, pageSize });
    },
  },
  {
    url: '/api/perf/files/:id/parse',
    method: 'post',
    response: ({ url }: { url: string }) => {
      const id = url.split('/api/perf/files/')[1].split('/parse')[0];
      const item = fileDb.find((it) => it.id === id);
      if (!item) return fail(40401, '文件不存在');
      if (item.parseStatus === 'parsing') return fail(40901, '文件解析中，禁止重复解析');
      item.parseStatus = 'success';
      return ok(null);
    },
  },
  {
    url: '/api/perf/files/:id/cover',
    method: 'post',
    response: ({ url }: { url: string }) => {
      const id = url.split('/api/perf/files/')[1].split('/cover')[0];
      const item = fileDb.find((it) => it.id === id);
      if (!item) return fail(40401, '文件不存在');
      if (item.parseStatus === 'parsing') return fail(40902, '文件解析中，禁止覆盖');
      item.parseStatus = 'unparsed';
      return ok(null);
    },
  },
  {
    url: '/api/perf/files/:id',
    method: 'delete',
    response: ({ url }: { url: string }) => {
      const id = url.split('/api/perf/files/')[1];
      const hasRunningTask = taskDb.some((t) => t.batchNo === fileDb.find((f) => f.id === id)?.batchNo && t.taskStatus === 'running');
      if (hasRunningTask) return fail(40903, '存在运行中任务，禁止删除');
      const idx = fileDb.findIndex((it) => it.id === id);
      if (idx < 0) return fail(40401, '文件不存在');
      fileDb.splice(idx, 1);
      return ok(null);
    },
  },
  {
    url: '/api/perf/tasks',
    method: 'get',
    response: ({ query }: { query: Record<string, string> }) => {
      const pageNum = Number(query.pageNum || 1);
      const pageSize = Number(query.pageSize || 10);
      const { taskNo = '', batchNo = '', fileName = '', taskStatus = '' } = query;
      const filtered = taskDb.filter((item) =>
        item.taskNo.includes(taskNo) &&
        item.batchNo.includes(batchNo) &&
        item.fileName.includes(fileName) &&
        (!taskStatus || item.taskStatus === taskStatus),
      );
      const start = (pageNum - 1) * pageSize;
      return ok({ list: filtered.slice(start, start + pageSize), total: filtered.length, pageNum, pageSize });
    },
  },
  {
    url: '/api/perf/tasks/:id/start', method: 'post', response: ({ url }: { url: string }) => { const id = url.split('/api/perf/tasks/')[1].split('/start')[0]; const task = taskDb.find((it) => it.id === id); if (!task) return fail(40402, '任务不存在'); if (task.taskStatus === 'running') return fail(40911, '任务已在运行中'); task.taskStatus = 'running'; task.progress = Math.max(task.progress, 1); return ok(null);} },
  { url: '/api/perf/tasks/:id/stop', method: 'post', response: ({ url }: { url: string }) => { const id = url.split('/api/perf/tasks/')[1].split('/stop')[0]; const task = taskDb.find((it) => it.id === id); if (!task) return fail(40402, '任务不存在'); if (task.taskStatus !== 'running') return fail(40912, '仅运行中任务可停止'); task.taskStatus = 'stopped'; task.checkpoint = task.progress; return ok(null);} },
  { url: '/api/perf/tasks/:id/resume', method: 'post', response: ({ url }: { url: string }) => { const id = url.split('/api/perf/tasks/')[1].split('/resume')[0]; const task = taskDb.find((it) => it.id === id); if (!task) return fail(40402, '任务不存在'); if (task.taskStatus !== 'stopped') return fail(40913, '仅已停止任务可继续'); task.taskStatus = 'running'; task.progress = task.checkpoint; return ok(null);} },
  { url: '/api/perf/tasks/:id/clear', method: 'post', response: ({ url }: { url: string }) => { const id = url.split('/api/perf/tasks/')[1].split('/clear')[0]; const task = taskDb.find((it) => it.id === id); if (!task) return fail(40402, '任务不存在'); task.taskStatus = 'pending'; task.progress = 0; task.checkpoint = 0; return ok(null);} },
] as MockMethod[];
