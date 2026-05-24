<template>
  <div>
    <el-form inline :model="dictQuery" class="query-row">
      <el-form-item label="字典类型"><el-input v-model="dictQuery.dictType" clearable /></el-form-item>
      <el-form-item label="字典名称"><el-input v-model="dictQuery.dictLabel" clearable /></el-form-item>
      <el-form-item label="状态">
        <el-select v-model="dictQuery.status" clearable style="width: 120px">
          <el-option label="启用" value="enabled" />
          <el-option label="停用" value="disabled" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="emit('search')">查询</el-button>
        <el-button @click="emit('reset')">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="dicts" size="small" v-loading="dictsLoading" @selection-change="handleSelect">
      <el-table-column type="selection" width="45" />
      <el-table-column type="index" width="56" label="#" />
      <el-table-column prop="dictType" label="字典类型" min-width="180" />
      <el-table-column prop="dictLabel" label="字典名称" min-width="220" />
      <el-table-column label="状态" width="100">
        <template #default="scope"><StatusTag :status="scope.row.status" /></template>
      </el-table-column>
      <el-table-column label="操作" min-width="300" fixed="right" class-name="table-action-cell">
        <template #default="scope">
          <el-space>
            <el-button text type="primary" size="small" @click="emit('edit', scope.row)">
              <ActionIcon name="Pencil" />编辑
            </el-button>
            <el-button text type="primary" size="small" @click="emit('view-data', scope.row)">
              <ActionIcon name="List" />查看
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
        v-model:current-page="dictQuery.pageNum"
        v-model:page-size="dictQuery.pageSize"
        :total="dictTotal"
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
import type { DictItem } from '@/api/modules/system/dict';

type DictQuery = {
  pageNum: number;
  pageSize: number;
  dictType: string;
  dictLabel: string;
  status: string;
};

const props = defineProps<{
  dictQuery: DictQuery;
  dictsLoading: boolean;
  dicts: DictItem[];
  dictTotal: number;
}>();

const emit = defineEmits<{
  search: [];
  reset: [];
  'selection-change': [items: DictItem[]];
  edit: [row: Record<string, unknown>];
  'view-data': [row: Record<string, unknown>];
  toggle: [id: string];
}>();

const handleSelect = (items: DictItem[]) => {
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
