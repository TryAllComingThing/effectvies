import type { MockMethod } from 'vite-plugin-mock';

const now = '2026-05-17 20:00:00';

const users = Array.from({ length: 53 }, (_, i) => ({
  id: `u${i + 1}`,
  account: `user${i + 1}`,
  name: `用户${i + 1}`,
  deptName: ['科室一', '科室二', '科室三'][i % 3],
  roleName: i % 5 === 0 ? '管理员' : '普通用户',
  phone: `1380000${String(1000 + i).slice(-4)}`,
  userStatus: i % 4 === 0 ? 'disabled' : 'enabled',
  createdAt: now,
  lastLoginAt: now,
}));

const roles = [
  { id: 'r1', roleCode: 'admin', roleName: '管理员', deptName: '科室一', userCount: 3, createdAt: now },
  { id: 'r2', roleCode: 'user', roleName: '普通用户', deptName: '科室一', userCount: 50, createdAt: now },
  { id: 'r3', roleCode: 'guest', roleName: '访客', deptName: '科室一', userCount: 0, createdAt: now },
];

const dicts = Array.from({ length: 30 }, (_, i) => ({
  id: `d${i + 1}`,
  dictType: i % 2 === 0 ? 'route' : 'type',
  dictLabel: `字典项${i + 1}`,
  dictValue: `value_${i + 1}`,
  status: i % 4 === 0 ? 'disabled' : 'enabled',
  remark: '',
}));

const logs = Array.from({ length: 66 }, (_, i) => ({
  id: `l${i + 1}`,
  logType: i % 2 === 0 ? 'login' : 'operation',
  module: i % 2 === 0 ? '登录模块' : '绩效模块',
  operator: `操作员${(i % 8) + 1}`,
  deptName: ['科室一', '科室二', '科室三'][i % 3],
  ip: `10.11.1.${(i % 30) + 10}`,
  content: i % 2 === 0 ? '用户登录成功' : '执行了绩效审核操作',
  createdAt: now,
}));

const ok = (data: unknown) => ({ code: 0, message: 'success', traceId: `trace_${Date.now()}`, data });
const fail = (code: number, message: string) => ({ code, message, traceId: `trace_${Date.now()}`, data: null });
const paginate = <T>(list: T[], pageNum: number, pageSize: number) => ({ list: list.slice((pageNum - 1) * pageSize, (pageNum - 1) * pageSize + pageSize), total: list.length, pageNum, pageSize });

