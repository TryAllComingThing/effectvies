<template>
  <PageContainer title="解析日志">
    <template #actions>
      <el-button @click="goBack">返回列表</el-button>
    </template>
    <el-row :gutter="12" class="summary-row">
      <el-col :span="8"><el-card><div class="k">解析成功条数</div><div class="v">{{ summary.successCount }}</div></el-card></el-col>
      <el-col :span="8"><el-card><div class="k">解析文件</div><div class="v">{{ summary.fileName }}</div></el-card></el-col>
      <el-col :span="8"><el-card><div class="k">批号</div><div class="v">{{ summary.batchNo }}</div></el-card></el-col>
    </el-row>

    <el-table :data="rows" size="small">
      <el-table-column type="index" width="56" label="#" />
      <el-table-column prop="topic" label="主题" min-width="160" />
      <el-table-column prop="content" label="内容" min-width="220" />
      <el-table-column prop="routeName" label="路线" min-width="100" />
      <el-table-column prop="deptName" label="科室" min-width="100" />
      <el-table-column prop="score" label="分数" width="80" />
      <el-table-column prop="parsedAt" label="解析时间" min-width="160" />
    </el-table>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PageContainer from '@/components/common/PageContainer.vue';

const route = useRoute();
const router = useRouter();
const batchNo = String(route.query.batchNo || '-');
const fileName = String(route.query.fileName || '-');
const goBack = () => router.push('/perf-files');

const summary = computed(() => ({
  successCount: 12,
  fileName,
  batchNo,
}));

const rows = Array.from({ length: 12 }, (_, i) => ({
  topic: `解析主题-${i + 1}`,
  content: `解析内容示例-${i + 1}`,
  routeName: ['一号线', '二号线', '三号线'][i % 3],
  deptName: ['科室一', '科室二', '科室三'][i % 3],
  score: 70 + (i % 25),
  parsedAt: '2026-05-17 20:00:00',
}));
</script>

<style scoped>
.summary-row { margin-bottom: 12px; }
.k { color: #666; font-size: 13px; }
.v { margin-top: 6px; font-size: 20px; font-weight: 600; }
</style>
