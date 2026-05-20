<template>
  <div>
    <el-form inline :model="deptQuery" class="query-row">
      <el-form-item label="科室编码"><el-input v-model="deptQuery.code" clearable /></el-form-item>
      <el-form-item label="科室名称"><el-input v-model="deptQuery.name" clearable /></el-form-item>
      <el-form-item label="上级科室">
        <el-select v-model="deptQuery.parentName" clearable style="width: 140px">
          <el-option v-for="item in deptParentOptions" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="deptQuery.status" clearable style="width: 120px">
          <el-option label="启用" value="enabled" />
          <el-option label="停用" value="disabled" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="emit('search')">查询</el-button>
        <el-button @click="emit('reset')">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="depts" size="small" v-loading="deptsLoading" @selection-change="handleSelect">
      <el-table-column type="selection" width="45" />
      <el-table-column type="index" width="56" label="#" />
      <el-table-column prop="code" label="科室编码" min-width="120" />
      <el-table-column prop="name" label="科室名称" min-width="130" />
      <el-table-column prop="parentName" label="上级科室" min-width="120" />
      <el-table-column prop="sort" label="排序" width="80" />
      <el-table-column label="状态" width="100">
        <template #default="scope"><StatusTag :status="scope.row.status" /></template>
      </el-table-column>
      <el-table-column label="操作" min-width="280" fixed="right">
        <template #default="scope">
          <el-space>
            <el-button text type="primary" size="small" @click="emit('create-child', scope.row)">
              <ActionIcon name="Plus" />新增下级
            </el-button>
            <el-button text type="primary" size="small" @click="emit('edit', scope.row)">
              <ActionIcon name="Pencil" />编辑
            </el-button>
            <el-button text type="primary" size="small" @click="emit('toggle', scope.row.id)">
              <ActionIcon name="Power" />{{ scope.row.status === 'enabled' ? '停用' : '启用' }}
            </el-button>
          </el-space>
        </template>
      </el-table-column>
    </el-table>
    <div class="pager">
      <el-pagination
        v-model:current-page="deptQuery.pageNum"
        v-model:page-size="deptQuery.pageSize"
        :total="deptTotal"
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
import type { DeptItem } from '@/api/modules/system/dept';

type DeptQuery = {
  pageNum: number;
  pageSize: number;
  code: string;
  name: string;
  parentName: string;
  status: string;
};

const props = defineProps<{
  deptQuery: DeptQuery;
  deptParentOptions: string[];
  deptsLoading: boolean;
  depts: DeptItem[];
  deptTotal: number;
}>();

const emit = defineEmits<{
  search: [];
  reset: [];
  'selection-change': [items: DeptItem[]];
  'create-child': [row: Record<string, unknown>];
  edit: [row: Record<string, unknown>];
  toggle: [id: string];
}>();

const handleSelect = (items: DeptItem[]) => {
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
