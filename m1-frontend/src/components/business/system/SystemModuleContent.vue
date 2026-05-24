<template>
  <PageContainer :title="moduleTitle">
    <template #actions v-if="activeModule !== 'logs'">
      <el-space>
        <el-button type="primary" v-permission="['admin']" @click="openCreateDialog">新增</el-button>
        <el-button
          type="danger"
          plain
          :disabled="currentSelectionCount === 0"
          v-permission="['admin']"
          @click="confirmDelete()"
        >
          删除
        </el-button>
      </el-space>
    </template>

    <template v-if="activeModule === 'users'">
      <SystemUsersTable
        :user-query="userQuery"
        :users-loading="usersLoading"
        :users="users"
        :user-total="userTotal"
        @search="loadUsers"
        @reset="resetUsers"
        @selection-change="onUserSelect"
        @view="openViewDialog"
        @edit="openEditDialog"
        @reset-password="confirmResetPassword"
        @toggle="toggleUser"
      />
    </template>

    <template v-else-if="activeModule === 'roles'">
      <SystemRolesTable
        :role-query="roleQuery"
        :roles-loading="rolesLoading"
        :roles="roles"
        :role-total="roleTotal"
        @search="loadRoles"
        @reset="resetRoles"
        @selection-change="onRoleSelect"
        @view="openViewDialog"
        @edit="openEditDialog"
        @delete="(id) => confirmDelete(id, 'role')"
      />
    </template>

    <template v-else-if="activeModule === 'depts'">
      <SystemDeptsTable
        :dept-query="deptQuery"
        :depts-loading="deptsLoading"
        :depts="depts"
        @search="loadDepts"
        @reset="resetDepts"
        @selection-change="onDeptSelect"
        @create-child="openDeptCreateChildDialog"
        @edit="openEditDialog"
        @delete="(id) => confirmDelete(id, 'dept')"
        @toggle="toggleDept"
      />
    </template>

    <template v-else-if="activeModule === 'rules'">
      <SystemRulesTable
        :rule-query="ruleQuery"
        :rules-loading="rulesLoading"
        :rules="rules"
        :rule-total="ruleTotal"
        @search="loadRules"
        @reset="resetRules"
        @selection-change="onRuleSelect"
        @view="openViewDialog"
        @edit="openEditDialog"
        @toggle="toggleRule"
      />
    </template>

    <template v-else-if="activeModule === 'semantic'">
      <SystemSemanticTabs
        v-model:tab="semanticTab"
        :semantic-query="semanticQuery"
        :semantics-loading="semanticsLoading"
        :semantics="semantics"
        :semantic-total="semanticTotal"
        :sql-query="sqlQuery"
        :sql-loading="sqlLoading"
        :sql-templates="sqlTemplates"
        :sql-total="sqlTotal"
        @search-semantic="loadSemantics"
        @reset-semantic="resetSemantics"
        @semantic-selection-change="onSemanticSelect"
        @semantic-edit="openEditDialog"
        @semantic-toggle="toggleSemantic"
        @search-sql="loadSqlTemplates"
        @reset-sql="resetSqlTemplates"
        @sql-selection-change="onSqlSelect"
        @sql-edit="openEditDialog"
        @sql-test="testSql"
      />
    </template>

    <template v-else-if="activeModule === 'dicts'">
      <SystemDictsTable
        :dict-query="dictQuery"
        :dicts-loading="dictsLoading"
        :dicts="dicts"
        :dict-total="dictTotal"
        @search="loadDicts"
        @reset="resetDicts"
        @selection-change="onDictSelect"
        @edit="openEditDialog"
        @view-data="openDictData"
        @toggle="toggleDict"
      />
    </template>

    <template v-else-if="activeModule === 'logs'">
      <SystemLogsTable
        v-model:log-type="logType"
        :log-query="logQuery"
        :log-query-form="logQueryForm"
        :logs-loading="logsLoading"
        :logs="logs"
        :log-total="logTotal"
        @search="loadLogs"
        @reset="resetLogs"
        @selection-change="onLogSelect"
        @delete="confirmDelete()"
      />
    </template>

    <SystemModuleDialogs
      v-model:view-visible="viewVisible"
      v-model:edit-visible="editVisible"
      v-model:delete-visible="deleteVisible"
      v-model:dict-data-visible="dictDataVisible"
      :module-title="moduleTitle"
      :view-data="viewData"
      :edit-mode="editMode"
      :edit-form="editForm"
      :edit-fields="editFields"
      :dict-data-title="dictDataTitle"
      :dict-data-rows="dictDataRows"
      @submit-edit="submitEdit"
      @run-delete="runDelete"
      @confirm-delete="confirmDelete()"
      @open-dict-data-create="openDictDataCreate"
      @open-dict-data-edit="openDictDataEdit"
    />

  </PageContainer>
