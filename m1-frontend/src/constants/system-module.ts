import type { DictDataRow, EditField, RowValue, SystemModuleKey } from '@/types/system-module';

export const SYSTEM_FIELD_LABELS: Record<string, string> = {
  id: '编号',
  account: '账号',
  name: '名称',
  roleName: '角色',
  roleCode: '角色编码',
  deptName: '科室',
  phone: '电话',
  lastLoginAt: '最后登录时间',
  userStatus: '用户状态',
  status: '状态',
  code: '编码',
  parentName: '上级科室',
  sort: '排序',
  tag: '标签',
  content: '内容',
  dictType: '字典类型',
  dictLabel: '字典标签',
  dictValue: '字典值',
  keyword: '关键词',
  sqlBrief: 'SQL 摘要',
  module: '模块',
  operator: '操作人',
  ip: 'IP',
  createdAt: '创建时间',
  userCount: '关联人数',
};

export const SYSTEM_BASE_STATUS_OPTIONS = [
  { label: '启用', value: 'enabled' },
  { label: '停用', value: 'disabled' },
] as const;

export const SYSTEM_MODULE_EDIT_FIELDS: Record<string, EditField[]> = {
  users: [
    { key: 'account', label: '账号' },
    { key: 'name', label: '姓名' },
    { key: 'deptName', label: '科室' },
    { key: 'roleName', label: '角色' },
    { key: 'phone', label: '电话' },
    { key: 'userStatus', label: '状态', type: 'select', options: [...SYSTEM_BASE_STATUS_OPTIONS] },
  ],
  roles: [
    { key: 'roleCode', label: '角色编码' },
    { key: 'roleName', label: '角色名称' },
    { key: 'deptName', label: '科室' },
  ],
  depts: [
    { key: 'code', label: '科室编码' },
    { key: 'name', label: '科室名称' },
    { key: 'parentName', label: '上级科室' },
    { key: 'sort', label: '排序' },
    { key: 'status', label: '状态', type: 'select', options: [...SYSTEM_BASE_STATUS_OPTIONS] },
  ],
  rules: [
    { key: 'name', label: '规则名称' },
    { key: 'tag', label: '标签' },
    { key: 'content', label: '规则内容' },
    { key: 'deptName', label: '科室' },
    { key: 'status', label: '状态', type: 'select', options: [...SYSTEM_BASE_STATUS_OPTIONS] },
  ],
  dicts: [
    { key: 'dictType', label: '字典类型' },
    { key: 'dictLabel', label: '字典标签' },
    { key: 'dictValue', label: '字典值' },
    { key: 'status', label: '状态', type: 'select', options: [...SYSTEM_BASE_STATUS_OPTIONS] },
    { key: 'remark', label: '备注' },
  ],
  logs: [
    { key: 'logType', label: '类型' },
    { key: 'module', label: '模块' },
    { key: 'deptName', label: '科室' },
    { key: 'ip', label: 'IP' },
    { key: 'content', label: '描述' },
  ],
};

export const SYSTEM_DICT_DATA_MAP: Record<string, DictDataRow[]> = {
  route: [
    {
      id: 'r1',
      dictCode: '1',
      dictLabel: '一号线',
      dictValue: 'line_1',
      sort: 1,
      status: 'enabled',
      remark: '线路字典',
      createdAt: '2026-01-18 10:58:21',
    },
    {
      id: 'r2',
      dictCode: '2',
      dictLabel: '二号线',
      dictValue: 'line_2',
      sort: 2,
      status: 'enabled',
      remark: '线路字典',
      createdAt: '2026-01-18 10:58:21',
    },
  ],
  type: [
    {
      id: 't1',
      dictCode: '1',
      dictLabel: '通知',
      dictValue: 'notice',
      sort: 1,
      status: 'enabled',
      remark: '消息类型',
      createdAt: '2026-01-18 10:58:21',
    },
    {
      id: 't2',
      dictCode: '2',
      dictLabel: '预警',
      dictValue: 'warning',
      sort: 2,
      status: 'enabled',
      remark: '消息类型',
      createdAt: '2026-01-18 10:58:21',
    },
    {
      id: 't3',
      dictCode: '3',
      dictLabel: '审批',
      dictValue: 'approval',
      sort: 3,
      status: 'enabled',
      remark: '消息类型',
      createdAt: '2026-01-18 10:58:21',
    },
  ],
};

export const SYSTEM_DICT_DATA_FALLBACK: DictDataRow[] = [
  {
    id: 'd1',
    dictCode: '1',
    dictLabel: '默认项 A',
    dictValue: 'A',
    sort: 1,
    status: 'enabled',
    remark: '默认字典项',
    createdAt: '2026-01-18 10:58:21',
  },
  {
    id: 'd2',
    dictCode: '2',
    dictLabel: '默认项 B',
    dictValue: 'B',
    sort: 2,
    status: 'enabled',
    remark: '默认字典项',
    createdAt: '2026-01-18 10:58:21',
  },
];

export const getSystemSemanticEditFields = (semanticTab: 'biz' | 'sql'): EditField[] =>
  semanticTab === 'biz'
    ? [
        { key: 'code', label: '语义编码' },
        { key: 'name', label: '语义名称' },
        { key: 'keyword', label: '关键词' },
        { key: 'deptName', label: '科室' },
        { key: 'status', label: '状态', type: 'select', options: [...SYSTEM_BASE_STATUS_OPTIONS] },
      ]
    : [
        { key: 'code', label: '模板编码' },
        { key: 'name', label: '模板名称' },
        { key: 'sqlBrief', label: 'SQL 摘要' },
        { key: 'deptName', label: '科室' },
        { key: 'status', label: '状态', type: 'select', options: [...SYSTEM_BASE_STATUS_OPTIONS] },
      ];

export const getSystemModuleEditFields = (module: SystemModuleKey, semanticTab: 'biz' | 'sql') =>
  module === 'semantic'
    ? getSystemSemanticEditFields(semanticTab)
    : SYSTEM_MODULE_EDIT_FIELDS[module] || [{ key: 'name', label: '名称' }];

export const formatSystemViewData = (
  module: SystemModuleKey,
  row: Record<string, unknown>,
  fieldLabels: Record<string, string> = SYSTEM_FIELD_LABELS
) =>
  Object.entries(
    Object.fromEntries(
      Object.entries(row)
        .filter(([key]) => !(module === 'rules' && key === 'code'))
        .map(([key, value]) => [key, value === 'disabled' ? '停用' : value === 'enabled' ? '启用' : value])
    )
  )
    .slice(0, 10)
    .map(([key, value]) => ({ label: fieldLabels[key] || key, value: String(value ?? '') }));

export const toRowStringRecord = (row: RowValue, fields: EditField[]) =>
  Object.fromEntries(fields.map((field) => [field.key, String(row[field.key] ?? '')]));
