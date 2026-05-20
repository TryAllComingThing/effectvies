<template>
  <div>
    <el-form inline :model="roleQuery" class="query-row">
      <el-form-item label="角色编码"><el-input v-model="roleQuery.roleCode" clearable /></el-form-item>
      <el-form-item label="角色名称"><el-input v-model="roleQuery.roleName" clearable /></el-form-item>
      <el-form-item label="科室"><el-input v-model="roleQuery.deptName" clearable /></el-form-item>
      <el-form-item>
        <el-button type="primary" @click="emit('search')">查询</el-button>
        <el-button @click="emit('reset')">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="roles" size="small" v-loading="rolesLoading" @selection-change="handleSelect">
      <el-table-column type="selection" width="45" />
      <el-table-column type="index" width="56" label="#" />
      <el-table-column prop="roleCode" label="角色编码" min-width="120" />
      <el-table-column prop="roleName" label="角色名称" min-width="120" />
      <el-table-column prop="deptName" label="科室" min-width="120" />
      <el-table-column prop="userCount" label="关联人数" width="100" />
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="scope">
          <el-space>
            <el-button text type="primary" size="small" @click="emit('view', scope.row)">
              <ActionIcon name="Eye" />查看
            </el-button>
            <el-button text type="primary" size="small" @click="emit('edit', scope.row)">
              <ActionIcon name="Pencil" />编辑
            </el-button>
            <el-button text type="danger" size="small" @click="emit('delete', scope.row.id)">
              <ActionIcon name="Trash2" />删除
            </el-button>
          </el-space>
        </template>
      </el-table-column>
    </el-table>
    <div class="pager">
      <el-pagination
        v-model:current-page="roleQuery.pageNum"
        v-model:page-size="roleQuery.pageSize"
        :total="roleTotal"
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
import type { RoleItem } from '@/api/modules/system/role';

type RoleQuery = {
  pageNum: number;
  pageSize: number;
  roleCode: string;
  roleName: string;
  deptName: string;
};

const props = defineProps<{
  roleQuery: RoleQuery;
  rolesLoading: boolean;
  roles: RoleItem[];
  roleTotal: number;
}>();

const emit = defineEmits<{
  search: [];
  reset: [];
  'selection-change': [items: RoleItem[]];
  view: [row: Record<string, unknown>];
  edit: [row: Record<string, unknown>];
  delete: [id: string];
}>();

const handleSelect = (items: RoleItem[]) => {
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
