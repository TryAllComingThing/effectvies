import { reactive, ref, type Ref } from 'vue';
import {
  SYSTEM_BASE_STATUS_OPTIONS,
  SYSTEM_DICT_DATA_FALLBACK,
  SYSTEM_DICT_DATA_MAP,
  getSystemModuleEditFields,
  formatSystemViewData,
  toRowStringRecord,
} from '@/constants/system-module';
import type { DictDataRow, EditField, EditMode, RowValue, SystemModuleKey, ViewDataItem } from '@/types/system-module';

type UseSystemModuleDialogsOptions = {
  activeModule: Ref<SystemModuleKey>;
  semanticTab: Ref<'biz' | 'sql'>;
  deptParentOptions: Ref<string[]>;
};

export const useSystemModuleDialogs = ({ activeModule, semanticTab, deptParentOptions }: UseSystemModuleDialogsOptions) => {
  const viewVisible = ref(false);
  const editVisible = ref(false);
  const deleteVisible = ref(false);
  const dictDataVisible = ref(false);

  const editMode = ref<EditMode>('create');
  const viewData = ref<ViewDataItem[]>([]);
  const editForm = reactive<Record<string, string>>({});
  const editFields = ref<EditField[]>([]);
  const dictDataTitle = ref('');
  const dictDataRows = ref<DictDataRow[]>([]);

  const clearEditForm = () => {
    Object.keys(editForm).forEach((key) => {
      editForm[key] = '';
    });
  };

  const applyEditFields = (fields: EditField[], row?: RowValue) => {
    editFields.value = fields;
    clearEditForm();

    if (row) {
      if (row.id != null) {
        editForm.id = String(row.id);
      }
      Object.assign(editForm, toRowStringRecord(row, fields));
      return;
    }

    fields.forEach((field) => {
      editForm[field.key] = '';
    });
  };

  const openViewDialog = (row: Record<string, unknown>) => {
    viewData.value = formatSystemViewData(activeModule.value, row);
    viewVisible.value = true;
  };

  const openEditDialog = (row: RowValue) => {
    editMode.value = 'edit';
    applyEditFields(getSystemModuleEditFields(activeModule.value, semanticTab.value), row);
    editVisible.value = true;
  };

  const openCreateDialog = () => {
    editMode.value = 'create';

    if (activeModule.value === 'depts') {
      applyEditFields([
        { key: 'code', label: '科室编码' },
        { key: 'name', label: '科室名称' },
        {
          key: 'parentName',
          label: '上级科室',
          type: 'select',
          options: deptParentOptions.value.map((item) => ({ label: item, value: item })),
        },
        { key: 'sort', label: '排序' },
        { key: 'status', label: '状态', type: 'select', options: [...SYSTEM_BASE_STATUS_OPTIONS] },
      ]);
    } else {
      applyEditFields(getSystemModuleEditFields(activeModule.value, semanticTab.value));
    }

    editVisible.value = true;
  };

  const openDeptCreateChildDialog = (row: Record<string, unknown>) => {
    editMode.value = 'create';
    applyEditFields([
      { key: 'code', label: '科室编码' },
      { key: 'name', label: '科室名称' },
      { key: 'sort', label: '排序' },
      { key: 'status', label: '状态', type: 'select', options: [...SYSTEM_BASE_STATUS_OPTIONS] },
    ]);
    editForm.parentName = String(row.name ?? '');
    editVisible.value = true;
  };

  const openDictData = (row: Record<string, unknown>) => {
    dictDataTitle.value = String(row.dictLabel || row.dictType || '字典');
    const key = String(row.dictType || 'type');
    dictDataRows.value = (SYSTEM_DICT_DATA_MAP[key] || SYSTEM_DICT_DATA_FALLBACK).map((item) => ({ ...item }));
    dictDataVisible.value = true;
  };

  const openDictDataCreate = () => {
    editMode.value = 'create';
    applyEditFields([
      { key: 'dictCode', label: '字典编码' },
      { key: 'dictLabel', label: '字典标签' },
      { key: 'dictValue', label: '字典值' },
      { key: 'sort', label: '排序' },
      { key: 'status', label: '状态', type: 'select', options: [...SYSTEM_BASE_STATUS_OPTIONS] },
      { key: 'remark', label: '备注' },
    ]);
    editVisible.value = true;
  };

  const openDictDataEdit = (row: Record<string, unknown>) => {
    editMode.value = 'edit';
    applyEditFields(
      [
        { key: 'dictCode', label: '字典编码' },
        { key: 'dictLabel', label: '字典标签' },
        { key: 'dictValue', label: '字典值' },
        { key: 'sort', label: '排序' },
        { key: 'status', label: '状态', type: 'select', options: [...SYSTEM_BASE_STATUS_OPTIONS] },
        { key: 'remark', label: '备注' },
      ],
      row
    );
    editVisible.value = true;
  };

  return {
    viewVisible,
    editVisible,
    deleteVisible,
    dictDataVisible,
    editMode,
    viewData,
    editForm,
    editFields,
    dictDataTitle,
    dictDataRows,
    openViewDialog,
    openEditDialog,
    openCreateDialog,
    openDeptCreateChildDialog,
    openDictData,
    openDictDataCreate,
    openDictDataEdit,
  };
};
