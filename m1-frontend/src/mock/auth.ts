import type { MockMethod } from 'vite-plugin-mock';

const ADMIN_MENU_ROUTE_NAMES = [
  'Dashboard',
  'PerfFiles',
  'PerfFileLog',
  'PerfTasks',
  'PerfReview',
  'Performance',
  'AnalysisAsk',
  'AnalysisTable',
  'AnalysisReport',
  'AnalysisPerformanceReport',
  'AnalysisTemplate',
  'SystemUsers',
  'SystemDepts',
  'SystemRoles',
  'SystemRules',
  'SystemSemantic',
  'SystemDicts',
  'SystemLogs',
  'SystemPlatform',
];

const USER_MENU_ROUTE_NAMES = [
  'Dashboard',
  'AnalysisAsk',
  'AnalysisTable',
  'AnalysisReport',
  'AnalysisPerformanceReport',
  'AnalysisTemplate',
];

export default [
  {
    url: '/api/auth/login',
    method: 'post',
    response: ({ body }: { body: { account: string; role: 'admin' | 'user' } }) => ({
      code: 0,
      message: 'success',
      traceId: `trace_${Date.now()}`,
      data: {
        token: `token_${Date.now()}`,
        profile: {
          id: String(Date.now()),
          account: body.account,
          name: body.role === 'admin' ? '系统管理员' : '普通用户',
          roleCode: body.role,
        },
        roles: [body.role],
        permissions:
          body.role === 'admin'
            ? ['*']
            : ['dashboard:view', 'analysis:ask:view', 'analysis:table:view', 'analysis:report:view', 'analysis:template:view'],
        menuRouteNames: body.role === 'admin' ? ADMIN_MENU_ROUTE_NAMES : USER_MENU_ROUTE_NAMES,
      },
    }),
  },
] as MockMethod[];
