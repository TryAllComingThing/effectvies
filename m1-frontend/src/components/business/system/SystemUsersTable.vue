<template>
  <div>
    <el-form inline :model="userQuery" class="query-row">
      <el-form-item label="账号"><el-input v-model="userQuery.account" clearable /></el-form-item>
      <el-form-item label="姓名"><el-input v-model="userQuery.name" clearable /></el-form-item>
      <el-form-item label="科室"><el-input v-model="userQuery.deptName" clearable /></el-form-item>
      <el-form-item label="角色">
        <el-select v-model="userQuery.roleName" clearable style="width: 120px">
          <el-option label="系统管理员" value="系统管理员" />
          <el-option label="普通用户" value="普通用户" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="userQuery.userStatus" clearable style="width: 120px">
          <el-option label="启用" value="enabled" />
          <el-option label="停用" value="disabled" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="emit('search')">查询</el-button>
        <el-button @click="emit('reset')">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="users" size="small" v-loading="usersLoading" @selection-change="handleSelect">
      <el-table-column type="selection" width="45" />
      <el-table-column type="index" width="56" label="#" />
      <el-table-column prop="account" label="账号" min-width="120" />
      <el-table-column prop="name" label="姓名" min-width="100" />
      <el-table-column prop="deptName" label="科室" min-width="100" />
      <el-table-column prop="roleName" label="角色" min-width="100" />
      <el-table-column prop="phone" label="电话" min-width="120" />
      <el-table-column label="状态" width="100">
        <template #default="scope"><StatusTag :status="scope.row.userStatus" /></template>
      </el-table-column>
      <el-table-column label="操作" min-width="280" fixed="right" class-name="table-action-cell">
        <template #default="scope">
          <el-space>
            <el-button text type="primary" size="small" @click="emit('view', scope.row)">
              <ActionIcon name="Eye" />查看
            </el-button>
            <el-button text type="primary" size="small" @click="emit('edit', scope.row)">
              <ActionIcon name="Pencil" />编辑
            </el-button>
            <el-button text type="warning" size="small" @click="emit('reset-password', scope.row)">
              <ActionIcon name="KeyRound" />重置密码
            </el-button>
            <el-button text type="primary" size="small" @click="emit('toggle', scope.row.id)">
              <ActionIcon name="Power" />{{ scope.row.userStatus === 'enabled' ? '停用' : '启用' }}
            </el-button>
          </el-space>
        </template>
      </el-table-column>
    </el-table>
    <div class="pager">
      <el-pagination
        v-model:current-page="userQuery.pageNum"
        v-model:page-size="userQuery.pageSize"
        :total="userTotal"
        layout="total, sizes, prev, pager, next"
        :page-sizes="[10, 20, 50]"
        @current-change="emit('search')"
        @size-change="emit('search')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import ActionIcon from '@/components/common/ActionIcon.vue';
import StatusTag from '@/components/common/StatusTag.vue';
import type { UserItem } from '@/api/modules/system/user';

type UserQuery = {
  pageNum: number;
  pageSize: number;
  account: string;
  name: string;
  deptName: string;
  roleName: string;
  userStatus: string;
};

const props = defineProps<{
  userQuery: UserQuery;
  usersLoading: boolean;
  users: UserItem[];
  userTotal: number;
}>();

const emit = defineEmits<{
  search: [];
  reset: [];
  'selection-change': [items: UserItem[]];
  view: [row: Record<string, unknown>];
  edit: [row: Record<string, unknown>];
  'reset-password': [row: Record<string, unknown>];
  toggle: [id: string];
}>();

const handleSelect = (items: UserItem[]) => {
  emit('selection-change', items);
};
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
</style>