export default [
  {
    url: '/api/system/users', method: 'get', response: ({ query }: { query: Record<string, string> }) => {
      const pageNum = Number(query.pageNum || 1), pageSize = Number(query.pageSize || 10);
      const { account = '', name = '', deptName = '', roleName = '', userStatus = '' } = query;
      const filtered = users.filter((u) => u.account.includes(account) && u.name.includes(name) && u.deptName.includes(deptName) && (!roleName || u.roleName === roleName) && (!userStatus || u.userStatus === userStatus));
      return ok(paginate(filtered, pageNum, pageSize));
    },
  },
  { url: '/api/system/users/:id/toggle-status', method: 'post', response: ({ url }: { url: string }) => { const id = url.split('/api/system/users/')[1].split('/toggle-status')[0]; const user = users.find((u) => u.id === id); if (!user) return fail(40431, '用户不存在'); user.userStatus = user.userStatus === 'enabled' ? 'disabled' : 'enabled'; return ok(null); } },
  {
    url: '/api/system/roles', method: 'get', response: ({ query }: { query: Record<string, string> }) => {
      const pageNum = Number(query.pageNum || 1), pageSize = Number(query.pageSize || 10);
      const { roleCode = '', roleName = '', deptName = '' } = query;
      const filtered = roles.filter((r) => r.roleCode.includes(roleCode) && r.roleName.includes(roleName) && r.deptName.includes(deptName));
      return ok(paginate(filtered, pageNum, pageSize));
    },
  },
  { url: '/api/system/roles/:id', method: 'delete', response: ({ url }: { url: string }) => { const id = url.split('/api/system/roles/')[1]; const idx = roles.findIndex((r) => r.id === id); if (idx < 0) return fail(40432, '角色不存在'); if (roles[idx].userCount > 0) return fail(40932, '角色已绑定用户，不可删除'); roles.splice(idx, 1); return ok(null); } },
  {
    url: '/api/system/dicts', method: 'get', response: ({ query }: { query: Record<string, string> }) => {
      const pageNum = Number(query.pageNum || 1), pageSize = Number(query.pageSize || 10);
      const { dictType = '', dictLabel = '', status = '' } = query;
      const filtered = dicts.filter((d) => d.dictType.includes(dictType) && d.dictLabel.includes(dictLabel) && (!status || d.status === status));
      return ok(paginate(filtered, pageNum, pageSize));
    },
  },
  { url: '/api/system/dicts/:id/toggle-status', method: 'post', response: ({ url }: { url: string }) => { const id = url.split('/api/system/dicts/')[1].split('/toggle-status')[0]; const dict = dicts.find((d) => d.id === id); if (!dict) return fail(40433, '字典项不存在'); dict.status = dict.status === 'enabled' ? 'disabled' : 'enabled'; return ok(null); } },
  {
    url: '/api/system/dicts', method: 'post', response: ({ body }: { body: { dictType: string; dictLabel: string; dictValue: string; status: 'enabled' | 'disabled'; remark?: string } }) => {
      if (!body?.dictType?.trim()) return fail(40034, '字典类型不能为空');
      if (!body?.dictLabel?.trim()) return fail(40035, '字典标签不能为空');
      if (!body?.dictValue?.trim()) return fail(40036, '字典键值不能为空');
      const id = `d${Date.now()}`;
      dicts.unshift({ id, dictType: body.dictType, dictLabel: body.dictLabel, dictValue: body.dictValue, status: body.status || 'enabled', remark: body.remark || '' });
      return ok(null);
    },
  },
  {
    url: '/api/system/dicts/:id', method: 'put', response: ({ url, body }: { url: string; body: { dictType: string; dictLabel: string; dictValue: string; status: 'enabled' | 'disabled'; remark?: string } }) => {
      const id = url.split('/api/system/dicts/')[1];
      const item = dicts.find((d) => d.id === id);
      if (!item) return fail(40433, '字典项不存在');
      item.dictType = body.dictType;
      item.dictLabel = body.dictLabel;
      item.dictValue = body.dictValue;
      item.status = body.status || 'enabled';
      item.remark = body.remark || '';
      return ok(null);
    },
  },
  {
    url: '/api/system/dicts/:id', method: 'delete', response: ({ url }: { url: string }) => {
      const id = url.split('/api/system/dicts/')[1];
      const index = dicts.findIndex((d) => d.id === id);
      if (index < 0) return fail(40433, '字典项不存在');
      dicts.splice(index, 1);
      return ok(null);
    },
  },
  {
    url: '/api/system/logs', method: 'get', response: ({ query }: { query: Record<string, string> }) => {
      const pageNum = Number(query.pageNum || 1), pageSize = Number(query.pageSize || 10);
      const { logType = '', operator = '', module = '', deptName = '' } = query;
      const filtered = logs.filter((l) => (!logType || l.logType === logType) && l.operator.includes(operator) && l.module.includes(module) && l.deptName.includes(deptName));
      return ok(paginate(filtered, pageNum, pageSize));
    },
  },
  { url: '/api/system/logs/batch-delete', method: 'post', response: ({ body }: { body: { ids: string[] } }) => { (body?.ids || []).forEach((id) => { const idx = logs.findIndex((l) => l.id === id); if (idx >= 0) logs.splice(idx, 1); }); return ok(null); } },
] as MockMethod[];
