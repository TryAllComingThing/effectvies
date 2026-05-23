<template>
  <PageContainer title="报告管理">
    <template #actions>
      <el-button type="primary" @click="openCreateDialog">新建</el-button>
    </template>

    <el-form inline :model="query" class="query-row">
      <el-form-item label="报告类型">
        <el-select v-model="query.reportType" class="w-140" clearable>
          <el-option
            v-for="item in EXPORT_REPORT_TYPE_OPTIONS"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="query.status" class="w-120" clearable>
          <el-option label="待开始" value="pending" />
          <el-option label="运行中" value="running" />
          <el-option label="已完成" value="done" />
          <el-option label="失败" value="fail" />
        </el-select>
      </el-form-item>
      <el-form-item label="关键词">
        <el-input v-model="query.keyword" class="w-180" clearable placeholder="报告标题 / 模板名称" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="noop">查询</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="filteredRows" size="small">
      <el-table-column type="index" width="64" label="序号" />
      <el-table-column prop="reportTitle" label="报告标题" min-width="220" />
      <el-table-column label="报告类型" width="100">
        <template #default="scope">{{ formatReportType(scope.row.reportType) }}</template>
      </el-table-column>
      <el-table-column prop="templateName" label="报告模板" min-width="180" />
      <el-table-column prop="creator" label="创建人" width="100" />
      <el-table-column prop="createdAt" label="创建时间" min-width="160" />
      <el-table-column label="状态" width="100">
        <template #default="scope"><StatusTag :status="scope.row.status" /></template>
      </el-table-column>
      <el-table-column label="进度" min-width="150">
        <template #default="scope"><el-progress :percentage="scope.row.progress" /></template>
      </el-table-column>
      <el-table-column prop="fileName" label="导出文件" min-width="200" />
      <el-table-column label="操作" min-width="260" fixed="right">
        <template #default="scope">
          <el-space>
            <el-button text type="primary" size="small" @click="openPreviewDialog(scope.row)">预览</el-button>
            <el-button text type="primary" size="small" @click="refreshStatus(scope.row)">刷新</el-button>
            <el-button text type="primary" size="small" :disabled="scope.row.status !== 'done'" @click="download(scope.row)">下载</el-button>
          </el-space>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="editVisible" title="新建" width="700px">
      <el-form :model="form" label-width="88px" class="config-form">
        <el-form-item label="报告类型">
          <el-select v-model="form.reportType" class="full-width" @change="handleReportTypeChange">
            <el-option
              v-for="item in EXPORT_REPORT_TYPE_OPTIONS"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="报告标题">
          <el-input v-model="form.reportTitle" placeholder="请输入报告标题" />
        </el-form-item>
        <el-form-item label="报告模板">
          <el-select v-model="form.templateId" class="full-width" placeholder="请选择启用中的模板" @change="handleTemplateChange">
            <el-option
              v-for="item in availableTemplates"
              :key="item.id"
              :label="`${item.templateName}${item.isDefault ? '（默认）' : ''}`"
              :value="item.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="科室范围">
          <el-select v-model="form.deptNames" multiple class="full-width" collapse-tags collapse-tags-tooltip>
            <el-option v-for="item in DEPT_OPTIONS" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="包含章节">
          <el-select v-model="form.sections" multiple class="full-width" collapse-tags collapse-tags-tooltip>
            <el-option v-for="item in sectionOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="补充说明">
          <el-input v-model="form.remark" type="textarea" :rows="4" placeholder="可填写本次报告生成说明" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button @click="openPreviewDialog()">预览</el-button>
        <el-button type="primary" @click="createReport">生成报告</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="previewVisible" title="查看预览" width="920px">
      <div class="doc-preview">
        <div class="doc-page">
          <div class="doc-header-line">
            <span>绩效管理平台</span>
            <span>{{ currentPreviewDate }}</span>
          </div>
          <div class="doc-cover">
            <div class="doc-badge">{{ formatReportType(previewState.reportType) }}</div>
            <h2>{{ previewState.reportTitle || '未命名绩效报告' }}</h2>
            <div class="doc-meta">
              <span>模板：{{ previewState.templateName || '未选择模板' }}</span>
              <span>科室：{{ previewState.deptNames.length || DEPT_OPTIONS.length }} 个</span>
              <span>记录：{{ previewSummary.count }} 条</span>
            </div>
          </div>

          <div class="doc-section">
            <div class="doc-section-title">一、报告概览</div>
            <div class="doc-paragraph">
              系统根据当前选定模板和绩效管理入库数据，自动汇总形成以下分析内容，用于正式 Word 报告生成。
            </div>
            <div class="preview-metrics">
              <div class="metric-item">
                <span class="metric-label">纳入条数</span>
                <strong>{{ previewSummary.count }}</strong>
              </div>
              <div class="metric-item">
                <span class="metric-label">平均分</span>
                <strong>{{ previewSummary.avgScore }}</strong>
              </div>
              <div class="metric-item">
                <span class="metric-label">最高分</span>
                <strong>{{ previewSummary.maxScore }}</strong>
              </div>
            </div>
          </div>

          <div class="doc-section">
            <div class="doc-section-title">二、章节结构</div>
            <div class="doc-paragraph">
              本次报告将按以下章节顺序输出，并自动匹配模板中的段落样式、表格样式和页眉页脚配置。
            </div>
            <div class="outline-list">
              <div v-for="(item, index) in previewState.sections" :key="item" class="outline-item">
                <span class="outline-index">{{ index + 1 }}</span>
                <div class="outline-content">
                  <div class="outline-name">{{ item }}</div>
                  <div class="outline-desc">{{ getSectionDescription(item) }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="doc-section">
            <div class="doc-section-title">三、数据摘录</div>
            <div class="doc-paragraph">
              以下为报告正文中可引用的数据片段，正式导出时将按模板版式生成完整 Word 表格。
            </div>
            <div class="data-table">
              <div class="data-row data-head">
                <span>主题</span>
                <span>科室</span>
                <span>线路</span>
                <span>分数</span>
              </div>
              <div v-for="item in previewRows.slice(0, 5)" :key="item.id" class="data-row">
                <span>{{ item.title }}</span>
                <span>{{ item.deptName }}</span>
                <span>{{ item.routeName }}</span>
                <span>{{ item.score }}</span>
              </div>
            </div>
          </div>

          <div class="doc-section">
            <div class="doc-section-title">四、补充说明</div>
            <div class="preview-text">
              {{ previewState.remark || '当前未填写补充说明，正式生成时将按模板默认说明输出。' }}
            </div>
          </div>

          <div class="doc-footer-line">
            <span>第 1 页</span>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="previewVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import PageContainer from '@/components/common/PageContainer.vue';
import StatusTag from '@/components/common/StatusTag.vue';
import { createDocExportJob, downloadExportJob, getExportJobStatus } from '@/api/report';
import { getPerformanceList } from '@/api/review';
import { getReportTemplateList } from '@/api/report-template';
import { DEPT_OPTIONS } from '@/utils/dept-options';
import { EXPORT_REPORT_TYPE_OPTIONS } from '@/utils/constant';
import type { ExportJobItem, PerformanceItem, ReportTemplateItem } from '@/types';

type ManagedReportItem = {
  id: string;
  reportTitle: string;
  reportType: ExportJobItem['reportType'];
  templateId: string;
  templateName: string;
  deptNames: string[];
  sections: string[];
  remark: string;
  creator: string;
  createdAt: string;
  status: ExportJobItem['status'];
  progress: number;
  jobId: string;
  fileName: string;
};

type PreviewState = {
  reportTitle: string;
  reportType: ExportJobItem['reportType'];
  templateName: string;
  deptNames: string[];
  sections: string[];
  remark: string;
};

const sectionOptions = ['封面信息', '绩效概览', '指标明细', '趋势分析', '问题分析', '改进建议', '排名分析', '附录说明'];
const sectionDescriptionMap: Record<string, string> = {
  封面信息: '展示报告标题、模板版本、生成时间及基础信息。',
  绩效概览: '汇总整体绩效指标、覆盖范围和关键结论。',
  指标明细: '按科室、线路和主题展开核心指标明细。',
  趋势分析: '展示阶段趋势变化及关键波动说明。',
  问题分析: '归纳异常项、短板项及原因分析。',
  改进建议: '输出后续优化动作和执行建议。',
  排名分析: '对排名结果进行结构化对比。',
  附录说明: '补充数据口径、样本说明和附注信息。',
};

const query = reactive({
  reportType: '',
  status: '',
  keyword: '',
});

const form = reactive({
  reportType: 'current' as ExportJobItem['reportType'],
  reportTitle: '绩效综合分析报告',
  templateId: '',
  deptNames: [...DEPT_OPTIONS] as string[],
  sections: ['封面信息', '绩效概览', '指标明细', '问题分析', '改进建议'] as string[],
  remark: '',
});

const previewState = reactive<PreviewState>({
  reportTitle: '',
  reportType: 'current',
  templateName: '',
  deptNames: [],
  sections: [],
  remark: '',
});

const editVisible = ref(false);
const previewVisible = ref(false);
const performanceRows = ref<PerformanceItem[]>([]);
const templateRows = ref<ReportTemplateItem[]>([]);
const reportRows = ref<ManagedReportItem[]>([]);

const availableTemplates = computed(() => templateRows.value.filter((item) => item.status === 'enabled'));
const currentTemplate = computed(() => templateRows.value.find((item) => item.id === form.templateId) || null);

const filteredRows = computed(() =>
  reportRows.value.filter((item) => {
    if (query.reportType && item.reportType !== query.reportType) return false;
    if (query.status && item.status !== query.status) return false;
    if (query.keyword.trim() && !`${item.reportTitle}${item.templateName}`.includes(query.keyword.trim())) return false;
    return true;
  })
);

const previewRows = computed(() => {
  if (!previewState.deptNames.length) return performanceRows.value;
  return performanceRows.value.filter((item) => previewState.deptNames.includes(item.deptName));
});

const previewSummary = computed(() => {
  const scores = previewRows.value.map((item) => item.score);
  const totalScore = scores.reduce((sum, value) => sum + value, 0);
  return {
    count: previewRows.value.length,
    avgScore: previewRows.value.length ? (totalScore / previewRows.value.length).toFixed(2) : '0.00',
    maxScore: scores.length ? Math.max(...scores) : 0,
  };
});

const currentPreviewDate = computed(() => new Date().toLocaleDateString('zh-CN'));

const noop = () => undefined;

const formatReportType = (value: ExportJobItem['reportType']) =>
  EXPORT_REPORT_TYPE_OPTIONS.find((item) => item.value === value)?.label || value;

const getSectionDescription = (section: string) => sectionDescriptionMap[section] || '按模板配置输出对应章节内容。';

const syncDefaultTemplate = () => {
  const currentList = availableTemplates.value;
  if (!currentList.length) {
    form.templateId = '';
    return;
  }

  if (currentList.some((item) => item.id === form.templateId)) return;

  const defaultTemplate =
    currentList.find((item) => item.reportType === form.reportType && item.isDefault) ||
    currentList.find((item) => item.reportType === form.reportType) ||
    currentList.find((item) => item.isDefault) ||
    currentList[0];

  form.templateId = defaultTemplate.id;
  if (!form.sections.length) {
    form.sections = [...defaultTemplate.sectionConfig];
  }
};

const syncSectionsByTemplate = () => {
  if (currentTemplate.value?.sectionConfig?.length) {
    form.sections = [...currentTemplate.value.sectionConfig];
  }
};

const loadTemplates = async () => {
  const res = await getReportTemplateList({ pageNum: 1, pageSize: 100, status: 'enabled' });
  templateRows.value = res.data.list;
  syncDefaultTemplate();
};

const loadPerformanceData = async () => {
  const res = await getPerformanceList({ pageNum: 1, pageSize: 500 });
  performanceRows.value = res.data.list;
};

const initReportRows = () => {
  if (reportRows.value.length || !availableTemplates.value.length) return;
  const defaultTemplate = availableTemplates.value.find((item) => item.isDefault) || availableTemplates.value[0];
  reportRows.value = [
    {
      id: 'report_demo_1',
      reportTitle: '2026年5月绩效分析报告',
      reportType: defaultTemplate.reportType,
      templateId: defaultTemplate.id,
      templateName: defaultTemplate.templateName,
      deptNames: [...DEPT_OPTIONS],
      sections: [...defaultTemplate.sectionConfig],
      remark: '本报告用于月度绩效汇总。',
      creator: '系统管理员',
      createdAt: '2026-05-19 10:30:00',
      status: 'done',
      progress: 100,
      jobId: 'demo_job_1',
      fileName: '绩效报告_20260519.docx',
    },
  ];
};

const resetQuery = () => {
  Object.assign(query, {
    reportType: '',
    status: '',
    keyword: '',
  });
};

const resetForm = () => {
  Object.assign(form, {
    reportType: 'current',
    reportTitle: '绩效综合分析报告',
    templateId: '',
    deptNames: [...DEPT_OPTIONS],
    sections: ['封面信息', '绩效概览', '指标明细', '问题分析', '改进建议'],
    remark: '',
  });
  syncDefaultTemplate();
  syncSectionsByTemplate();
};

const handleReportTypeChange = () => {
  form.templateId = '';
  form.sections = [];
  syncDefaultTemplate();
  syncSectionsByTemplate();
};

const handleTemplateChange = () => {
  syncSectionsByTemplate();
};

const buildPreviewStateFromForm = () => {
  Object.assign(previewState, {
    reportTitle: form.reportTitle.trim(),
    reportType: form.reportType,
    templateName: currentTemplate.value?.templateName || '',
    deptNames: [...form.deptNames],
    sections: [...form.sections],
    remark: form.remark.trim(),
  });
};

const buildPreviewStateFromRow = (row: ManagedReportItem) => {
  Object.assign(previewState, {
    reportTitle: row.reportTitle,
    reportType: row.reportType,
    templateName: row.templateName,
    deptNames: [...row.deptNames],
    sections: [...row.sections],
    remark: row.remark,
  });
};

const openCreateDialog = () => {
  resetForm();
  editVisible.value = true;
};

const openPreviewDialog = (row?: ManagedReportItem) => {
  if (row) {
    buildPreviewStateFromRow(row);
  } else {
    buildPreviewStateFromForm();
  }
  previewVisible.value = true;
};

const createReport = async () => {
  if (!form.reportTitle.trim()) {
    ElMessage.warning('请输入报告标题');
    return;
  }
  if (!form.templateId) {
    ElMessage.warning('请选择报告模板');
    return;
  }

  const createRes = await createDocExportJob({
    reportType: form.reportType,
    templateId: form.templateId,
    reportTitle: form.reportTitle.trim(),
    deptNames: form.deptNames,
    sections: form.sections,
    remark: form.remark.trim(),
  });

  if (createRes.code !== 0) {
    ElMessage.warning(createRes.message);
    return;
  }

  let status: ExportJobItem | null = null;
  const statusRes = await getExportJobStatus(createRes.data.jobId);
  if (statusRes.code === 0) {
    status = statusRes.data;
  }

  reportRows.value.unshift({
    id: `report_${Date.now()}`,
    reportTitle: form.reportTitle.trim(),
    reportType: form.reportType,
    templateId: form.templateId,
    templateName: currentTemplate.value?.templateName || '',
    deptNames: [...form.deptNames],
    sections: [...form.sections],
    remark: form.remark.trim(),
    creator: '系统管理员',
    createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
    status: status?.status || 'running',
    progress: status?.progress || 10,
    jobId: createRes.data.jobId,
    fileName: status?.fileName || `${form.reportTitle.trim()}.docx`,
  });

  ElMessage.success('绩效报告生成任务已创建');
  editVisible.value = false;
};

const refreshStatus = async (row: ManagedReportItem) => {
  if (!row.jobId || row.jobId.startsWith('demo_')) {
    ElMessage.info('当前示例记录无需刷新');
    return;
  }

  const res = await getExportJobStatus(row.jobId);
  if (res.code === 0) {
    row.status = res.data.status;
    row.progress = res.data.progress;
    row.fileName = res.data.fileName;
    ElMessage.success('任务进度已更新');
  }
};

const download = async (row: ManagedReportItem) => {
  if (!row.jobId || row.jobId.startsWith('demo_')) {
    ElMessage.success(`模拟下载：${row.fileName}`);
    return;
  }

  const res = await downloadExportJob(row.jobId);
  if (res.code === 0) {
    ElMessage.success(`下载地址：${res.data.url}`);
    return;
  }
  ElMessage.warning(res.message);
};

onMounted(async () => {
  await Promise.all([loadTemplates(), loadPerformanceData()]);
  initReportRows();
});
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

.w-180 {
  width: 180px;
}

.full-width {
  width: 100%;
}

.doc-preview {
  background: #edf1f7;
  border: 1px solid #d8e1ef;
  border-radius: 4px;
  padding: 20px;
}

.doc-page {
  background: #fff;
  width: 794px;
  max-width: 100%;
  min-height: 1123px;
  margin: 0 auto;
  padding: 42px 54px 56px;
  box-shadow: 0 12px 36px rgba(36, 52, 77, 0.12);
}

.doc-header-line,
.doc-footer-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #7a8798;
  font-size: 12px;
}

