<template>
  <div>
    <el-form inline :model="deptQuery" class="query-row">
      <el-form-item label="科室名称"><el-input v-model="deptQuery.name" clearable /></el-form-item>
      <el-form-item label="状态">
        <el-select v-model="deptQuery.status" clearable style="width: 120px">
          <el-option label="启用" value="enabled" />
          <el-option label="停用" value="disabled" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="emit('search')">搜索</el-button>
        <el-button @click="emit('reset')">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table
      :data="depts"
      size="small"
      v-loading="deptsLoading"
      row-key="id"
      :tree-props="{ children: 'children' }"
      default-expand-all
      @selection-change="handleSelect"
    >
      <el-table-column type="selection" width="45" />
      <el-table-column prop="name" label="科室名称" min-width="180" />
      <el-table-column prop="code" label="科室编码" min-width="140" />
      <el-table-column prop="sort" label="排序" width="80" />
      <el-table-column label="状态" width="100">
        <template #default="scope"><StatusTag :status="scope.row.status" /></template>
      </el-table-column>
      <el-table-column label="操作" min-width="360" fixed="right" class-name="table-action-cell">
        <template #default="scope">
          <el-space>
            <el-button text type="primary" size="small" @click="emit('create-child', scope.row)">
              <ActionIcon name="Plus" />新增下级
            </el-button>
            <el-button text type="primary" size="small" @click="emit('edit', scope.row)">
              <ActionIcon name="Pencil" />修改
            </el-button>
            <el-button text type="danger" size="small" @click="emit('delete', scope.row.id)">
              <ActionIcon name="Trash2" />删除
            </el-button>
            <el-button text type="primary" size="small" @click="emit('toggle', scope.row.id)">
              <ActionIcon name="Power" />{{ scope.row.status === 'enabled' ? '停用' : '启用' }}
            </el-button>
          </el-space>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import ActionIcon from '@/components/common/ActionIcon.vue';
import StatusTag from '@/components/common/StatusTag.vue';
import type { DeptItem } from '@/api/modules/system/dept';

type DeptQuery = {
  pageNum: number;
  pageSize: number;
  name: string;
  status: string;
};

defineProps<{
  deptQuery: DeptQuery;
  deptsLoading: boolean;
  depts: DeptItem[];
}>();

const emit = defineEmits<{
  search: [];
  reset: [];
  'selection-change': [items: DeptItem[]];
  'create-child': [row: Record<string, unknown>];
  edit: [row: Record<string, unknown>];
  delete: [id: string];
  toggle: [id: string];
}>();

const handleSelect = (items: DeptItem[]) => {
  emit('selection-change', items);
};
</script>

<style scoped>
.query-row { margin-bottom: 0.7rem; }
</style>
