<template>
  <PageContainer title="绩效报表与报告">
    <el-form inline :model="form" class="query-row">
      <el-form-item label="报告类型">
        <el-select v-model="form.reportType" style="width: 140px">
          <el-option label="日报" value="daily" />
          <el-option label="季度报" value="quarter" />
          <el-option label="年报" value="yearly" />
          <el-option label="当前报告" value="current" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="createTableJob">导出报表</el-button>
        <el-button type="success" @click="createDocJob">导出报告</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="rows" size="small">
      <el-table-column type="index" width="56" label="#" />
      <el-table-column prop="id" label="任务ID" min-width="170" />
      <el-table-column prop="jobType" label="类型" width="95" />
      <el-table-column prop="reportType" label="报告类型" width="100" />
      <el-table-column prop="fileName" label="文件名" min-width="220" />
      <el-table-column label="状态" width="120">
        <template #default="scope"><StatusTag :status="scope.row.status" /></template>
      </el-table-column>
      <el-table-column label="进度" min-width="170">
        <template #default="scope">
          <el-progress :percentage="scope.row.progress" />
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="scope">
          <el-space>
            <el-button text type="primary" size="small" @click="refreshStatus(scope.row.id)">刷新进度</el-button>
            <el-button text type="success" size="small" :disabled="scope.row.status !== 'done'" @click="download(scope.row.id)">下载</el-button>
          </el-space>
        </template>
      </el-table-column>
    </el-table>
  </PageContainer>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import PageContainer from '@/components/common/PageContainer.vue';
import StatusTag from '@/components/common/StatusTag.vue';
import { createDocExportJob, createTableExportJob, downloadExportJob, getExportJobList, getExportJobStatus } from '@/api/report';
import type { ExportJobItem } from '@/types';

const loading = ref(false);
const rows = ref<ExportJobItem[]>([]);
const form = reactive({ reportType: 'daily' as ExportJobItem['reportType'] });

const loadData = async () => {
  loading.value = true;
  try {
    const res = await getExportJobList({ pageNum: 1, pageSize: 20 });
    rows.value = res.data.list;
  } finally {
    loading.value = false;
  }
};

const createTableJob = async () => {
  const res = await createTableExportJob({});
  if (res.code === 0) {
    ElMessage.success('报表导出任务已创建');
    loadData();
  }
};

const createDocJob = async () => {
  const res = await createDocExportJob({ reportType: form.reportType });
  if (res.code === 0) {
    ElMessage.success('报告导出任务已创建');
    loadData();
  }
};

const refreshStatus = async (id: string) => {
  const res = await getExportJobStatus(id);
  if (res.code === 0) {
    const index = rows.value.findIndex((item) => item.id === id);
    if (index >= 0) {
      rows.value[index] = res.data;
    }
    ElMessage.success('进度已更新');
  }
};

const download = async (id: string) => {
  const res = await downloadExportJob(id);
  if (res.code === 0) {
    ElMessage.success(`模拟下载地址：${res.data.url}`);
    return;
  }
  ElMessage.warning(res.message);
};

onMounted(loadData);
</script>

<style scoped lang="scss">
.query-row {
  margin-bottom: 0.7rem;
}
</style>