.doc-header-line {
  padding-bottom: 12px;
  border-bottom: 1px solid #e3e9f2;
}

.doc-cover {
  padding: 34px 0 28px;
  border-bottom: 2px solid #dbe5f5;
  text-align: center;
}

.doc-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 3px;
  background: #edf3ff;
  color: #315487;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 12px;
}

.doc-cover h2 {
  margin: 0;
  font-size: 28px;
  line-height: 1.5;
  color: #22324c;
}

.doc-meta {
  margin-top: 12px;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px;
  color: #627187;
  font-size: 13px;
}

.doc-section {
  margin-top: 28px;
}

.doc-section-title {
  margin-bottom: 12px;
  font-size: 16px;
  font-weight: 700;
  color: #253754;
}

.doc-paragraph {
  margin-bottom: 12px;
  color: #4c5c73;
  font-size: 13px;
  line-height: 1.9;
  text-indent: 2em;
}

.preview-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.metric-item {
  border: 1px solid #dfe7f4;
  background: #fff;
  border-radius: 4px;
  padding: 10px 12px;
}

.metric-label {
  display: block;
  font-size: 12px;
  color: #708198;
  margin-bottom: 4px;
}

.metric-item strong {
  font-size: 20px;
  color: #22324c;
}

.outline-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.outline-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  border: 1px solid #e5ebf6;
  border-radius: 4px;
  background: #fff;
  padding: 10px 12px;
  color: #42556f;
  font-size: 13px;
}

