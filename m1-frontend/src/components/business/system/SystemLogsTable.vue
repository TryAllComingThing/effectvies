<template>
  <div>
    <el-form inline :model="logQueryForm" class="query-row">
      <el-form-item label="操作人"><el-input v-model="logQueryForm.operator" clearable /></el-form-item>
      <el-form-item label="模块"><el-input v-model="logQueryForm.module" clearable /></el-form-item>
      <el-form-item label="科室"><el-input v-model="logQueryForm.deptName" clearable /></el-form-item>
      <el-form-item label="类型">
        <el-select :model-value="logType" clearable style="width: 140px" @update:model-value="handleTypeChange">
          <el-option label="全部" value="all" />
          <el-option label="登录日志" value="login" />
          <el-option label="操作日志" value="operation" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="emit('search')">查询</el-button>
        <el-button @click="emit('reset')">重置</el-button>
        <el-button type="danger" plain @click="emit('delete')">删除</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="logs" size="small" v-loading="logsLoading" @selection-change="handleSelect">
      <el-table-column type="selection" width="45" />
      <el-table-column type="index" width="56" label="#" />
      <el-table-column prop="logType" label="类型" width="90" />
      <el-table-column prop="module" label="模块" min-width="120" />
      <el-table-column prop="operator" label="操作人" min-width="100" />
      <el-table-column prop="deptName" label="科室" min-width="100" />
      <el-table-column prop="ip" label="IP" min-width="120" />
      <el-table-column prop="content" label="描述" min-width="180" />
      <el-table-column prop="createdAt" label="时间" min-width="160" />
    </el-table>
    <div class="pager">
      <el-pagination
        v-model:current-page="logQuery.pageNum"
        v-model:page-size="logQuery.pageSize"
        :total="logTotal"
        layout="total, sizes, prev, pager, next"
        :page-sizes="[10, 20, 50]"
        @current-change="emit('search')"
        @size-change="emit('search')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LogItem } from '@/api/modules/system/log';

type LogQuery = {
  pageNum: number;
  pageSize: number;
};

type LogQueryForm = {
  operator: string;
  module: string;
  deptName: string;
};

const props = defineProps<{
  logQuery: LogQuery;
  logQueryForm: LogQueryForm;
  logType: 'all' | 'login' | 'operation';
  logsLoading: boolean;
  logs: LogItem[];
  logTotal: number;
}>();

const emit = defineEmits<{
  search: [];
  reset: [];
  delete: [];
  'selection-change': [items: LogItem[]];
  'update:log-type': [value: 'all' | 'login' | 'operation'];
}>();

const handleSelect = (items: LogItem[]) => {
  emit('selection-change', items);
};

const handleTypeChange = (value: string | number | boolean | undefined) => {
  emit('update:log-type', (value ?? 'all') as 'all' | 'login' | 'operation');
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
