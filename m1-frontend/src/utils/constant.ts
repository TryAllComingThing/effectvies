export const EXPORT_REPORT_TYPE_OPTIONS = [
  { label: '日报', value: 'daily' },
  { label: '季报', value: 'quarter' },
  { label: '年度报告', value: 'yearly' },
  { label: '当前报告', value: 'current' },
] as const;

export const REPORT_SCORE_LEVEL_OPTIONS = [
  { label: '全部分数', value: '' },
  { label: '优秀（90分及以上）', value: 'excellent' },
  { label: '良好（80-89分）', value: 'good' },
  { label: '合格（60-79分）', value: 'pass' },
  { label: '待提升（60分以下）', value: 'low' },
] as const;

export const REPORT_DOWNLOAD_FILE_PREFIX = '绩效统计报表';

export const REPORT_SOURCE_TEXT = '绩效管理已入库数据统计';

export const REPORT_TABLE_HEADERS = [
  '序号',
  '科室',
  '类型',
  '统计条数',
  '提报人数',
  '占比',
] as const;
