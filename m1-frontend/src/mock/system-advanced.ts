import type { MockMethod } from 'vite-plugin-mock';

const now = '2026-05-17 20:00:00';

const depts: Array<{ id: string; code: string; name: string; parentId: string; parentName: string; status: 'enabled' | 'disabled'; sort: number }> = [
  { id: 'dept1', code: 'D001', name: '总队', parentId: '0', parentName: '-', status: 'enabled', sort: 1 },
  { id: 'dept2', code: 'D002', name: '科室一', parentId: 'dept1', parentName: '总队', status: 'enabled', sort: 1 },
  { id: 'dept3', code: 'D003', name: '科室二', parentId: 'dept1', parentName: '总队', status: 'enabled', sort: 2 },
  { id: 'dept4', code: 'D004', name: '科室三', parentId: 'dept1', parentName: '总队', status: 'enabled', sort: 3 },
  { id: 'dept5', code: 'D005', name: '一组', parentId: 'dept2', parentName: '科室一', status: 'enabled', sort: 1 },
];

const buildDeptTree = (items: typeof depts) => {
  const map = new Map<string, (typeof depts)[number] & { children?: Array<(typeof depts)[number] & { children?: unknown[] }> }>();
  const roots: Array<(typeof depts)[number] & { children?: unknown[] }> = [];

  items.forEach((item) => {
    map.set(item.id, { ...item, children: [] });
  });

  map.forEach((item) => {
    if (!item.parentId || item.parentId === '0' || !map.has(item.parentId)) {
      roots.push(item);
      return;
    }

    map.get(item.parentId)?.children?.push(item);
  });

  return roots;
};

const findDeptIdByName = (name: string) => depts.find((item) => item.name === name)?.id || '0';

const rules: Array<{ id: string; name: string; type: 'rule' | 'similarity'; tag: string; content: string; deptName: string; status: 'enabled' | 'disabled'; createdAt: string }> = [
  {
    id: 'rule1',
    name: '关键词',
    type: 'rule',
    tag: '',
    content: '完全匹配',
    deptName: '',
    status: 'enabled',
    createdAt: now,
  },
  {
    id: 'rule2',
    name: '文本相似度',
    type: 'similarity',
    tag: '',
    content: '相似度95%以上',
    deptName: '',
    status: 'enabled',
    createdAt: now,
  },
];

const semantics: Array<{ id: string; code: string; name: string; keyword: string; deptName: string; status: 'enabled' | 'disabled' }> = [
  {
    id: 'sem1',
    code: 'SEM001',
    name: '环比',
    keyword: '按月环比',
    deptName: '科室一',
    status: 'enabled',
  },
  {
    id: 'sem2',
    code: 'SEM002',
    name: '分析报告',
    keyword: '对绩效数据从时间、科室进行趋势分析和数据解释',
    deptName: '科室二',
    status: 'enabled',
  },
];

const sqlTemplates: Array<{ id: string; code: string; name: string; sqlBrief: string; sqlContent: string; deptName: string; status: 'enabled' | 'disabled' }> = [];

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
      const { code = '', name = '', parentName = '', status = '' } = query;
      const filtered = depts.filter((d) => d.code.includes(code) && d.name.includes(name) && d.parentName.includes(parentName) && (!status || d.status === status));
      return ok({ list: buildDeptTree(filtered), total: filtered.length, pageNum: 1, pageSize: filtered.length });
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
        parentId: String(body.parentId || findDeptIdByName(String(body.parentName || '')) || '0'),
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
      item.parentId = String(body.parentId || findDeptIdByName(String(body.parentName || '')) || '0');
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
      if (index < 0) return fail(40441, '科室不存在');
      if (depts.some((item) => item.parentId === id)) return fail(40941, '存在下级科室，不可删除');
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
      const { name = '', type = '', tag = '', content = '', deptName = '', status = '' } = query;
      return ok(
        paginate(
          rules.filter(
            (r) =>
              r.name.includes(name) &&
              (!type || r.type === type) &&
              r.tag.includes(tag) &&
              r.content.includes(content) &&
              r.deptName.includes(deptName) &&
              (!status || r.status === status),
          ),
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
        type: (body.type as 'rule' | 'similarity') || 'rule',
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
      item.type = (body.type as 'rule' | 'similarity') || 'rule';
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
      if (index < 0) return fail(40442, '规则不存在');
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
      if (index < 0) return fail(40443, '语义不存在');
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
      if (index < 0) return fail(40444, 'SQL 模板不存在');
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
