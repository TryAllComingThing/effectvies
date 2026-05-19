<template>
  <PageContainer title="绩效报告">
    <div class="report-tabs-page">
      <el-tabs v-model="activeTab" class="report-tabs">
        <el-tab-pane label="周报" name="weekly">
          <div class="filter-bar">
            <div class="filter-row">
              <el-select v-model="weeklyForm.year" class="w-140">
                <el-option v-for="item in yearOptions" :key="item" :label="`${item}年`" :value="item" />
              </el-select>
              <el-select v-model="weeklyForm.month" class="w-120">
                <el-option v-for="item in monthOptions" :key="item" :label="`${item}月`" :value="item" />
              </el-select>
              <el-select v-model="weeklyForm.week" class="w-140">
                <el-option v-for="item in weekOptions" :key="item" :label="`第${item}周`" :value="item" />
              </el-select>
            </div>
            <el-button type="primary" @click="downloadCurrentReport">下载</el-button>
          </div>
        </el-tab-pane>

        <el-tab-pane label="月报" name="monthly">
          <div class="filter-bar">
            <div class="filter-row">
              <el-select v-model="monthlyForm.year" class="w-140">
                <el-option v-for="item in yearOptions" :key="item" :label="`${item}年`" :value="item" />
              </el-select>
              <el-select v-model="monthlyForm.month" class="w-120">
                <el-option v-for="item in monthOptions" :key="item" :label="`${item}月`" :value="item" />
              </el-select>
            </div>
            <el-button type="primary" @click="downloadCurrentReport">下载</el-button>
          </div>
        </el-tab-pane>

        <el-tab-pane label="季度报告" name="quarterly">
          <div class="filter-bar">
            <div class="filter-row">
              <el-select v-model="quarterlyForm.year" class="w-140">
                <el-option v-for="item in yearOptions" :key="item" :label="`${item}年`" :value="item" />
              </el-select>
              <el-select v-model="quarterlyForm.quarter" class="w-140">
                <el-option v-for="item in quarterOptions" :key="item" :label="`第${item}季度`" :value="item" />
              </el-select>
            </div>
            <el-button type="primary" @click="downloadCurrentReport">下载</el-button>
          </div>
        </el-tab-pane>

        <el-tab-pane label="年报" name="yearly">
          <div class="filter-bar">
            <div class="filter-row">
              <el-select v-model="yearlyForm.year" class="w-140">
                <el-option v-for="item in yearOptions" :key="item" :label="`${item}年`" :value="item" />
              </el-select>
            </div>
            <el-button type="primary" @click="downloadCurrentReport">下载</el-button>
          </div>
        </el-tab-pane>
      </el-tabs>

      <section class="report-shell">
        <article class="word-paper">
          <header class="paper-header">
            <div class="paper-topline">
              <span>绩效管理平台</span>
              <span>{{ currentReport.periodLabel }}</span>
            </div>
            <h2>{{ currentReport.title }}</h2>
          </header>

          <section class="paper-section">
            <h3>一、执行摘要</h3>
            <p>{{ currentReport.summary }}</p>
            <div class="metric-grid">
              <div v-for="item in currentReport.metrics" :key="item.label" class="metric-card">
                <span class="metric-label">{{ item.label }}</span>
                <strong>{{ item.value }}</strong>
                <span class="metric-sub">{{ item.sub }}</span>
              </div>
            </div>
          </section>

          <section class="paper-section">
            <h3>二、趋势分析</h3>
            <p>以下趋势图反映当前周期内绩效综合得分变化情况，用于辅助识别波峰、波谷和持续改善区间。</p>
            <div class="chart-panel">
              <svg class="trend-chart" viewBox="0 0 560 188" aria-label="trend-chart">
                <defs>
                  <linearGradient id="trendArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#5f81d8" stop-opacity="0.12" />
                    <stop offset="100%" stop-color="#5f81d8" stop-opacity="0.015" />
                  </linearGradient>
                </defs>
                <g stroke="#edf2f8" stroke-width="1">
                  <line v-for="line in chartGridLines" :key="line" x1="52" :y1="line" x2="520" :y2="line" />
                </g>
                <g stroke="#aab7cc" stroke-width="0.9">
                  <line x1="52" y1="26" x2="52" y2="152" />
                  <line x1="52" y1="152" x2="520" y2="152" />
                </g>
                <g fill="#93a0b2" font-size="9">
                  <text v-for="tick in chartYAxisTicks" :key="tick.value" x="14" :y="tick.y + 3">{{ tick.value }}</text>
                  <text v-for="label in chartXAxisLabels" :key="label.text" :x="label.x" y="172">{{ label.text }}</text>
                </g>
                <polygon :points="chartAreaPoints" fill="url(#trendArea)" />
                <polyline :points="chartLinePoints" fill="none" stroke="#5b79c8" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" />
                <g fill="#fff" stroke="#5b79c8" stroke-width="1.3">
                  <circle v-for="point in chartPoints" :key="`${point.x}-${point.y}`" :cx="point.x" :cy="point.y" r="2.6" />
                </g>
              </svg>
            </div>
          </section>

          <section class="paper-section">
            <h3>三、科室绩效对比</h3>
            <p>下表汇总本期主要科室绩效情况，并结合得分、完成率和环比给出简要分析。</p>
            <div class="dept-bars">
              <div v-for="item in currentReport.deptRows" :key="item.name" class="dept-bar-row">
                <span class="dept-name">{{ item.name }}</span>
                <div class="dept-bar-track">
                  <div class="dept-bar-fill" :style="{ width: `${item.score}%` }"></div>
                </div>
                <span class="dept-score">{{ item.score }}</span>
              </div>
            </div>
            <table class="report-table">
              <thead>
                <tr>
                  <th>科室</th>
                  <th>得分</th>
                  <th>完成率</th>
                  <th>环比</th>
                  <th>分析结论</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in currentReport.deptRows" :key="`${item.name}-table`">
                  <td>{{ item.name }}</td>
                  <td>{{ item.score }}</td>
                  <td>{{ item.completionRate }}%</td>
                  <td>{{ item.momChange }}</td>
                  <td>{{ item.comment }}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section class="paper-section">
            <h3>四、结论建议</h3>
            <div class="paragraph-list">
              <p v-for="item in currentReport.recommendations" :key="item">{{ item }}</p>
            </div>
          </section>

          <footer class="paper-footer">第 1 页</footer>
        </article>
      </section>
    </div>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import PageContainer from '@/components/common/PageContainer.vue';

