<template>
  <PageContainer title="评分模型">
    <template #actions>
      <el-space>
        <el-button @click="resetWeights">重置</el-button>
        <el-button type="primary" v-permission="['admin']" @click="saveWeights">保存权重</el-button>
      </el-space>
    </template>

    <el-card class="tips-card">
      <div class="tips-row">
        <span>权重总计：</span>
        <el-tag :type="totalWeight === 100 ? 'success' : 'danger'">{{ totalWeight }}%</el-tag>
        <span class="tips-note">要求总权重为 100%</span>
      </div>
    </el-card>

    <el-table :data="weights" size="small">
      <el-table-column type="index" width="56" label="#" />
      <el-table-column prop="name" label="评分维度" min-width="180" />
      <el-table-column label="权重(%)" width="220">
        <template #default="scope">
          <el-input-number
            v-model="scope.row.weight"
            :min="0"
            :max="100"
            :step="1"
            controls-position="right"
            style="width: 160px"
          />
        </template>
      </el-table-column>
      <el-table-column prop="remark" label="说明" min-width="320" />
    </el-table>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ElMessage } from 'element-plus';
import PageContainer from '@/components/common/PageContainer.vue';

type ScoreWeightItem = {
  id: string;
  name: string;
  weight: number;
  remark: string;
};

const initialWeights: ScoreWeightItem[] = [
  { id: 'm1', name: '关键词命中', weight: 35, remark: '关键词完全命中得分占比' },
  { id: 'm2', name: '语义匹配', weight: 30, remark: '语义理解匹配得分占比' },
  { id: 'm3', name: '文本相似度', weight: 25, remark: '相似度模型得分占比' },
  { id: 'm4', name: '时效性', weight: 10, remark: '上报时效等附加得分占比' },
];

const weights = ref<ScoreWeightItem[]>(initialWeights.map((item) => ({ ...item })));
const totalWeight = computed(() => weights.value.reduce((sum, item) => sum + Number(item.weight || 0), 0));

const resetWeights = () => {
  weights.value = initialWeights.map((item) => ({ ...item }));
  ElMessage.success('已重置为默认权重');
};

const saveWeights = () => {
  if (totalWeight.value !== 100) {
    ElMessage.warning('权重总计必须为100%');
    return;
  }
  ElMessage.success('评分模型权重已保存（模拟）');
};
</script>

<style scoped lang="scss">
.tips-card {
  margin-bottom: 10px;
}

.tips-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tips-note {
  color: #76839a;
}
</style>