</template>

<script setup lang="ts">
import { computed, ref, toRef, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import PageContainer from '@/components/common/PageContainer.vue';
import SystemModuleDialogs from '@/components/business/system/SystemModuleDialogs.vue';
import SystemSemanticTabs from '@/components/business/system/SystemSemanticTabs.vue';
import SystemDictsTable from '@/components/business/system/SystemDictsTable.vue';
import SystemLogsTable from '@/components/business/system/SystemLogsTable.vue';
import SystemUsersTable from '@/components/business/system/SystemUsersTable.vue';
import SystemRolesTable from '@/components/business/system/SystemRolesTable.vue';
import SystemDeptsTable from '@/components/business/system/SystemDeptsTable.vue';
import SystemRulesTable from '@/components/business/system/SystemRulesTable.vue';
import { useSystemModuleDialogs } from '@/composables/modules/system/useSystemModuleDialogs';
import { createUser, deleteUser, resetUserPassword, updateUser } from '@/api/modules/system/user';
import { createRole, updateRole } from '@/api/modules/system/role';
import { createDept, deleteDept, updateDept } from '@/api/modules/system/dept';
import { createRule, deleteRule, updateRule } from '@/api/modules/system/rule';
import {
  createSemantic,
  createSqlTemplate,
  deleteSemantic,
  deleteSqlTemplate,
  updateSemantic,
  updateSqlTemplate,
} from '@/api/modules/system/semantic';
import { useSystemModuleMeta } from '@/composables/modules/system/useSystemModuleMeta';
import { useSystemUsers } from '@/composables/modules/system/useSystemUsers';
import { useSystemRoles } from '@/composables/modules/system/useSystemRoles';
import { useSystemDepts } from '@/composables/modules/system/useSystemDepts';
import { useSystemDicts } from '@/composables/modules/system/useSystemDicts';
import { useSystemRules } from '@/composables/modules/system/useSystemRules';
import { useSystemLogs } from '@/composables/modules/system/useSystemLogs';
import { useSystemSemantic } from '@/composables/modules/system/useSystemSemantic';
import type { DeleteTarget, SystemModuleKey } from '@/types/system-module';

const props = defineProps<{
  module?: SystemModuleKey;
}>();

const { activeModule, moduleTitle } = useSystemModuleMeta(toRef(props, 'module'));

const { usersLoading, users, userTotal, selectedUserIds, userQuery, loadUsers, resetUsers, toggleUser, onUserSelect } = useSystemUsers();
const { rolesLoading, roles, roleTotal, selectedRoleIds, roleQuery, loadRoles, resetRoles, removeRole, onRoleSelect } = useSystemRoles();
const {
  semanticTab,
  semanticsLoading,
  semantics,
  semanticTotal,
  semanticQuery,
  selectedSemanticIds,
  sqlLoading,
  sqlTemplates,
  sqlTotal,
  sqlQuery,
  selectedSqlIds,
  loadSemantics,
  resetSemantics,
  toggleSemantic,
  loadSqlTemplates,
  resetSqlTemplates,
  testSql,
  onSemanticSelect,
  onSqlSelect,
} = useSystemSemantic();

const currentSelectionCount = computed(() => {
  const countMap: Record<string, number> = {
    users: selectedUserIds.value.length,
    roles: selectedRoleIds.value.length,
    depts: selectedDeptIds.value.length,
    rules: selectedRuleIds.value.length,
    semantic: semanticTab.value === 'biz' ? selectedSemanticIds.value.length : selectedSqlIds.value.length,
    dicts: selectedDictIds.value.length,
    logs: selectedLogIds.value.length,
  };
  return countMap[activeModule.value] || 0;
});

const { deptsLoading, depts, selectedDeptIds, deptQuery, deptParentOptions, loadDepts, resetDepts, toggleDept, onDeptSelect } = useSystemDepts();

const { rulesLoading, rules, ruleTotal, selectedRuleIds, ruleQuery, loadRules, resetRules, toggleRule, onRuleSelect } = useSystemRules();

const { dictsLoading, dicts, dictTotal, selectedDictIds, dictQuery, loadDicts, resetDicts, toggleDict, saveDict, removeDict, onDictSelect } = useSystemDicts();

const { logsLoading, logs, logTotal, selectedLogIds, logQuery, logQueryForm, logType, loadLogs, resetLogs, deleteSelectedLogs, onLogSelect } = useSystemLogs();

const {
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
} = useSystemModuleDialogs({
  activeModule,
  semanticTab,
  deptParentOptions,
});

const deleteTarget = ref<DeleteTarget>({});

const submitEdit = async () => {
  if (activeModule.value === 'users') {
    const payload = {
      account: editForm.account || '',
      name: editForm.name || '',
      deptName: editForm.deptName || '',
      roleName: editForm.roleName || '',
      phone: editForm.phone || '',
      userStatus: (editForm.userStatus as 'enabled' | 'disabled') || 'enabled',
    };

    if (editMode.value === 'create') {
      await createUser(payload);
    } else if (editForm.id) {
      await updateUser(editForm.id, payload);
    }

    ElMessage.success(editMode.value === 'create' ? '新增成功' : '编辑成功');
    editVisible.value = false;
    loadUsers();
    return;
  }

  if (activeModule.value === 'roles') {
    const payload = {
      roleCode: editForm.roleCode || '',
      roleName: editForm.roleName || '',
      deptName: editForm.deptName || '',
    };

    if (editMode.value === 'create') {
      await createRole(payload);
    } else if (editForm.id) {
      await updateRole(editForm.id, payload);
    }

    ElMessage.success(editMode.value === 'create' ? '新增成功' : '编辑成功');
    editVisible.value = false;
    loadRoles();
    return;
  }

  if (activeModule.value === 'depts') {
    const payload = {
      code: editForm.code || '',
      name: editForm.name || '',
      parentName: editForm.parentName || '',
      parentId: editForm.parentId || '',
      status: (editForm.status as 'enabled' | 'disabled') || 'enabled',
      sort: Number(editForm.sort || 0),
    };

    if (editMode.value === 'create') {
      await createDept(payload);
    } else if (editForm.id) {
      await updateDept(editForm.id, payload);
    }

    ElMessage.success(editMode.value === 'create' ? '新增成功' : '编辑成功');
    editVisible.value = false;
    loadDepts();
    return;
  }

  if (activeModule.value === 'rules') {
    const payload = {
      name: editForm.name || '',
      type: (editForm.type as 'rule' | 'similarity') || 'rule',
      tag: editForm.tag || '',
      content: editForm.content || '',
      deptName: editForm.deptName || '',
      status: (editForm.status as 'enabled' | 'disabled') || 'enabled',
    };

    if (editMode.value === 'create') {
      await createRule(payload);
    } else if (editForm.id) {
      await updateRule(editForm.id, payload);
    }

    ElMessage.success(editMode.value === 'create' ? '新增成功' : '编辑成功');
    editVisible.value = false;
    loadRules();
    return;
  }

  if (activeModule.value === 'semantic') {
    if (semanticTab.value === 'biz') {
      const payload = {
        code: editForm.code || '',
        name: editForm.name || '',
        keyword: editForm.keyword || '',
        deptName: editForm.deptName || '',
        status: (editForm.status as 'enabled' | 'disabled') || 'enabled',
      };

      if (editMode.value === 'create') {
        await createSemantic(payload);
      } else if (editForm.id) {
        await updateSemantic(editForm.id, payload);
      }

      ElMessage.success(editMode.value === 'create' ? '新增成功' : '编辑成功');
      editVisible.value = false;
      loadSemantics();
      return;
    }

    const payload = {
      code: editForm.code || '',
      name: editForm.name || '',
      sqlBrief: editForm.sqlBrief || '',
      sqlContent: editForm.sqlContent || editForm.sqlBrief || '',
      deptName: editForm.deptName || '',
      status: (editForm.status as 'enabled' | 'disabled') || 'enabled',
    };

    if (editMode.value === 'create') {
      await createSqlTemplate(payload);
    } else if (editForm.id) {
      await updateSqlTemplate(editForm.id, payload);
    }

    ElMessage.success(editMode.value === 'create' ? '新增成功' : '编辑成功');
    editVisible.value = false;
    loadSqlTemplates();
    return;
  }

  if (activeModule.value === 'dicts') {
    const payload = {
      dictType: editForm.dictType || '',
      dictLabel: editForm.dictLabel || '',
      dictValue: editForm.dictValue || '',
      status: (editForm.status as 'enabled' | 'disabled') || 'enabled',
      remark: editForm.remark || '',
    };

    if (editMode.value === 'create') {
      await saveDict(payload);
    } else if (editForm.id) {
      await saveDict(payload, editForm.id);
    }

    ElMessage.success(editMode.value === 'create' ? '新增成功' : '编辑成功');
    editVisible.value = false;
    return;
  }

  ElMessage.success(editMode.value === 'create' ? '新增成功' : '编辑成功');
  editVisible.value = false;
};

const confirmDelete = (id?: string, type?: 'role' | 'dept') => {
  deleteTarget.value = { id, type };
  deleteVisible.value = true;
};

const runDelete = async () => {
  deleteVisible.value = false;

  if (deleteTarget.value.type === 'role' && deleteTarget.value.id) {
    await removeRole(deleteTarget.value.id);
    deleteTarget.value = {};
    return;
  }

  if (deleteTarget.value.type === 'dept' && deleteTarget.value.id) {
    await deleteDept(deleteTarget.value.id);
    ElMessage.success('删除成功');
    loadDepts();
    deleteTarget.value = {};
    return;
  }

  if (activeModule.value === 'users' && editForm.id) {
    await deleteUser(editForm.id);
    ElMessage.success('删除成功');
    loadUsers();
    return;
  }

  if (activeModule.value === 'rules' && editForm.id) {
    await deleteRule(editForm.id);
    ElMessage.success('删除成功');
    loadRules();
    return;
  }

  if (activeModule.value === 'semantic' && editForm.id) {
    if (semanticTab.value === 'biz') {
      await deleteSemantic(editForm.id);
      ElMessage.success('删除成功');
      loadSemantics();
      return;
    }

    await deleteSqlTemplate(editForm.id);
    ElMessage.success('删除成功');
    loadSqlTemplates();
    return;
  }

  if (activeModule.value === 'dicts' && editForm.id) {
    await removeDict(editForm.id);
    return;
  }

  if (activeModule.value === 'logs' && selectedLogIds.value.length) {
    await deleteSelectedLogs();
    return;
  }

  ElMessage.success('删除成功');
};

const confirmResetPassword = async (row: Record<string, unknown>) => {
  try {
    await ElMessageBox.confirm(`确认重置 ${String(row.name || row.account || '用户')} 的密码吗？`, '重置确认', {
      type: 'warning',
      confirmButtonText: '确认',
      cancelButtonText: '取消',
    });
    await resetUserPassword(String(row.id || ''));
    ElMessage.success('密码重置成功');
  } catch {
    // cancel
  }
};


const loadByModule = (module: string) => {
  if (module === 'users') loadUsers();
  if (module === 'roles') loadRoles();
  if (module === 'depts') loadDepts();
  if (module === 'rules') loadRules();
  if (module === 'semantic') {
    loadSemantics();
    loadSqlTemplates();
  }
  if (module === 'dicts') loadDicts();
  if (module === 'logs') loadLogs();
};

watch(
  activeModule,
  (module) => {
    loadByModule(module);
  },
  { immediate: true }
);
</script>

<style scoped>
.query-row {
  margin-bottom: 0.7rem;
}

.pager {
  margin-top: 0.8rem;
  display: flex;
  justify-content: flex-end;
}

.query-row :deep(.el-input) {
  min-width: 88px;
}

.dict-data-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.dict-data-dialog :deep(.el-dialog) {
  overflow: hidden;
}

.dict-data-dialog :deep(.el-dialog__header) {
  padding: 14px 16px;
  border-bottom: 1px solid #eef1f6;
  background: #fafcff;
}

.dict-data-dialog :deep(.el-dialog__body) {
  padding: 12px 16px 14px;
}

.dict-data-dialog :deep(.el-button) {
  height: 30px;
  font-size: 13px;
  padding: 0 12px;
  font-weight: 400;
}

.dict-data-table :deep(.el-table__header th) {
  font-size: 13px;
  color: #4b5565;
  background: #f8faff;
}

.dict-data-table :deep(.el-table__row td) {
  font-size: 13px;
}

.dict-data-pager {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid #f0f2f5;
}
</style>