type ReportTab = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

type ReportMetric = {
  label: string;
  value: string;
  sub: string;
};

type DeptRow = {
  name: string;
  score: number;
  completionRate: number;
  momChange: string;
  comment: string;
};

type ReportData = {
  title: string;
  periodLabel: string;
  summary: string;
  trendLabels: string[];
  trendValues: number[];
  metrics: ReportMetric[];
  deptRows: DeptRow[];
  recommendations: string[];
};

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth() + 1;
const currentQuarter = Math.floor((currentMonth - 1) / 3) + 1;

const yearOptions = Array.from({ length: 6 }, (_, index) => currentYear - index);
const monthOptions = Array.from({ length: 12 }, (_, index) => index + 1);
const weekOptions = Array.from({ length: 6 }, (_, index) => index + 1);
const quarterOptions = [1, 2, 3, 4];
const deptNames = ['科室一', '科室二', '科室三'];

const activeTab = ref<ReportTab>('weekly');
const weeklyForm = ref({ year: currentYear, month: currentMonth, week: 1 });
const monthlyForm = ref({ year: currentYear, month: currentMonth });
const quarterlyForm = ref({ year: currentYear, quarter: currentQuarter });
const yearlyForm = ref({ year: currentYear });

const currentDateText = computed(() => new Date().toLocaleDateString('zh-CN'));

const activeSeed = computed(() => {
  if (activeTab.value === 'weekly') return weeklyForm.value.year * 100 + weeklyForm.value.month * 10 + weeklyForm.value.week;
  if (activeTab.value === 'monthly') return monthlyForm.value.year * 100 + monthlyForm.value.month;
  if (activeTab.value === 'quarterly') return quarterlyForm.value.year * 10 + quarterlyForm.value.quarter;
  return yearlyForm.value.year;
});

