export interface ApiResult<T> {
  code: number;
  message: string;
  data: T;
  traceId: string;
}

export interface PageResult<T> {
  list: T[];
  total: number;
  pageNum: number;
  pageSize: number;
}

export interface PerfFileItem {
  id: string;
  batchNo: string;
  name: string;
  format: 'xls' | 'xlsx' | 'zip';
  parseStatus: 'unparsed' | 'parsing' | 'success' | 'fail';
  uploadedAt: string;
}

export interface PerfTaskItem {
  id: string;
  taskNo: string;
  batchNo: string;
  fileName: string;
  taskStatus: 'pending' | 'running' | 'stopped' | 'done' | 'fail';
  progress: number;
  createdAt: string;
  checkpoint: number;
}

export interface PerfReviewItem {
  id: string;
  title: string;
  content: string;
  routeName: string;
  deptName: string;
  proposer: string;
  score: number;
  eventAt: string;
  parsedAt: string;
  confidence: number;
  reviewStatus: 'pending' | 'approved' | 'rejected';
  reviewComment: string;
  sourceTaskNo: string;
  sourceBatchNo: string;
}

export interface PerformanceItem extends Omit<PerfReviewItem, 'reviewStatus' | 'reviewComment'> {
  matchedAt: string;
}

export interface ExportJobItem {
  id: string;
  jobType: 'table' | 'docx';
  reportType: 'daily' | 'quarter' | 'yearly' | 'current';
  status: 'pending' | 'running' | 'done' | 'fail';
  progress: number;
  fileName: string;
  createdAt: string;
}
