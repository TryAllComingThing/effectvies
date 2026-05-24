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
  excelTemplate: 'A' | 'B' | 'C';
  format: 'xls' | 'xlsx' | 'zip';
  parseStatus: 'unparsed' | 'parsing' | 'success' | 'fail';
  storageStatus: 'unstored' | 'stored';
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
  sourceName: string;
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
  sourceName: string;
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

export interface ReportTemplateItem {
  id: string;
  templateName: string;
  templateCode: string;
  sourceType: 'upload' | 'custom';
  reportType: ExportJobItem['reportType'];
  status: 'enabled' | 'disabled';
  isDefault: boolean;
  version: string;
  fileName: string;
  fileSize: string;
  creator: string;
  updatedAt: string;
  description: string;
  sectionConfig: string[];
}