const createTrendValues = (seed: number, length: number) =>
  Array.from({ length }, (_, index) => {
    const value = 72 + ((seed + index * 7) % 18);
    return value;
  });

const createDeptRows = (seed: number): DeptRow[] =>
  deptNames.map((name, index) => {
    const score = 74 + ((seed + index * 6) % 20);
    const completionRate = 82 + ((seed + index * 5) % 15);
    const change = ((seed + index * 3) % 7) - 2;
    return {
      name,
      score,
      completionRate,
      momChange: `${change >= 0 ? '+' : ''}${change}%`,
      comment:
        score >= 90
          ? '整体表现优秀，建议保持当前推进节奏。'
          : score >= 82
            ? '运行平稳，需继续关注重点指标波动。'
            : '仍有提升空间，建议强化过程跟踪与复盘。',
    };
  });

const buildReportData = (): ReportData => {
  const seed = activeSeed.value;
  const deptRows = createDeptRows(seed);
  const avgScore = (deptRows.reduce((sum, item) => sum + item.score, 0) / deptRows.length).toFixed(1);
  const bestDept = [...deptRows].sort((a, b) => b.score - a.score)[0];
  const lowestDept = [...deptRows].sort((a, b) => a.score - b.score)[0];

  if (activeTab.value === 'weekly') {
    const { year, month, week } = weeklyForm.value;
    return {
      title: `${year}年${month}月第${week}周绩效分析报告`,
      periodLabel: `${year}年${month}月第${week}周`,
      summary: '本周绩效运行整体平稳，综合得分维持在较高区间，重点科室推进效率较好，但部分指标在周中出现小幅波动，需要结合责任落实和过程追踪持续优化。',
      trendLabels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
      trendValues: createTrendValues(seed, 7),
      metrics: [
        { label: '平均得分', value: avgScore, sub: '本周综合均值' },
        { label: '最高科室', value: bestDept.name, sub: `${bestDept.score}分` },
        { label: '重点关注', value: lowestDept.name, sub: `${lowestDept.score}分` },
        { label: '达标科室', value: String(deptRows.filter((item) => item.score >= 85).length), sub: '85分及以上' },
      ],
      deptRows,
      recommendations: [
        '建议对本周得分偏低科室安排专项复盘，聚焦过程环节的执行偏差。',
        '对高分科室的工作节奏和经验做法进行沉淀，形成下周期复用模板。',
        '将周中波动较大的指标纳入日监控范围，提前识别风险点。',
      ],
    };
  }

  if (activeTab.value === 'monthly') {
    const { year, month } = monthlyForm.value;
    return {
      title: `${year}年${month}月绩效分析报告`,
      periodLabel: `${year}年${month}月`,
      summary: '本月绩效整体保持上升趋势，月中完成率提升明显，末段进入稳定运行阶段。报告重点关注各科室之间的推进差异和关键指标完成情况。',
      trendLabels: ['第1周', '第2周', '第3周', '第4周'],
      trendValues: createTrendValues(seed, 4),
      metrics: [
        { label: '平均得分', value: avgScore, sub: '本月综合均值' },
        { label: '最佳科室', value: bestDept.name, sub: `${bestDept.score}分` },
        { label: '重点关注', value: lowestDept.name, sub: `${lowestDept.score}分` },
        { label: '达标率', value: `${Math.round((deptRows.filter((item) => item.score >= 85).length / deptRows.length) * 100)}%`, sub: '科室达标占比' },
      ],
      deptRows,
      recommendations: [
        '月报周期应强化关键节点前后的完成率跟踪，防止末段集中补齐导致波动。',
        '建议将高分科室经验纳入月度复盘模板，形成跨科室共享机制。',
        '针对低分项建立专项提升清单，并在下月首周完成动作拆解。',
      ],
    };
  }

  if (activeTab.value === 'quarterly') {
    const { year, quarter } = quarterlyForm.value;
    return {
      title: `${year}年第${quarter}季度绩效分析报告`,
      periodLabel: `${year}年第${quarter}季度`,
      summary: '本季度绩效整体向好，重点指标达成情况较为均衡。季度周期内科室间差异缩小，但仍需持续关注个别薄弱环节的稳定性与复用能力。',
      trendLabels: ['首月', '次月', '末月'],
      trendValues: createTrendValues(seed, 3),
      metrics: [
        { label: '平均得分', value: avgScore, sub: '本季度综合均值' },
        { label: '领先科室', value: bestDept.name, sub: `${bestDept.score}分` },
        { label: '薄弱科室', value: lowestDept.name, sub: `${lowestDept.score}分` },
        { label: '季度达标', value: `${deptRows.filter((item) => item.score >= 85).length}/${deptRows.length}`, sub: '科室数量' },
      ],
      deptRows,
      recommendations: [
        '季度末应围绕达标率、排名变化和过程复盘形成闭环跟踪。',
        '建议把季度高频问题归纳为专项主题，在下季度初集中治理。',
        '对连续两个周期波动较大的指标建立预警阈值与升级机制。',
      ],
    };
  }

  const { year } = yearlyForm.value;
  return {
    title: `${year}年绩效分析报告`,
    periodLabel: `${year}年`,
    summary: '年度绩效整体达到预期，全年呈现前稳中升、后段巩固的基本态势。报告从年度趋势、科室对比和改进方向三个维度进行综合分析。',
    trendLabels: ['一季', '二季', '三季', '四季'],
    trendValues: createTrendValues(seed, 4),
    metrics: [
      { label: '年度均分', value: avgScore, sub: '全年综合均值' },
      { label: '年度最佳', value: bestDept.name, sub: `${bestDept.score}分` },
      { label: '年度关注', value: lowestDept.name, sub: `${lowestDept.score}分` },
      { label: '年度达标率', value: `${Math.round((deptRows.filter((item) => item.score >= 85).length / deptRows.length) * 100)}%`, sub: '全年科室达标占比' },
    ],
    deptRows,
    recommendations: [
      '建议把年度高分经验沉淀为标准做法，纳入下一年度模板化管理。',
      '针对年度波动较大的指标进行专项拆解，明确责任人和时间节点。',
      '年度收官后应形成专题复盘，为来年目标设定提供量化依据。',
    ],
  };
};

