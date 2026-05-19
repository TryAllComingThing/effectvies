<template>
  <PageContainer title="工作台">
    <el-row :gutter="12">
      <el-col :span="8" v-for="item in cards" :key="item.title">
        <el-card>
          <div class="metric-title">{{ item.title }}</div>
          <div class="metric-value">{{ item.value }}</div>
        </el-card>
      </el-col>
    </el-row>
  </PageContainer>
</template>

<script setup lang="ts">
import PageContainer from '@/components/common/PageContainer.vue';

const cards = [
  { title: '文件任务数', value: '28' },
  { title: '待审核数据', value: '96' },
  { title: '今日导出数', value: '12' },
];
</script>

<style scoped>
.metric-title { color: var(--color-text-secondary); }
.metric-value { margin-top: 0.6rem; font-size: 1.35rem; font-weight: 700; }
</style>
