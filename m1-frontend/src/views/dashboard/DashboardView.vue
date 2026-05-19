<template>
  <PageContainer title="工作台">
    <el-row :gutter="16" class="metric-row">
      <el-col v-for="item in cards" :key="item.title" :xs="24" :sm="12" :lg="6">
        <el-card class="metric-card" shadow="never">
          <div class="metric-title">{{ item.title }}</div>
          <div class="metric-value">{{ item.value }}</div>
        </el-card>
      </el-col>
    </el-row>

    <section class="board-section">
      <div class="board-head">
        <h3>绩效数据分析看板</h3>
      </div>

      <div class="board-grid">
        <el-card class="board-card" shadow="never">
          <div class="card-title">绩效趋势分析</div>
          <div ref="trendChartRef" class="chart-box"></div>
        </el-card>

        <el-card class="board-card" shadow="never">
          <div class="card-title">科室绩效分布</div>
          <div ref="deptChartRef" class="chart-box"></div>
        </el-card>

        <el-card class="board-card wide-card" shadow="never">
          <div class="card-title">分数区间结构</div>
          <div ref="scoreChartRef" class="chart-box wide-chart"></div>
        </el-card>
      </div>
    </section>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import * as echarts from 'echarts';
import PageContainer from '@/components/common/PageContainer.vue';
import { getPerformanceList } from '@/api/review';
import type { PerformanceItem } from '@/types';

const rows = ref<PerformanceItem[]>([]);
const trendChartRef = ref<HTMLDivElement | null>(null);
const deptChartRef = ref<HTMLDivElement | null>(null);
const scoreChartRef = ref<HTMLDivElement | null>(null);

let trendChart: echarts.ECharts | null = null;
let deptChart: echarts.ECharts | null = null;
let scoreChart: echarts.ECharts | null = null;

const cards = computed(() => {
  const total = rows.value.length;
  const avgScore = total ? (rows.value.reduce((sum, item) => sum + item.score, 0) / total).toFixed(1) : '0.0';
  const highCount = rows.value.filter((item) => item.score >= 85).length;
  const stableCount = rows.value.filter((item) => item.score >= 75 && item.score < 85).length;

  return [
    { title: '绩效记录总数', value: String(total) },
    { title: '综合平均分', value: avgScore },
    { title: '高分科室数', value: String(highCount) },
    { title: '稳定达标数', value: String(stableCount) },
  ];
});

const trendData = computed(() => {
  const labels = ['第1周', '第2周', '第3周', '第4周'];
  const buckets = labels.map(() => [] as number[]);

  rows.value.forEach((item, index) => {
    buckets[index % 4].push(item.score);
  });

  return {
    labels,
    values: buckets.map((bucket) =>
      bucket.length ? Number((bucket.reduce((sum, value) => sum + value, 0) / bucket.length).toFixed(1)) : 0
    ),
  };
});

const deptData = computed(() => {
  const map = new Map<string, number[]>();

  rows.value.forEach((item) => {
    const list = map.get(item.deptName) || [];
    list.push(item.score);
    map.set(item.deptName, list);
  });

  return Array.from(map.entries()).map(([name, scores]) => ({
    name,
    value: Number((scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1)),
  }));
});

const scoreRangeData = computed(() => {
  const ranges = [
    { label: '90分及以上', count: 0 },
    { label: '80-89分', count: 0 },
    { label: '70-79分', count: 0 },
    { label: '70分以下', count: 0 },
  ];

  rows.value.forEach((item) => {
    if (item.score >= 90) ranges[0].count += 1;
    else if (item.score >= 80) ranges[1].count += 1;
    else if (item.score >= 70) ranges[2].count += 1;
    else ranges[3].count += 1;
  });

  return ranges;
});

const renderCharts = () => {
  if (trendChartRef.value) {
    trendChart ??= echarts.init(trendChartRef.value);
    trendChart.setOption({
      tooltip: { trigger: 'axis' },
      grid: { left: 44, right: 18, top: 28, bottom: 28 },
      xAxis: {
        type: 'category',
        data: trendData.value.labels,
        axisLine: { lineStyle: { color: '#bfd0ea' } },
        axisLabel: { color: '#627187' },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        splitLine: { lineStyle: { color: '#edf2fa' } },
        axisLabel: { color: '#627187' },
      },
      series: [
        {
          type: 'line',
          smooth: true,
          data: trendData.value.values,
          symbol: 'circle',
          symbolSize: 8,
          lineStyle: { color: '#3c72ff', width: 3 },
          itemStyle: { color: '#3c72ff' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(60,114,255,0.28)' },
              { offset: 1, color: 'rgba(60,114,255,0.04)' },
            ]),
          },
        },
      ],
    });
  }

  if (deptChartRef.value) {
    deptChart ??= echarts.init(deptChartRef.value);
    deptChart.setOption({
      tooltip: { trigger: 'item' },
      series: [
        {
          type: 'pie',
          radius: ['44%', '72%'],
          center: ['50%', '52%'],
          label: { color: '#51627a' },
          data: deptData.value,
        },
      ],
    });
  }

  if (scoreChartRef.value) {
    scoreChart ??= echarts.init(scoreChartRef.value);
    scoreChart.setOption({
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      grid: { left: 44, right: 18, top: 28, bottom: 28 },
      xAxis: {
        type: 'category',
        data: scoreRangeData.value.map((item) => item.label),
        axisLine: { lineStyle: { color: '#bfd0ea' } },
        axisLabel: { color: '#627187' },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        splitLine: { lineStyle: { color: '#edf2fa' } },
        axisLabel: { color: '#627187' },
      },
      series: [
        {
          type: 'bar',
          barWidth: 38,
          data: scoreRangeData.value.map((item) => item.count),
          itemStyle: {
            borderRadius: [6, 6, 0, 0],
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#7aa2ff' },
              { offset: 1, color: '#3f72ff' },
            ]),
          },
        },
      ],
    });
  }
};

const handleResize = () => {
  trendChart?.resize();
  deptChart?.resize();
  scoreChart?.resize();
};

const loadData = async () => {
  const res = await getPerformanceList({ pageNum: 1, pageSize: 500 });
  rows.value = res.data.list;
  await nextTick();
  renderCharts();
};

onMounted(() => {
  loadData();
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  trendChart?.dispose();
  deptChart?.dispose();
  scoreChart?.dispose();
});
</script>

<style scoped lang="scss">
.metric-row {
  margin-bottom: 18px;
}

.metric-card {
  min-height: 168px;
  border-radius: 6px;
}

.metric-title {
  color: #607086;
  font-size: 13px;
}

.metric-value {
  margin-top: 10px;
  font-size: 32px;
  font-weight: 700;
  color: #24344d;
  line-height: 1;
}

.board-section {
  margin-top: 10px;
}

.board-head {
  margin-bottom: 14px;
}

.board-head h3 {
  margin: 0;
  color: #24344d;
  font-size: 18px;
}

.board-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.board-card {
  min-height: 328px;
  border-radius: 6px;
}

.wide-card {
  grid-column: span 2;
}

.card-title {
  margin-bottom: 10px;
  color: #31445f;
  font-size: 14px;
  font-weight: 600;
}

.chart-box {
  height: 250px;
}

.wide-chart {
  height: 284px;
}

@media (max-width: 1100px) {
  .board-grid {
    grid-template-columns: 1fr;
  }

  .wide-card {
    grid-column: span 1;
  }
}
</style>