const currentReport = computed(buildReportData);

const CHART_LEFT = 52;
const CHART_RIGHT = 520;
const CHART_BOTTOM = 152;
const CHART_HEIGHT = 102;
const CHART_WIDTH = CHART_RIGHT - CHART_LEFT;

const chartPoints = computed(() => {
  const values = currentReport.value.trendValues;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = Math.max(max - min, 1);
  const stepX = values.length > 1 ? CHART_WIDTH / (values.length - 1) : 0;

  return values.map((value, index) => ({
    x: CHART_LEFT + index * stepX,
    y: CHART_BOTTOM - ((value - min) / range) * CHART_HEIGHT,
  }));
});

const chartLinePoints = computed(() => chartPoints.value.map((point) => `${point.x},${point.y}`).join(' '));
const chartAreaPoints = computed(() => {
  if (!chartPoints.value.length) return '';
  const line = chartPoints.value.map((point) => `${point.x},${point.y}`).join(' ');
  const first = chartPoints.value[0];
  const last = chartPoints.value[chartPoints.value.length - 1];
  return `${line} ${last.x},${CHART_BOTTOM} ${first.x},${CHART_BOTTOM}`;
});

const chartGridLines = [48, 74, 100, 126, CHART_BOTTOM];
const chartYAxisTicks = computed(() => {
  const values = currentReport.value.trendValues;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const step = Math.max(Math.round((max - min) / 4), 1);
  return [
    { value: min + step * 4, y: 48 },
    { value: min + step * 3, y: 74 },
    { value: min + step * 2, y: 100 },
    { value: min + step, y: 126 },
    { value: min, y: CHART_BOTTOM },
  ];
});

const chartXAxisLabels = computed(() => {
  const labels = currentReport.value.trendLabels;
  const stepX = labels.length > 1 ? CHART_WIDTH / (labels.length - 1) : 0;
  return labels.map((text, index) => ({
    text,
    x: CHART_LEFT + index * stepX - 10,
  }));
});

const escapeHtml = (value: string) =>
  value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');

