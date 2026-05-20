import type { MockMethod } from 'vite-plugin-mock';

const DEPT_NAMES: string[] = ['???', '???', '???'];
const RULE_TAGS: string[] = ['??', '??', '??'];
const now = '2026-05-17 20:00:00';

const depts: Array<{ id: string; code: string; name: string; parentName: string; status: 'enabled' | 'disabled'; sort: number }> = Array.from({ length: 18 }, (_, i) => ({
  id: `dept${i + 1}`,
  code: `D${String(i + 1).padStart(3, '0')}`,
  name: DEPT_NAMES[i % DEPT_NAMES.length],
  parentName: '-',
  status: i % 4 === 0 ? 'disabled' : 'enabled',
  sort: i + 1,
}));

const rules: Array<{ id: string; name: string; tag: string; content: string; deptName: string; status: 'enabled' | 'disabled'; createdAt: string }> = Array.from({ length: 36 }, (_, i) => ({
  id: `rule${i + 1}`,
  name: `??-${i + 1}`,
  tag: RULE_TAGS[i % RULE_TAGS.length],
  content: `??????-${i + 1}`,
  deptName: DEPT_NAMES[i % DEPT_NAMES.length],
  status: i % 5 === 0 ? 'disabled' : 'enabled',
  createdAt: now,
}));

const semantics: Array<{ id: string; code: string; name: string; keyword: string; deptName: string; status: 'enabled' | 'disabled' }> = Array.from({ length: 32 }, (_, i) => ({
  id: `sem${i + 1}`,
  code: `SEM${String(i + 1).padStart(3, '0')}`,
  name: `????-${i + 1}`,
  keyword: `???${i + 1}`,
  deptName: DEPT_NAMES[i % DEPT_NAMES.length],
  status: i % 4 === 0 ? 'disabled' : 'enabled',
}));

const sqlTemplates: Array<{ id: string; code: string; name: string; sqlBrief: string; sqlContent: string; deptName: string; status: 'enabled' | 'disabled' }> = Array.from({ length: 26 }, (_, i) => ({
  id: `sql${i + 1}`,
  code: `SQL${String(i + 1).padStart(3, '0')}`,
  name: `????-${i + 1}`,
  sqlBrief: `??????${i + 1}`,
  sqlContent: `SELECT id, score FROM performance LIMIT ${10 + (i % 20)}`,
  deptName: DEPT_NAMES[i % DEPT_NAMES.length],
  status: i % 4 === 0 ? 'disabled' : 'enabled',
}));

const ok = (data: unknown) => ({ code: 0, message: 'success', traceId: `trace_${Date.now()}`, data });
const fail = (code: number, message: string) => ({ code, message, traceId: `trace_${Date.now()}`, data: null });
const paginate = <T>(list: T[], pageNum: number, pageSize: number) => ({
  list: list.slice((pageNum - 1) * pageSize, (pageNum - 1) * pageSize + pageSize),
  total: list.length,
  pageNum,
  pageSize,
});

