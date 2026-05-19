import type { MockMethod } from 'vite-plugin-mock';
import type { ReportTemplateItem } from '@/types';

const now = '2026-05-19 10:20:00';

const templateDb: ReportTemplateItem[] = [
  {
    id: 'tpl_1',
    templateName: '绩效日报标准模板',
    templateCode: 'RPT-DAILY-001',
    sourceType: 'upload',
    reportType: 'daily',
    status: 'enabled',
    isDefault: true,
    version: 'V1.2',
    fileName: '绩效日报标准模板.docx',
    fileSize: '1.8MB',
    creator: '系统管理员',
    updatedAt: now,
    description: '用于日常绩效日报输出，包含封面、概览、明细和建议。',
    sectionConfig: ['封面信息', '绩效概览', '指标明细', '问题分析', '改进建议'],
  },
  {
    id: 'tpl_2',
    templateName: '季度复盘模板',
    templateCode: 'RPT-QUARTER-002',
    sourceType: 'custom',
    reportType: 'quarter',
    status: 'enabled',
    isDefault: false,
    version: 'V2.0',
    fileName: '季度复盘模板.docx',
    fileSize: '2.4MB',
    creator: '张三',
    updatedAt: now,
    description: '适用于季度绩效复盘汇总，突出趋势分析和重点专项。',
    sectionConfig: ['封面信息', '季度总览', '趋势对比', '重点专项', '结论建议'],
  },
  {
    id: 'tpl_3',
    templateName: '年度汇报模板',
    templateCode: 'RPT-YEAR-003',
    sourceType: 'upload',
    reportType: 'yearly',
    status: 'disabled',
    isDefault: false,
    version: 'V1.0',
    fileName: '年度汇报模板.docx',
    fileSize: '3.1MB',
    creator: '李四',
    updatedAt: now,
    description: '用于年度绩效报告，包含年度总结、排名及改进规划。',
    sectionConfig: ['封面信息', '年度总结', '排名分析', '关键问题', '年度规划'],
  },
];

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
    url: '/api/report/templates',
    method: 'get',
    response: ({ query }: { query: Record<string, string> }) => {
      const pageNum = Number(query.pageNum || 1);
      const pageSize = Number(query.pageSize || 10);
      const keyword = (query.keyword || '').trim();
      const reportType = (query.reportType || '').trim();
      const sourceType = (query.sourceType || '').trim();
      const status = (query.status || '').trim();

      const filtered = templateDb.filter((item) => {
        if (keyword && !`${item.templateName}${item.templateCode}${item.fileName}`.includes(keyword)) return false;
        if (reportType && item.reportType !== reportType) return false;
        if (sourceType && item.sourceType !== sourceType) return false;
        if (status && item.status !== status) return false;
        return true;
      });

      return ok(paginate(filtered, pageNum, pageSize));
    },
  },
  {
    url: '/api/report/templates',
    method: 'post',
    response: ({ body }: { body: Partial<ReportTemplateItem> }) => {
      const templateName = body?.templateName?.trim();
      if (!templateName) return fail(40031, '模板名称不能为空');

      const item: ReportTemplateItem = {
        id: `tpl_${Date.now()}`,
        templateName,
        templateCode: body.templateCode || `RPT-${Date.now()}`,
        sourceType: body.sourceType || 'custom',
        reportType: body.reportType || 'current',
        status: body.status || 'enabled',
        isDefault: Boolean(body.isDefault),
        version: body.version || 'V1.0',
        fileName: body.fileName || `${templateName}.docx`,
        fileSize: body.fileSize || '1.0MB',
        creator: body.creator || '当前用户',
        updatedAt: now,
        description: body.description || '',
        sectionConfig: body.sectionConfig || [],
      };

      if (item.isDefault) {
        templateDb.forEach((template) => {
          if (template.reportType === item.reportType) template.isDefault = false;
        });
      }

      templateDb.unshift(item);
      return ok(item);
    },
  },
  {
    url: '/api/report/templates/:id',
    method: 'put',
    response: ({ url, body }: { url: string; body: Partial<ReportTemplateItem> }) => {
      const id = url.split('/api/report/templates/')[1];
      const item = templateDb.find((template) => template.id === id);
      if (!item) return fail(40431, '模板不存在');

      const templateName = body?.templateName?.trim();
      if (!templateName) return fail(40031, '模板名称不能为空');

      if (body.isDefault) {
        templateDb.forEach((template) => {
          if (template.reportType === (body.reportType || item.reportType)) template.isDefault = false;
        });
      }

      item.templateName = templateName;
      item.templateCode = body.templateCode || item.templateCode;
      item.sourceType = body.sourceType || item.sourceType;
      item.reportType = body.reportType || item.reportType;
      item.version = body.version || item.version;
      item.fileName = body.fileName || item.fileName;
      item.fileSize = body.fileSize || item.fileSize;
      item.description = body.description || '';
      item.sectionConfig = body.sectionConfig || [];
      item.isDefault = Boolean(body.isDefault);
      item.updatedAt = now;

      return ok(item);
    },
  },
  {
    url: '/api/report/templates/:id/status',
    method: 'post',
    response: ({ url, body }: { url: string; body: { status: ReportTemplateItem['status'] } }) => {
      const id = url.split('/api/report/templates/')[1].split('/status')[0];
      const item = templateDb.find((template) => template.id === id);
      if (!item) return fail(40431, '模板不存在');
      item.status = body?.status || 'disabled';
      item.updatedAt = now;
      return ok(null);
    },
  },
  {
    url: '/api/report/templates/:id/default',
    method: 'post',
    response: ({ url }: { url: string }) => {
      const id = url.split('/api/report/templates/')[1].split('/default')[0];
      const item = templateDb.find((template) => template.id === id);
      if (!item) return fail(40431, '模板不存在');

      templateDb.forEach((template) => {
        if (template.reportType === item.reportType) template.isDefault = false;
      });
      item.isDefault = true;
      item.updatedAt = now;
      return ok(null);
    },
  },
  {
    url: '/api/report/templates/:id',
    method: 'delete',
    response: ({ url }: { url: string }) => {
      const id = url.split('/api/report/templates/')[1];
      const index = templateDb.findIndex((template) => template.id === id);
      if (index < 0) return fail(40431, '模板不存在');
      templateDb.splice(index, 1);
      return ok(null);
    },
  },
] as MockMethod[];
