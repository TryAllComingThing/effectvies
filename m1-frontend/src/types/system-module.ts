export type SystemModuleKey = 'users' | 'depts' | 'roles' | 'rules' | 'semantic' | 'dicts' | 'logs';
export type EditMode = 'create' | 'edit';
export type RowValue = Record<PropertyKey, unknown>;
export type DeleteTarget = {
  id?: string;
  type?: 'role';
};

export type EditField = {
  key: string;
  label: string;
  type?: 'input' | 'select';
  options?: Array<{ label: string; value: string }>;
};

export type DictDataRow = {
  id: string;
  dictCode: string;
  dictLabel: string;
  dictValue: string;
  sort: number;
  status: 'enabled' | 'disabled';
  remark: string;
  createdAt: string;
};

export type ViewDataItem = {
  label: string;
  value: string;
};