export default [
  {
    url: '/api/system/depts',
    method: 'get',
    response: ({ query }: { query: Record<string, string> }) => {
      const pageNum = Number(query.pageNum || 1);
      const pageSize = Number(query.pageSize || 10);
      const { code = '', name = '', parentName = '', status = '' } = query;
      return ok(
        paginate(
          depts.filter((d) => d.code.includes(code) && d.name.includes(name) && d.parentName.includes(parentName) && (!status || d.status === status)),
          pageNum,
          pageSize
        )
      );
    },
  },
  {
    url: '/api/system/depts',
    method: 'post',
    response: ({ body }: { body: Record<string, string | number> }) => {
      depts.unshift({
        id: `dept${Date.now()}`,
        code: String(body.code || ''),
        name: String(body.name || ''),
        parentName: String(body.parentName || '-'),
        status: (body.status as 'enabled' | 'disabled') || 'enabled',
        sort: Number(body.sort || 0),
      });
      return ok(null);
    },
  },
  {
    url: '/api/system/depts/:id',
    method: 'put',
    response: ({ url, body }: { url: string; body: Record<string, string | number> }) => {
      const id = url.split('/api/system/depts/')[1];
      const item = depts.find((d) => d.id === id);
      if (!item) return fail(40441, '科室不存在');
      item.code = String(body.code || '');
      item.name = String(body.name || '');
      item.parentName = String(body.parentName || '-');
      item.status = (body.status as 'enabled' | 'disabled') || 'enabled';
      item.sort = Number(body.sort || 0);
      return ok(null);
    },
  },
  {
    url: '/api/system/depts/:id',
    method: 'delete',
    response: ({ url }: { url: string }) => {
      const id = url.split('/api/system/depts/')[1];
      const index = depts.findIndex((d) => d.id === id);
      if (index < 0) return fail(40441, '?????');
      depts.splice(index, 1);
      return ok(null);
    },
  },
  {
    url: '/api/system/depts/:id/toggle-status',
    method: 'post',
    response: ({ url }: { url: string }) => {
      const id = url.split('/api/system/depts/')[1].split('/toggle-status')[0];
      const item = depts.find((d) => d.id === id);
      if (!item) return fail(40441, '科室不存在');
      item.status = item.status === 'enabled' ? 'disabled' : 'enabled';
      return ok(null);
    },
  },
  {
    url: '/api/system/rules',
    method: 'get',
    response: ({ query }: { query: Record<string, string> }) => {
      const pageNum = Number(query.pageNum || 1);
      const pageSize = Number(query.pageSize || 10);
      const { name = '', tag = '', content = '', deptName = '', status = '' } = query;
      return ok(
        paginate(
          rules.filter((r) => r.name.includes(name) && r.tag.includes(tag) && r.content.includes(content) && r.deptName.includes(deptName) && (!status || r.status === status)),
          pageNum,
          pageSize
        )
      );
    },
  },
  {
    url: '/api/system/rules',
    method: 'post',
    response: ({ body }: { body: Record<string, string> }) => {
      rules.unshift({
        id: `rule${Date.now()}`,
        name: body.name || '',
        tag: body.tag || '',
        content: body.content || '',
        deptName: body.deptName || '',
        status: (body.status as 'enabled' | 'disabled') || 'enabled',
        createdAt: now,
      });
      return ok(null);
    },
  },
  {
    url: '/api/system/rules/:id',
    method: 'put',
    response: ({ url, body }: { url: string; body: Record<string, string> }) => {
      const id = url.split('/api/system/rules/')[1];
      const item = rules.find((r) => r.id === id);
      if (!item) return fail(40442, '规则不存在');
      item.name = body.name || '';
      item.tag = body.tag || '';
      item.content = body.content || '';
      item.deptName = body.deptName || '';
      item.status = (body.status as 'enabled' | 'disabled') || 'enabled';
      return ok(null);
    },
  },
  {
    url: '/api/system/rules/:id',
    method: 'delete',
    response: ({ url }: { url: string }) => {
      const id = url.split('/api/system/rules/')[1];
      const index = rules.findIndex((r) => r.id === id);
      if (index < 0) return fail(40442, '?????');
      rules.splice(index, 1);
      return ok(null);
    },
  },
  {
    url: '/api/system/rules/:id/toggle-status',
    method: 'post',
    response: ({ url }: { url: string }) => {
      const id = url.split('/api/system/rules/')[1].split('/toggle-status')[0];
      const item = rules.find((r) => r.id === id);
      if (!item) return fail(40442, '规则不存在');
      item.status = item.status === 'enabled' ? 'disabled' : 'enabled';
      return ok(null);
    },
  },
  {
    url: '/api/system/semantics',
    method: 'get',
    response: ({ query }: { query: Record<string, string> }) => {
      const pageNum = Number(query.pageNum || 1);
      const pageSize = Number(query.pageSize || 10);
      const { code = '', name = '', keyword = '', deptName = '', status = '' } = query;
      return ok(
        paginate(
          semantics.filter((s) => s.code.includes(code) && s.name.includes(name) && s.keyword.includes(keyword) && s.deptName.includes(deptName) && (!status || s.status === status)),
          pageNum,
          pageSize
        )
      );
    },
  },
  {
    url: '/api/system/semantics',
    method: 'post',
    response: ({ body }: { body: Record<string, string> }) => {
      semantics.unshift({
        id: `sem${Date.now()}`,
        code: body.code || '',
        name: body.name || '',
        keyword: body.keyword || '',
        deptName: body.deptName || '',
        status: (body.status as 'enabled' | 'disabled') || 'enabled',
      });
      return ok(null);
    },
  },
  {
    url: '/api/system/semantics/:id',
    method: 'put',
    response: ({ url, body }: { url: string; body: Record<string, string> }) => {
      const id = url.split('/api/system/semantics/')[1];
      const item = semantics.find((s) => s.id === id);
      if (!item) return fail(40443, '语义不存在');
      item.code = body.code || '';
      item.name = body.name || '';
      item.keyword = body.keyword || '';
      item.deptName = body.deptName || '';
      item.status = (body.status as 'enabled' | 'disabled') || 'enabled';
      return ok(null);
    },
  },
  {
    url: '/api/system/semantics/:id',
    method: 'delete',
    response: ({ url }: { url: string }) => {
      const id = url.split('/api/system/semantics/')[1];
      const index = semantics.findIndex((s) => s.id === id);
      if (index < 0) return fail(40443, '?????');
      semantics.splice(index, 1);
      return ok(null);
    },
  },
  {
    url: '/api/system/semantics/:id/toggle-status',
    method: 'post',
    response: ({ url }: { url: string }) => {
      const id = url.split('/api/system/semantics/')[1].split('/toggle-status')[0];
      const item = semantics.find((s) => s.id === id);
      if (!item) return fail(40443, '语义不存在');
      item.status = item.status === 'enabled' ? 'disabled' : 'enabled';
      return ok(null);
    },
  },
  {
    url: '/api/system/sql-templates',
    method: 'get',
    response: ({ query }: { query: Record<string, string> }) => {
      const pageNum = Number(query.pageNum || 1);
      const pageSize = Number(query.pageSize || 10);
      const { code = '', name = '', sqlBrief = '', deptName = '', status = '' } = query;
      return ok(
        paginate(
          sqlTemplates.filter((s) => s.code.includes(code) && s.name.includes(name) && s.sqlBrief.includes(sqlBrief) && s.deptName.includes(deptName) && (!status || s.status === status)),
          pageNum,
          pageSize
        )
      );
    },
  },
  {
    url: '/api/system/sql-templates',
    method: 'post',
    response: ({ body }: { body: Record<string, string> }) => {
      sqlTemplates.unshift({
        id: `sql${Date.now()}`,
        code: body.code || '',
        name: body.name || '',
        sqlBrief: body.sqlBrief || '',
        sqlContent: body.sqlContent || body.sqlBrief || '',
        deptName: body.deptName || '',
        status: (body.status as 'enabled' | 'disabled') || 'enabled',
      });
      return ok(null);
    },
  },
  {
    url: '/api/system/sql-templates/:id',
    method: 'put',
    response: ({ url, body }: { url: string; body: Record<string, string> }) => {
      const id = url.split('/api/system/sql-templates/')[1];
      const item = sqlTemplates.find((s) => s.id === id);
      if (!item) return fail(40444, 'SQL 模板不存在');
      item.code = body.code || '';
      item.name = body.name || '';
      item.sqlBrief = body.sqlBrief || '';
      item.sqlContent = body.sqlContent || body.sqlBrief || '';
      item.deptName = body.deptName || '';
      item.status = (body.status as 'enabled' | 'disabled') || 'enabled';
      return ok(null);
    },
  },
  {
    url: '/api/system/sql-templates/:id',
    method: 'delete',
    response: ({ url }: { url: string }) => {
      const id = url.split('/api/system/sql-templates/')[1];
      const index = sqlTemplates.findIndex((s) => s.id === id);
      if (index < 0) return fail(40444, 'SQL ?????');
      sqlTemplates.splice(index, 1);
      return ok(null);
    },
  },
  {
    url: '/api/system/sql-templates/:id/test',
    method: 'post',
    response: ({ url, body }: { url: string; body: { sqlContent: string } }) => {
      const id = url.split('/api/system/sql-templates/')[1].split('/test')[0];
      const item = sqlTemplates.find((s) => s.id === id);
      if (!item) return fail(40444, 'SQL 模板不存在');
      const sql = (body?.sqlContent || '').toUpperCase();
      if (!sql.trim().startsWith('SELECT')) return fail(40044, '仅允许 SELECT 语句');
      if (/\b(UPDATE|DELETE|INSERT|DROP|TRUNCATE|ALTER|CREATE)\b/.test(sql)) return fail(40944, '命中敏感关键字，已拦截');
      return ok({ preview: `SQL 预览通过（不执行）：${body.sqlContent.slice(0, 120)}` });
    },
  },
] as MockMethod[];