const buildReportHtml = () => {
  const report = currentReport.value;
  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(report.title)}</title>
        <style>
          body { font-family: SimSun, Arial, sans-serif; color: #222; line-height: 1.8; padding: 32px 44px; }
          h1 { text-align: center; font-size: 22px; margin: 18px 0 8px; letter-spacing: 1px; }
          h2 { font-size: 15px; margin: 26px 0 10px; color: #2d405a; }
          .meta { text-align: center; color: #707b8c; font-size: 12px; margin-bottom: 18px; }
          .summary { text-indent: 2em; font-size: 13px; color: #39485d; }
          .metric-wrap { width: 76%; margin: 18px 0 0; border-collapse: collapse; }
          .metric-wrap td { border: 1px solid #dfe5ef; padding: 10px; width: 25%; vertical-align: top; background: #fbfcfe; }
          .metric-label { font-size: 12px; color: #748094; display: block; }
          .metric-value { font-size: 18px; font-weight: bold; display: block; margin: 4px 0; }
          .table { width: 82%; border-collapse: collapse; margin: 12px 0 0; }
          .table th, .table td { border: 1px solid #d5ddea; padding: 8px; font-size: 12px; color: #3c4b60; }
          .table th { background: #f5f8fc; color: #2e415d; }
          .para { text-indent: 2em; font-size: 13px; color: #39485d; }
        </style>
      </head>
      <body>
        <div class="meta">绩效管理平台 | 报告周期：${escapeHtml(report.periodLabel)} | 生成日期：${escapeHtml(currentDateText.value)}</div>
        <h1>${escapeHtml(report.title)}</h1>
        <p class="summary">${escapeHtml(report.summary)}</p>
        <table class="metric-wrap">
          <tr>
            ${report.metrics
              .map(
                (item) => `
                  <td>
                    <span class="metric-label">${escapeHtml(item.label)}</span>
                    <span class="metric-value">${escapeHtml(item.value)}</span>
                    <span class="metric-label">${escapeHtml(item.sub)}</span>
                  </td>
                `
              )
              .join('')}
          </tr>
        </table>
        <h2>一、科室绩效对比</h2>
        <table class="table">
          <thead>
            <tr>
              <th>科室</th>
              <th>得分</th>
              <th>完成率</th>
              <th>环比</th>
              <th>分析结论</th>
            </tr>
          </thead>
          <tbody>
            ${report.deptRows
              .map(
                (item) => `
                  <tr>
                    <td>${escapeHtml(item.name)}</td>
                    <td>${item.score}</td>
                    <td>${item.completionRate}%</td>
                    <td>${escapeHtml(item.momChange)}</td>
                    <td>${escapeHtml(item.comment)}</td>
                  </tr>
                `
              )
              .join('')}
          </tbody>
        </table>
        <h2>二、结论建议</h2>
        ${report.recommendations.map((item) => `<p class="para">${escapeHtml(item)}</p>`).join('')}
      </body>
    </html>
  `;
};

const downloadCurrentReport = () => {
  const html = buildReportHtml();
  const blob = new Blob([`\uFEFF${html}`], { type: 'application/msword;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${currentReport.value.title}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
</script>

<style scoped lang="scss">
.report-tabs-page {
  border: 1px solid #d7dfef;
  border-radius: 4px;
  background: #fff;
  padding: 12px 16px 18px;
}

.report-tabs :deep(.el-tabs__header) {
  margin-bottom: 12px;
}

.report-tabs :deep(.el-tabs__item) {
  font-size: 14px;
}

.filter-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.w-120 {
  width: 120px;
}

.w-140 {
  width: 140px;
}

.report-shell {
  margin-top: 12px;
}

.word-paper {
  --report-content-width: 640px;
  --report-visual-width: 560px;
  background: #fff;
  border: 1px solid #dfe5ee;
  box-shadow: 0 10px 28px rgba(30, 45, 72, 0.06);
  padding: 30px 38px 34px;
}

.paper-header {
  max-width: var(--report-content-width);
  padding-bottom: 16px;
  border-bottom: 1px solid #dde5f0;
}

.paper-topline {
  display: flex;
  justify-content: space-between;
  color: #8a95a6;
  font-size: 11px;
}

.paper-header h2 {
  margin: 14px 0 6px;
  text-align: left;
  font-size: 26px;
  line-height: 1.5;
  letter-spacing: 0.5px;
  color: #22324c;
}

.paper-section {
  margin-top: 22px;
  max-width: var(--report-content-width);
}

.paper-section h3 {
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 600;
  color: #2d405a;
}

.paper-section p {
  max-width: var(--report-content-width);
  margin: 0 0 8px;
  color: #526278;
  font-size: 12.5px;
  line-height: 1.8;
  text-indent: 2em;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 12px;
  width: 100%;
  max-width: var(--report-content-width);
  margin: 14px 0 0;
}

.metric-card {
  border: 1px solid #dde5f2;
  border-radius: 4px;
  background: #f9fbff;
  min-height: 78px;
  padding: 10px 12px;
}

.metric-label {
  display: block;
  color: #7a8799;
  font-size: 11px;
}

.metric-card strong {
  display: block;
  margin: 4px 0 3px;
  color: #24344d;
  font-size: 18px;
}

.metric-sub {
  color: #607086;
  font-size: 11px;
}

.chart-panel {
  border: 1px solid #e3e9f3;
  border-radius: 4px;
  background: linear-gradient(180deg, #fcfdff 0%, #f8fbff 100%);
  width: 100%;
  max-width: var(--report-visual-width);
  margin: 4px 0 0;
  padding: 7px 12px 4px;
}

.trend-chart {
  width: 100%;
  height: auto;
  display: block;
  margin: 0;
}

.dept-bars {
  display: flex;
  flex-direction: column;
  gap: 7px;
  width: 100%;
  max-width: var(--report-visual-width);
  margin: 2px 0 12px;
}

.dept-bar-row {
  display: grid;
  grid-template-columns: 72px 160px 36px;
  gap: 10px;
  align-items: center;
}

.dept-name,
.dept-score {
  font-size: 12px;
  color: #536377;
}

.dept-bar-track {
  width: 160px;
  height: 7px;
  border-radius: 3px;
  background: #eef2f8;
  overflow: hidden;
}

.dept-bar-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #6d87c9 0%, #8da6db 100%);
}

.report-table {
  width: 100%;
  max-width: var(--report-content-width);
  border-collapse: collapse;
  margin: 0;
  table-layout: fixed;
}

.report-table th,
.report-table td {
  border: 1px solid #d7deea;
  padding: 7px 8px;
  font-size: 11.5px;
  color: #48586d;
  text-align: left;
  vertical-align: top;
  word-break: break-word;
}

.report-table th:nth-child(1),
.report-table td:nth-child(1) {
  width: 18%;
}

.report-table th:nth-child(2),
.report-table td:nth-child(2) {
  width: 12%;
}

.report-table th:nth-child(3),
.report-table td:nth-child(3) {
  width: 16%;
}

.report-table th:nth-child(4),
.report-table td:nth-child(4) {
  width: 14%;
}

.report-table th:nth-child(5),
.report-table td:nth-child(5) {
  width: 40%;
}

.report-table th {
  background: #f6f8fc;
  color: #31445e;
  font-weight: 600;
}

.paragraph-list p {
  max-width: var(--report-content-width);
  margin-bottom: 6px;
}

.paper-footer {
  max-width: var(--report-content-width);
  margin-top: 22px;
  padding-top: 10px;
  border-top: 1px solid #e5eaf2;
  display: flex;
  justify-content: flex-end;
  color: #97a1af;
  font-size: 11px;
}

@media (max-width: 1100px) {
  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .report-table {
    width: 100%;
  }
}

@media (max-width: 900px) {
  .word-paper {
    --report-content-width: 100%;
    --report-visual-width: 100%;
    padding: 24px 18px 24px;
  }

  .metric-grid {
    grid-template-columns: 1fr;
    max-width: none;
  }

  .dept-bar-row {
    grid-template-columns: 72px 1fr 40px;
    justify-content: stretch;
  }

  .dept-bars,
  .chart-panel,
  .report-table {
    max-width: none;
    width: 100%;
  }

  .dept-bar-track {
    width: 100%;
  }
}
</style>
