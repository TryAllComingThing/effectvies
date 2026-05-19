import type { MockMethod } from 'vite-plugin-mock';

const DEPT_NAMES = ['科室一', '科室二', '科室三'] as const;
const RULE_TAGS = ['流程', '质量', '合规'] as const;

const depts = Array.from({ length: 18 }, (_, i) => ({
  id: `dept${i + 1}`,
  code: `D${String(i + 1).padStart(3, '0')}`,
  name: DEPT_NAMES[i % DEPT_NAMES.length],
  parentName: '-',
  status: i % 4 === 0 ? 'disabled' : 'enabled',
  sort: i + 1,
}));
const rules = Array.from({ length: 36 }, (_, i) => ({
  id: `rule${i + 1}`,
  name: `规则-${i + 1}`,
  tag: RULE_TAGS[i % RULE_TAGS.length],
  content: `规则内容示例-${i + 1}`,
  deptName: DEPT_NAMES[i % DEPT_NAMES.length],
  status: i % 5 === 0 ? 'disabled' : 'enabled',
  createdAt: '2026-05-17 20:00:00',
}));
const semantics = Array.from({ length: 32 }, (_, i) => ({ id: `sem${i + 1}`, code: `SEM${String(i + 1).padStart(3, '0')}`, name: `业务语义-${i + 1}`, keyword: `关键词${i + 1}`, deptName: DEPT_NAMES[i % DEPT_NAMES.length], status: i % 4 === 0 ? 'disabled' : 'enabled' }));
const sqlTemplates = Array.from({ length: 26 }, (_, i) => ({ id: `sql${i + 1}`, code: `SQL${String(i + 1).padStart(3, '0')}`, name: `统计模板-${i + 1}`, sqlBrief: `统计语句简述-${i + 1}`, sqlContent: `SELECT id, score FROM performance LIMIT ${10 + (i % 20)}`, deptName: DEPT_NAMES[i % DEPT_NAMES.length], status: i % 4 === 0 ? 'disabled' : 'enabled' }));
const ok = (data: unknown) => ({ code: 0, message: 'success', traceId: `trace_${Date.now()}`, data });
const fail = (code: number, message: string) => ({ code, message, traceId: `trace_${Date.now()}`, data: null });
const paginate = <T>(list: T[], pageNum: number, pageSize: number) => ({ list: list.slice((pageNum - 1) * pageSize, (pageNum - 1) * pageSize + pageSize), total: list.length, pageNum, pageSize });

export default [
  { url: '/api/system/depts', method: 'get', response: ({ query }: { query: Record<string, string> }) => { const pageNum = Number(query.pageNum || 1), pageSize = Number(query.pageSize || 10); const { code = '', name = '', parentName = '', status = '' } = query; return ok(paginate(depts.filter(d => d.code.includes(code) && d.name.includes(name) && d.parentName.includes(parentName) && (!status || d.status === status)), pageNum, pageSize)); } },
  { url: '/api/system/depts/:id/toggle-status', method: 'post', response: ({ url }: { url: string }) => { const id = url.split('/api/system/depts/')[1].split('/toggle-status')[0]; const item = depts.find((d) => d.id === id); if (!item) return fail(40441, '科室不存在'); item.status = item.status === 'enabled' ? 'disabled' : 'enabled'; return ok(null); } },
  { url: '/api/system/rules', method: 'get', response: ({ query }: { query: Record<string, string> }) => { const pageNum = Number(query.pageNum || 1), pageSize = Number(query.pageSize || 10); const { name = '', tag = '', content = '', deptName = '', status = '' } = query; return ok(paginate(rules.filter(r => r.name.includes(name) && r.tag.includes(tag) && r.content.includes(content) && r.deptName.includes(deptName) && (!status || r.status === status)), pageNum, pageSize)); } },
  { url: '/api/system/rules/:id/toggle-status', method: 'post', response: ({ url }: { url: string }) => { const id = url.split('/api/system/rules/')[1].split('/toggle-status')[0]; const item = rules.find((r) => r.id === id); if (!item) return fail(40442, '规则不存在'); item.status = item.status === 'enabled' ? 'disabled' : 'enabled'; return ok(null); } },
  { url: '/api/system/semantics', method: 'get', response: ({ query }: { query: Record<string, string> }) => { const pageNum = Number(query.pageNum || 1), pageSize = Number(query.pageSize || 10); const { code = '', name = '', keyword = '', deptName = '', status = '' } = query; return ok(paginate(semantics.filter(s => s.code.includes(code) && s.name.includes(name) && s.keyword.includes(keyword) && s.deptName.includes(deptName) && (!status || s.status === status)), pageNum, pageSize)); } },
  { url: '/api/system/semantics/:id/toggle-status', method: 'post', response: ({ url }: { url: string }) => { const id = url.split('/api/system/semantics/')[1].split('/toggle-status')[0]; const item = semantics.find((s) => s.id === id); if (!item) return fail(40443, '语义不存在'); item.status = item.status === 'enabled' ? 'disabled' : 'enabled'; return ok(null); } },
  { url: '/api/system/sql-templates', method: 'get', response: ({ query }: { query: Record<string, string> }) => { const pageNum = Number(query.pageNum || 1), pageSize = Number(query.pageSize || 10); const { code = '', name = '', sqlBrief = '', deptName = '', status = '' } = query; return ok(paginate(sqlTemplates.filter(s => s.code.includes(code) && s.name.includes(name) && s.sqlBrief.includes(sqlBrief) && s.deptName.includes(deptName) && (!status || s.status === status)), pageNum, pageSize)); } },
  { url: '/api/system/sql-templates/:id/test', method: 'post', response: ({ url, body }: { url: string; body: { sqlContent: string } }) => { const id = url.split('/api/system/sql-templates/')[1].split('/test')[0]; const item = sqlTemplates.find((s) => s.id === id); if (!item) return fail(40444, 'SQL模板不存在'); const sql = (body?.sqlContent || '').toUpperCase(); if (!sql.trim().startsWith('SELECT')) return fail(40044, '仅允许SELECT语句'); if (/\b(UPDATE|DELETE|INSERT|DROP|TRUNCATE|ALTER|CREATE)\b/.test(sql)) return fail(40944, '命中敏感关键字，已拦截'); return ok({ preview: `SQL预览通过（不执行）: ${body.sqlContent.slice(0, 120)}` }); } },
] as MockMethod[];
