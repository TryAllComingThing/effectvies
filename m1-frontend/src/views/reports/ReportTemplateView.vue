<template>
  <PageContainer title="报告模板">
    <template #actions>
      <el-space>
        <el-button type="primary" @click="openCreateDialog('upload')">上传</el-button>
        <el-button @click="openCreateDialog('custom')">新建</el-button>
      </el-space>
    </template>

    <el-form inline :model="query" class="query-row">
      <el-form-item label="模板类型">
        <el-select v-model="query.reportType" class="w-140" clearable>
          <el-option
            v-for="item in EXPORT_REPORT_TYPE_OPTIONS"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="来源">
        <el-select v-model="query.sourceType" class="w-120" clearable>
          <el-option label="上传" value="upload" />
          <el-option label="自定义" value="custom" />
        </el-select>
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="query.status" class="w-120" clearable>
          <el-option label="启用" value="enabled" />
          <el-option label="停用" value="disabled" />
        </el-select>
      </el-form-item>
      <el-form-item label="关键词">
        <el-input v-model="query.keyword" class="w-180" clearable placeholder="模板名称 / 编码 / 文件名" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="loadData">查询</el-button>
        <el-button @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="rows" size="small">
      <el-table-column type="index" width="64" label="序号" />
      <el-table-column prop="templateName" label="模板名称" min-width="180" />
      <el-table-column prop="templateCode" label="模板编码" min-width="140" />
      <el-table-column label="适用报告" width="110">
        <template #default="scope">{{ formatReportType(scope.row.reportType) }}</template>
      </el-table-column>
      <el-table-column label="来源" width="90">
        <template #default="scope">{{ scope.row.sourceType === 'upload' ? '上传' : '自定义' }}</template>
      </el-table-column>
      <el-table-column prop="version" label="版本" width="90" />
      <el-table-column prop="fileName" label="Word文件" min-width="180" />
      <el-table-column prop="fileSize" label="大小" width="90" />
      <el-table-column prop="creator" label="维护人" width="100" />
      <el-table-column prop="updatedAt" label="更新时间" min-width="160" />
      <el-table-column label="状态" width="90">
        <template #default="scope">
          <el-tag :type="scope.row.status === 'enabled' ? 'success' : 'info'">
            {{ scope.row.status === 'enabled' ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="默认模板" width="100">
        <template #default="scope">
          <el-tag v-if="scope.row.isDefault" type="warning">默认</el-tag>
          <span v-else>-</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" min-width="320" fixed="right" class-name="table-action-cell">
        <template #default="scope">
          <el-space wrap>
            <el-button text type="primary" size="small" @click="previewTemplate(scope.row)">预览</el-button>
            <el-button text type="primary" size="small" @click="openEditDialog(scope.row)">编辑</el-button>
            <el-button text size="small" :disabled="scope.row.isDefault" @click="setDefault(scope.row)">设为默认</el-button>
            <el-button text size="small" @click="toggleStatus(scope.row)">
              {{ scope.row.status === 'enabled' ? '停用' : '启用' }}
            </el-button>
            <el-button text type="danger" size="small" @click="removeTemplate(scope.row)">删除</el-button>
          </el-space>
        </template>
      </el-table-column>
    </el-table>

    <div class="pager">
      <el-pagination
        v-model:current-page="query.pageNum"
        v-model:page-size="query.pageSize"
        :total="total"
        layout="total, sizes, prev, pager, next"
        :page-sizes="[10, 20, 50]"
        @current-change="loadData"
        @size-change="loadData"
      />
    </div>

    <el-dialog v-model="editVisible" :title="dialogTitle" width="640px">
      <el-form :model="editForm" label-width="96px">
        <el-form-item label="模板名称">
          <el-input v-model="editForm.templateName" />
        </el-form-item>
        <el-form-item label="模板编码">
          <el-input v-model="editForm.templateCode" />
        </el-form-item>
        <el-form-item label="适用报告">
          <el-select v-model="editForm.reportType" class="full-width">
            <el-option
              v-for="item in EXPORT_REPORT_TYPE_OPTIONS"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Word文件">
          <el-input v-model="editForm.fileName" :placeholder="editMode === 'upload' ? '例如：绩效月报模板.docx' : '自动生成 .docx 文件名'" />
        </el-form-item>
        <el-form-item label="版本">
          <el-input v-model="editForm.version" />
        </el-form-item>
        <el-form-item label="说明">
          <el-input v-model="editForm.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="章节配置">
          <el-select v-model="editForm.sectionConfig" multiple class="full-width" collapse-tags collapse-tags-tooltip>
            <el-option v-for="item in sectionOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="默认模板">
          <el-switch v-model="editForm.isDefault" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="submitTemplate">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="previewVisible" title="模板预览" width="700px">
      <template v-if="currentTemplate">
        <div class="preview-head">
          <div>
            <div class="preview-title">{{ currentTemplate.templateName }}</div>
            <div class="preview-meta">
              <span>{{ formatReportType(currentTemplate.reportType) }}</span>
              <span>{{ currentTemplate.version }}</span>
              <span>{{ currentTemplate.fileName }}</span>
            </div>
          </div>
          <el-tag :type="currentTemplate.status === 'enabled' ? 'success' : 'info'">
            {{ currentTemplate.status === 'enabled' ? '启用中' : '已停用' }}
          </el-tag>
        </div>
        <div class="preview-block">
          <div class="preview-label">模板说明</div>
          <div class="preview-text">{{ currentTemplate.description || '暂无说明' }}</div>
        </div>
        <div class="preview-block">
          <div class="preview-label">章节结构</div>
          <div class="section-list">
            <span v-for="item in currentTemplate.sectionConfig" :key="item" class="section-tag">{{ item }}</span>
          </div>
        </div>
      </template>
      <template #footer>
        <el-button @click="previewVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import PageContainer from '@/components/common/PageContainer.vue';
import {
  createReportTemplate,
  deleteReportTemplate,
  getReportTemplateList,
  setDefaultReportTemplate,
  updateReportTemplate,
  updateReportTemplateStatus,
} from '@/api/report-template';
import { EXPORT_REPORT_TYPE_OPTIONS } from '@/utils/constant';
import type { ExportJobItem, ReportTemplateItem } from '@/types';

const loading = ref(false);
const total = ref(0);
const rows = ref<ReportTemplateItem[]>([]);
const editVisible = ref(false);
const previewVisible = ref(false);
const currentTemplate = ref<ReportTemplateItem | null>(null);
const editMode = ref<'upload' | 'custom'>('upload');
const formMode = ref<'create' | 'edit'>('create');

const query = reactive({
  pageNum: 1,
  pageSize: 10,
  reportType: '',
  sourceType: '',
  status: '',
  keyword: '',
});

const editForm = reactive({
  id: '',
  templateName: '',
  templateCode: '',
  reportType: 'current' as ExportJobItem['reportType'],
  sourceType: 'upload' as ReportTemplateItem['sourceType'],
  version: 'V1.0',
  fileName: '',
  fileSize: '1.0MB',
  description: '',
  sectionConfig: ['封面信息', '绩效概览'] as string[],
  isDefault: false,
});

const sectionOptions = ['封面信息', '绩效概览', '指标明细', '趋势分析', '问题分析', '改进建议', '排名分析', '附录说明'];

const dialogTitle = computed(() => {
  if (formMode.value === 'edit') return '编辑模板';
  return editMode.value === 'upload' ? '上传模板' : '新建模板';
});

const formatReportType = (value: ExportJobItem['reportType']) =>
  EXPORT_REPORT_TYPE_OPTIONS.find((item) => item.value === value)?.label || value;

const loadData = async () => {
  loading.value = true;
  try {
    const res = await getReportTemplateList(query);
    rows.value = res.data.list;
    total.value = res.data.total;
  } finally {
    loading.value = false;
  }
};

const resetQuery = () => {
  Object.assign(query, {
    pageNum: 1,
    pageSize: 10,
    reportType: '',
    sourceType: '',
    status: '',
    keyword: '',
  });
  loadData();
};

const openCreateDialog = (mode: 'upload' | 'custom') => {
  formMode.value = 'create';
  editMode.value = mode;
  Object.assign(editForm, {
    id: '',
    templateName: '',
    templateCode: '',
    reportType: 'current',
    sourceType: mode,
    version: 'V1.0',
    fileName: '',
    fileSize: mode === 'upload' ? '1.8MB' : '1.0MB',
    description: '',
    sectionConfig: ['封面信息', '绩效概览'],
    isDefault: false,
  });
  editVisible.value = true;
};

const openEditDialog = (row: ReportTemplateItem) => {
  formMode.value = 'edit';
  editMode.value = row.sourceType;
  Object.assign(editForm, {
    id: row.id,
    templateName: row.templateName,
    templateCode: row.templateCode,
    reportType: row.reportType,
    sourceType: row.sourceType,
    version: row.version,
    fileName: row.fileName,
    fileSize: row.fileSize,
    description: row.description,
    sectionConfig: [...row.sectionConfig],
    isDefault: row.isDefault,
  });
  editVisible.value = true;
};

const submitTemplate = async () => {
  if (!editForm.templateName.trim()) {
    ElMessage.warning('请输入模板名称');
    return;
  }

  const fileName = editForm.fileName.trim() || `${editForm.templateName.trim()}.docx`;
  const templateCode = editForm.templateCode.trim() || `RPT-${Date.now()}`;

  const payload = {
    templateName: editForm.templateName.trim(),
    templateCode,
    reportType: editForm.reportType,
    sourceType: editForm.sourceType,
    version: editForm.version.trim() || 'V1.0',
    fileName,
    fileSize: editForm.fileSize,
    creator: '系统管理员',
    description: editForm.description.trim(),
    sectionConfig: [...editForm.sectionConfig],
    isDefault: editForm.isDefault,
    status: 'enabled' as const,
  };

  const res =
    formMode.value === 'edit' && editForm.id
      ? await updateReportTemplate(editForm.id, payload)
      : await createReportTemplate(payload);

  if (res.code === 0) {
    ElMessage.success(formMode.value === 'edit' ? '模板已更新' : '模板已保存');
    editVisible.value = false;
    loadData();
  }
};

const previewTemplate = (row: ReportTemplateItem) => {
  currentTemplate.value = row;
  previewVisible.value = true;
};

const toggleStatus = async (row: ReportTemplateItem) => {
  const nextStatus = row.status === 'enabled' ? 'disabled' : 'enabled';
  const res = await updateReportTemplateStatus(row.id, nextStatus);
  if (res.code === 0) {
    ElMessage.success(nextStatus === 'enabled' ? '模板已启用' : '模板已停用');
    loadData();
  }
};

const setDefault = async (row: ReportTemplateItem) => {
  const res = await setDefaultReportTemplate(row.id);
  if (res.code === 0) {
    ElMessage.success('已设为默认模板');
    loadData();
  }
};

const removeTemplate = async (row: ReportTemplateItem) => {
  await ElMessageBox.confirm(`确认删除模板“${row.templateName}”吗？`, '删除确认', {
    type: 'warning',
  });
  const res = await deleteReportTemplate(row.id);
  if (res.code === 0) {
    ElMessage.success('模板已删除');
    loadData();
  }
};

onMounted(loadData);
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

.pager {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}

.preview-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e6ebf5;
}

.preview-title {
  font-size: 18px;
  font-weight: 600;
  color: #24344d;
}

.preview-meta {
  margin-top: 6px;
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  font-size: 13px;
  color: #607086;
}

.preview-block {
  margin-top: 16px;
}

.preview-label {
  margin-bottom: 8px;
  font-size: 13px;
  font-weight: 600;
  color: #31445f;
}

.preview-text {
  font-size: 13px;
  line-height: 1.7;
  color: #52627d;
  background: #f8fbff;
  border: 1px solid #e3eaf6;
  border-radius: 4px;
  padding: 10px 12px;
}

.section-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.section-tag {
  padding: 6px 10px;
  border-radius: 3px;
  background: #eef4ff;
  color: #34527d;
  font-size: 12px;
}
</style>
