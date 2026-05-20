import type { RouteRecordRaw } from 'vue-router';

export interface AppRouteMeta {
  title: string;
  icon?: string;
  requiresAuth?: boolean;
  roles?: Array<'admin' | 'user'>;
  permissions?: string[];
  hidden?: boolean;
  keepAlive?: boolean;
}

export type AppRouteRecordRaw = RouteRecordRaw & { meta: AppRouteMeta };

export const appRoutes: AppRouteRecordRaw[] = [
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/dashboard/DashboardView.vue'),
    meta: { title: '工作台', icon: 'LayoutDashboard', requiresAuth: true, roles: ['admin', 'user'] },
  },
  {
    path: '/perf-files',
    name: 'PerfFiles',
    component: () => import('@/views/perf-file/PerfFileView.vue'),
    meta: { title: '绩效文件管理', icon: 'FileSpreadsheet', requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/perf-files/log',
    name: 'PerfFileLog',
    component: () => import('@/views/perf-file/PerfFileLogView.vue'),
    meta: { title: '解析日志', icon: 'FileText', requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/perf-tasks',
    name: 'PerfTasks',
    component: () => import('@/views/perf-task/PerfTaskView.vue'),
    meta: { title: '任务管理', icon: 'ListChecks', requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/perf-review',
    name: 'PerfReview',
    component: () => import('@/views/perf-review/PerfReviewView.vue'),
    meta: { title: '绩效审核管理', icon: 'ClipboardCheck', requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/performance',
    name: 'Performance',
    component: () => import('@/views/performance/PerformanceView.vue'),
    meta: { title: '绩效总览', icon: 'BarChart3', requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/analysis/ask',
    name: 'AnalysisAsk',
    component: () => import('@/views/analysis/AnalysisAskView.vue'),
    meta: { title: '智能问数', icon: 'MessageCircleQuestion', requiresAuth: true, roles: ['admin', 'user'] },
  },
  {
    path: '/analysis/table',
    name: 'AnalysisTable',
    component: () => import('@/views/reports/ReportView.vue'),
    meta: { title: '绩效报表', icon: 'Table2', requiresAuth: true, roles: ['admin', 'user'] },
  },
  {
    path: '/analysis/report',
    name: 'AnalysisReport',
    component: () => import('@/views/reports/PerfReportView.vue'),
    meta: { title: '智能报告', icon: 'FileText', requiresAuth: true, roles: ['admin', 'user'] },
  },
  {
    path: '/analysis/performance-report',
    name: 'AnalysisPerformanceReport',
    component: () => import('@/views/reports/PerformanceReportView.vue'),
    meta: { title: '绩效报告', icon: 'FileStack', requiresAuth: true, roles: ['admin', 'user'] },
  },
  {
    path: '/analysis/template',
    name: 'AnalysisTemplate',
    component: () => import('@/views/reports/ReportTemplateView.vue'),
    meta: { title: '报告模板', icon: 'FileCog', requiresAuth: true, roles: ['admin', 'user'] },
  },
  {
    path: '/system/users',
    name: 'SystemUsers',
    component: () => import('@/views/system/SystemUsersView.vue'),
    meta: { title: '用户管理', icon: 'Users', requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/system/depts',
    name: 'SystemDepts',
    component: () => import('@/views/system/SystemDeptsView.vue'),
    meta: { title: '科室管理', icon: 'Building2', requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/system/roles',
    name: 'SystemRoles',
    component: () => import('@/views/system/SystemRolesView.vue'),
    meta: { title: '角色管理', icon: 'ShieldCheck', requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/system/rules',
    name: 'SystemRules',
    component: () => import('@/views/system/SystemRulesView.vue'),
    meta: { title: '规则管理', icon: 'FileCode2', requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/system/semantic',
    name: 'SystemSemantic',
    component: () => import('@/views/system/SystemSemanticView.vue'),
    meta: { title: '语义管理', icon: 'BookOpenText', requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/system/dicts',
    name: 'SystemDicts',
    component: () => import('@/views/system/SystemDictsView.vue'),
    meta: { title: '字典管理', icon: 'Database', requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/system/logs',
    name: 'SystemLogs',
    component: () => import('@/views/system/SystemLogsView.vue'),
    meta: { title: '日志管理', icon: 'ScrollText', requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/system/platform',
    name: 'SystemPlatform',
    component: () => import('@/views/system/PlatformConfigView.vue'),
    meta: { title: '平台配置', icon: 'PanelsTopLeft', requiresAuth: true, roles: ['admin'] },
  },
];
