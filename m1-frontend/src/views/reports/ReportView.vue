<template>
  <PageContainer :title="pageTitle">
    <el-form inline :model="query" class="query-row">
      <el-form-item label="统计周期">
        <el-select v-model="query.reportType" class="w-120" clearable>
          <el-option
            v-for="item in EXPORT_REPORT_TYPE_OPTIONS"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="科室">
        <el-select v-model="query.deptName" class="w-140" clearable>
          <el-option v-for="item in DEPT_OPTIONS" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item label="线路">
        <el-select v-model="query.routeName" class="w-140" clearable>
          <el-option v-for="item in routeOptions" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item label="分值区间">
        <el-select v-model="query.scoreLevel" class="w-170">
          <el-option
            v-for="item in REPORT_SCORE_LEVEL_OPTIONS"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="关键词">
        <el-input v-model="query.keyword" class="w-180" clearable placeholder="主题 / 提报人 / 内容" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="loadPerformanceData">查询</el-button>
        <el-button @click="resetQuery">重置</el-button>
        <el-button type="success" plain @click="downloadTable">下载</el-button>
      </el-form-item>
    </el-form>

    <section class="report-paper" v-loading="loading">
      <div class="report-meta">
        <span>{{ REPORT_SOURCE_TEXT }}</span>
        <span>数据条数：{{ filteredRows.length }}</span>
      </div>

      <table class="report-table">
        <thead>
          <tr>
            <th v-for="header in REPORT_TABLE_HEADERS" :key="header">{{ header }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in reportRows" :key="row.key">
            <td>{{ row.index }}</td>
            <td>{{ row.label }}</td>
            <td>{{ row.routeName }}</td>
            <td>{{ row.count }}</td>
            <td>{{ row.proposerCount }}</td>
            <td>{{ row.totalScore }}</td>
            <td>{{ row.avgScore }}</td>
            <td>{{ row.maxScore }}</td>
            <td>{{ row.minScore }}</td>
            <td>{{ row.excellentCount }}</td>
          </tr>
          <tr v-if="!reportRows.length">
            <td colspan="10" class="empty-cell">暂无符合条件的统计数据</td>
          </tr>
        </tbody>
        <tfoot v-if="reportRows.length">
          <tr class="subtotal-row">
            <td colspan="3">小计</td>
            <td>{{ summary.totalCount }}</td>
            <td>{{ summary.totalProposerCount }}</td>
            <td>{{ summary.totalScore }}</td>
            <td>{{ summary.avgScore }}</td>
            <td>{{ summary.maxScore }}</td>
            <td>{{ summary.minScore }}</td>
            <td>{{ summary.excellentCount }}</td>
          </tr>
        </tfoot>
      </table>
    </section>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { ElMessage } from 'element-plus';
import PageContainer from '@/components/common/PageContainer.vue';
import { getPerformanceList } from '@/api/review';
import { DEPT_OPTIONS } from '@/utils/dept-options';
import {
  EXPORT_REPORT_TYPE_OPTIONS,
  REPORT_DOWNLOAD_FILE_PREFIX,
  REPORT_SCORE_LEVEL_OPTIONS,
  REPORT_SOURCE_TEXT,
  REPORT_TABLE_HEADERS,
} from '@/utils/constant';
import type { ExportJobItem, PerformanceItem } from '@/types';

type ScoreLevel = '' | 'excellent' | 'good' | 'pass' | 'low';

type ReportRow = {
  key: string;
  index: number;
  label: string;
  routeName: string;
  count: number;
  proposerCount: number;
  totalScore: number;
  avgScore: string;
  maxScore: number;
  minScore: number;
  excellentCount: number;
};

const route = useRoute();
const loading = ref(false);
const sourceRows = ref<PerformanceItem[]>([]);
const query = reactive({
  reportType: 'current' as ExportJobItem['reportType'],
  deptName: '',
  routeName: '',
  scoreLevel: '' as ScoreLevel,
  keyword: '',
});

const pageTitle = computed(() => String(route.meta.title || '绩效报表'));

const routeOptions = computed(() =>
  Array.from(new Set(sourceRows.value.map((item) => item.routeName))).filter(Boolean)
);

const filteredRows = computed(() => {
  const keyword = query.keyword.trim();

  return sourceRows.value.filter((item) => {
    if (query.deptName && item.deptName !== query.deptName) return false;
    if (query.routeName && item.routeName !== query.routeName) return false;
    if (keyword && !`${item.title}${item.proposer}${item.content}`.includes(keyword)) return false;

    if (query.scoreLevel === 'excellent') return item.score >= 90;
    if (query.scoreLevel === 'good') return item.score >= 80 && item.score < 90;
    if (query.scoreLevel === 'pass') return item.score >= 60 && item.score < 80;
    if (query.scoreLevel === 'low') return item.score < 60;

    return true;
  });
});

const reportRows = computed<ReportRow[]>(() => {
  const grouped = new Map<string, PerformanceItem[]>();

  filteredRows.value.forEach((item) => {
    const key = `${item.deptName}_${item.routeName}`;
    const list = grouped.get(key) || [];
    list.push(item);
    grouped.set(key, list);
  });

  return Array.from(grouped.entries()).map(([key, list], index) => {
    const scores = list.map((item) => item.score);
    const totalScore = scores.reduce((sum, value) => sum + value, 0);
    const proposerCount = new Set(list.map((item) => item.proposer)).size;

    return {
      key,
      index: index + 1,
      label: list[0]?.deptName || '-',
      routeName: list[0]?.routeName || '-',
      count: list.length,
      proposerCount,
      totalScore,
      avgScore: list.length ? (totalScore / list.length).toFixed(2) : '0.00',
      maxScore: scores.length ? Math.max(...scores) : 0,
      minScore: scores.length ? Math.min(...scores) : 0,
      excellentCount: list.filter((item) => item.score >= 90).length,
    };
  });
});

const summary = computed(() => {
  const allScores = filteredRows.value.map((item) => item.score);
  const totalScore = allScores.reduce((sum, value) => sum + value, 0);

  return {
    totalCount: filteredRows.value.length,
    totalProposerCount: new Set(filteredRows.value.map((item) => item.proposer)).size,
    totalScore,
    avgScore: filteredRows.value.length ? (totalScore / filteredRows.value.length).toFixed(2) : '0.00',
    maxScore: allScores.length ? Math.max(...allScores) : 0,
    minScore: allScores.length ? Math.min(...allScores) : 0,
    excellentCount: filteredRows.value.filter((item) => item.score >= 90).length,
  };
});

const loadPerformanceData = async () => {
  loading.value = true;
  try {
    const res = await getPerformanceList({ pageNum: 1, pageSize: 500 });
    sourceRows.value = res.data.list;
  } finally {
    loading.value = false;
  }
};

const resetQuery = () => {
  Object.assign(query, {
    reportType: 'current',
    deptName: '',
    routeName: '',
    scoreLevel: '',
    keyword: '',
  });
};

const downloadTable = () => {
  if (!reportRows.value.length) {
    ElMessage.warning('暂无可下载的报表数据');
    return;
  }

  const lines = [
    REPORT_TABLE_HEADERS.join(','),
    ...reportRows.value.map((row) =>
      [
        row.index,
        row.label,
        row.routeName,
        row.count,
        row.proposerCount,
        row.totalScore,
        row.avgScore,
        row.maxScore,
        row.minScore,
        row.excellentCount,
      ].join(',')
    ),
    [
      '小计',
      '',
      '',
      summary.value.totalCount,
      summary.value.totalProposerCount,
      summary.value.totalScore,
      summary.value.avgScore,
      summary.value.maxScore,
      summary.value.minScore,
      summary.value.excellentCount,
    ].join(','),
  ];

  const blob = new Blob([`\uFEFF${lines.join('\n')}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const fileName = `${REPORT_DOWNLOAD_FILE_PREFIX}_${Date.now()}.csv`;
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  ElMessage.success(`已开始下载：${fileName}`);
};

onMounted(loadPerformanceData);
</script>

<style scoped lang="scss">
.query-row {
  margin-bottom: 12px;
}

.query-row :deep(.el-input),
.query-row :deep(.el-select) {
  width: 100%;
}

.w-120 {
  width: 120px;
}

.w-140 {
  width: 140px;
}

.w-170 {
  width: 170px;
}

.w-180 {
  width: 180px;
}

.report-paper {
  border: 1px solid #d7dfef;
  border-radius: 6px;
  background: #fff;
  padding: 14px 16px 16px;
}

.report-meta {
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  color: #6f7d92;
  font-size: 13px;
}

.report-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.report-table th,
.report-table td {
  border: 1px solid #cfd8ea;
  padding: 8px 6px;
  text-align: center;
  font-size: 13px;
  color: #31445f;
  word-break: break-word;
}

.report-table thead th {
  background: #eef4fc;
  color: #23344d;
  font-weight: 600;
}

.subtotal-row td {
  background: #f5f8fd;
  font-weight: 600;
  color: #23344d;
}

.empty-cell {
  padding: 24px 0;
  color: #8a95a6;
}

@media (max-width: 1080px) {
  .report-meta {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