.outline-index {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #eaf1ff;
  color: #315487;
  display: inline-grid;
  place-items: center;
  font-size: 12px;
  font-weight: 600;
}

.outline-content {
  flex: 1;
}

.outline-name {
  color: #324760;
  font-size: 13px;
  font-weight: 600;
}

.outline-desc {
  margin-top: 4px;
  color: #6b7a90;
  font-size: 12px;
  line-height: 1.6;
}

.data-table {
  border: 1px solid #dfe7f4;
  border-radius: 4px;
  overflow: hidden;
}

.data-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 0.8fr;
}

.data-row span {
  padding: 10px 12px;
  border-right: 1px solid #e7edf8;
  border-bottom: 1px solid #e7edf8;
  color: #4a5c76;
  font-size: 12px;
}

.data-row span:last-child {
  border-right: 0;
}

.data-row:last-child span {
  border-bottom: 0;
}

.data-head span {
  background: #f3f7fd;
  color: #2e435f;
  font-weight: 600;
}

.preview-text {
  border: 1px solid #e5ebf6;
  border-radius: 4px;
  background: #fff;
  padding: 12px;
  color: #52627d;
  font-size: 13px;
  line-height: 1.9;
}

.doc-footer-line {
  margin-top: 38px;
  padding-top: 14px;
  border-top: 1px solid #e3e9f2;
  justify-content: center;
}

@media (max-width: 900px) {
  .preview-metrics {
    grid-template-columns: 1fr;
  }

  .data-row {
    grid-template-columns: 1.5fr 1fr 1fr 0.8fr;
  }
}
</style>
