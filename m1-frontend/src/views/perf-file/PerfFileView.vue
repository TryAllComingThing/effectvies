<template>
  <PageContainer title="文件管理">
    <template #actions>
      <el-space>
        <el-button type="primary" v-permission="['admin']" @click="openCreate"><ActionIcon name="Plus" />上传</el-button>
        <el-button type="danger" plain :disabled="!selectedIds.length" v-permission="['admin']" @click="batchDelete">
          <ActionIcon name="Trash2" />删除
        </el-button>
      </el-space>
    </template>

    <el-form inline :model="query" class="query-row">
      <el-form-item label="名称"><el-input v-model="query.name" clearable /></el-form-item>
      <el-form-item label="格式">
        <el-select v-model="query.format" clearable style="width: 120px">
          <el-option label="xls" value="xls" />
          <el-option label="xlsx" value="xlsx" />
          <el-option label="zip" value="zip" />
        </el-select>
      </el-form-item>
      <el-form-item label="解析状态">
        <el-select v-model="query.parseStatus" clearable style="width: 120px">
          <el-option label="未解析" value="unparsed" />
          <el-option label="解析中" value="parsing" />
          <el-option label="成功" value="success" />
          <el-option label="失败" value="fail" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="loadData"><ActionIcon name="Search" />查询</el-button>
        <el-button @click="resetQuery"><ActionIcon name="RotateCcw" />重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="rows" size="small" @selection-change="onSelectionChange">
      <el-table-column type="selection" width="45" />
      <el-table-column type="index" width="56" label="#" />
      <el-table-column prop="name" label="名称" min-width="140" />
      <el-table-column prop="format" label="格式" width="90" />
      <el-table-column label="上报时间" min-width="120">
        <template #default="scope">{{ String(scope.row.uploadedAt || '').slice(0, 10) }}</template>
      </el-table-column>
      <el-table-column prop="uploadedAt" label="上传时间" min-width="160" />
      <el-table-column label="解析状态" width="120">
        <template #default="scope"><StatusTag :status="scope.row.parseStatus" /></template>
      </el-table-column>
      <el-table-column label="操作" min-width="460" fixed="right">
        <template #default="scope">
          <el-space>
            <el-button text type="primary" size="small" v-permission="['admin']" @click="runParse(scope.row.id)">
              <ActionIcon name="WandSparkles" />解析
            </el-button>
            <el-button text type="primary" size="small" v-permission="['admin']" @click="openEdit(scope.row)">
              <ActionIcon name="Pencil" />编辑
            </el-button>
            <el-button text type="primary" size="small" v-permission="['admin']" @click="openCover(scope.row)">
              <ActionIcon name="Replace" />重新上传
            </el-button>
            <el-button text size="small" v-permission="['admin']" @click="openLog(scope.row)">
              <ActionIcon name="FileText" />日志
            </el-button>
            <el-button text type="danger" size="small" v-permission="['admin']" @click="runDelete(scope.row.id)">
              <ActionIcon name="Trash2" />删除
            </el-button>
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

    <el-dialog v-model="createVisible" title="上传文件" width="520px">
      <el-form :model="createForm" label-width="72px" style="margin-bottom: 10px;">
        <el-form-item label="名称">
          <el-input v-model="createForm.name" placeholder="请输入文件名称" />
        </el-form-item>
      </el-form>
      <el-upload drag :auto-upload="false" :show-file-list="true" :on-change="onCreateFileChange" :limit="1">
        <el-icon><upload-filled /></el-icon>
        <div>拖拽文件到此，或点击上传，支持 `xls / xlsx / zip` 格式。</div>
      </el-upload>
      <template #footer>
        <el-button @click="createVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCreate">确认上传</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="editVisible" title="编辑文件" width="480px">
      <el-form :model="editForm" label-width="90px">
        <el-form-item label="名称"><el-input v-model="editForm.name" /></el-form-item>
        <el-form-item label="格式">
          <el-select v-model="editForm.format" style="width:100%">
            <el-option label="xls" value="xls" />
            <el-option label="xlsx" value="xlsx" />
            <el-option label="zip" value="zip" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEdit">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="coverVisible" title="重新上传文件" width="520px">
      <el-upload drag :auto-upload="false" :show-file-list="true" :on-change="onCoverFileChange" :limit="1">
        <el-icon><upload-filled /></el-icon>
        <div>上传新文件后将替换当前文件内容。</div>
      </el-upload>
      <template #footer>
        <el-button @click="coverVisible = false">取消</el-button>
        <el-button type="primary" @click="submitCover">确认</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="logVisible" title="解析日志" width="980px">
      <el-row :gutter="12" class="summary-row">
        <el-col :span="6"><el-card><div class="k">文件名称</div><div class="v">{{ logSummary.fileName }}</div></el-card></el-col>
        <el-col :span="6"><el-card><div class="k">已解析条数</div><div class="v">{{ logSummary.matchedCount }}</div></el-card></el-col>
        <el-col :span="6"><el-card><div class="k">总条数</div><div class="v">{{ logSummary.totalCount }}</div></el-card></el-col>
      </el-row>
      <el-card class="progress-card">
        <div class="k">解析进度</div>
        <el-progress :percentage="logSummary.progress" :status="logSummary.status === 'fail' ? 'exception' : undefined" />
      </el-card>
      <el-table :data="logRows" size="small">
        <el-table-column type="index" width="56" label="#" />
        <el-table-column prop="name" label="绩效主题" min-width="180" />
        <el-table-column prop="typeName" label="类型" min-width="120" />
        <el-table-column prop="deptName" label="科室" min-width="120" />
        <el-table-column prop="proposer" label="提报人" min-width="100" />
        <el-table-column prop="eventAt" label="上报时间" min-width="120" />
        <el-table-column prop="matchedAt" label="解析时间" min-width="170" />
      </el-table>
      <template #footer><el-button @click="logVisible = false">关闭</el-button></template>
    </el-dialog>
  </PageContainer>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { UploadFilled } from '@element-plus/icons-vue';
import PageContainer from '@/components/common/PageContainer.vue';
import StatusTag from '@/components/common/StatusTag.vue';
import ActionIcon from '@/components/common/ActionIcon.vue';
import { coverPerfFile, deletePerfFile, getPerfFileList, parsePerfFile } from '@/api/perf';
import type { PerfFileItem } from '@/types';

const loading = ref(false);
const rows = ref<PerfFileItem[]>([]);
const total = ref(0);
const selectedIds = ref<string[]>([]);
const query = reactive({ pageNum: 1, pageSize: 10, name: '', format: '', parseStatus: '' });

const createVisible = ref(false);
const createFile = ref<File | null>(null);
const createForm = reactive({ name: '' });
const editVisible = ref(false);
const editForm = reactive({ id: '', name: '', format: 'xlsx' as 'xls' | 'xlsx' | 'zip' });
const coverVisible = ref(false);
const coverFile = ref<File | null>(null);
const coverTargetId = ref('');
const logVisible = ref(false);
const logSummary = reactive({
  fileName: '-',
  matchedCount: 0,
  totalCount: 0,
  progress: 0,
  status: 'pending' as 'pending' | 'running' | 'stopped' | 'done' | 'fail',
});
const logRows = ref<
  Array<{
    name: string;
    typeName: string;
    deptName: string;
    proposer: string;
    eventAt: string;
    matchedAt: string;
  }>
>([]);

const loadData = async () => {
  loading.value = true;
  try {
    const res = await getPerfFileList(query);
    rows.value = res.data.list;
    total.value = res.data.total;
  } finally {
    loading.value = false;
  }
};

const onSelectionChange = (selection: PerfFileItem[]) => {
  selectedIds.value = selection.map((item) => item.id);
};

const resetQuery = () => {
  Object.assign(query, { pageNum: 1, pageSize: 10, name: '', format: '', parseStatus: '' });
  loadData();
};

const openCreate = () => {
  createFile.value = null;
  createForm.name = '';
  createVisible.value = true;
};

const onCreateFileChange = (file: { raw?: File }) => {
  createFile.value = file.raw || null;
};

const submitCreate = () => {
  if (!createForm.name.trim()) {
    ElMessage.warning('请输入文件名称');
    return;
  }

  if (!createFile.value) {
    ElMessage.warning('请先选择文件');
    return;
  }

  ElMessage.success(`上传成功（模拟）：${createForm.name}`);
  createVisible.value = false;
  loadData();
};

const openEdit = (row: PerfFileItem) => {
  Object.assign(editForm, { id: row.id, name: row.name, format: row.format });
  editVisible.value = true;
};

const submitEdit = () => {
  ElMessage.success('编辑成功（模拟）');
  editVisible.value = false;
  loadData();
};

const openCover = (row: PerfFileItem) => {
  coverTargetId.value = row.id;
  coverFile.value = null;
  coverVisible.value = true;
};

const onCoverFileChange = (file: { raw?: File }) => {
  coverFile.value = file.raw || null;
};

const submitCover = async () => {
  if (!coverFile.value) {
    ElMessage.warning('请先选择覆盖文件');
    return;
  }

  const res = await coverPerfFile(coverTargetId.value);
  if (res.code === 0) {
    ElMessage.success(`覆盖成功（模拟）：${coverFile.value.name}`);
    coverVisible.value = false;
    loadData();
    return;
  }

  ElMessage.warning(res.message);
};

const runParse = async (id: string) => {
  const res = await parsePerfFile(id);
  if (res.code === 0) {
    ElMessage.success('解析任务已触发');
    loadData();
    return;
  }

  ElMessage.warning(res.message);
};

const runDelete = async (id: string) => {
  await ElMessageBox.confirm('确认删除该文件吗？', '删除确认', { type: 'warning' });
  const res = await deletePerfFile(id);
  if (res.code === 0) {
    ElMessage.success('删除成功');
    loadData();
    return;
  }

  ElMessage.warning(res.message);
};

const batchDelete = async () => {
  await ElMessageBox.confirm(`确认删除选中的 ${selectedIds.value.length} 条文件吗？`, '批量删除确认', { type: 'warning' });
  for (const id of selectedIds.value) await deletePerfFile(id);
  ElMessage.success('批量删除成功');
  loadData();
};

const openLog = (row: PerfFileItem) => {
  const progress = row.parseStatus === 'success' ? 100 : row.parseStatus === 'parsing' ? 65 : row.parseStatus === 'fail' ? 48 : 0;
  const status = row.parseStatus === 'fail' ? 'fail' : row.parseStatus === 'success' ? 'done' : row.parseStatus === 'parsing' ? 'running' : 'pending';
  const totalCount = 20;
  const matchedCount = Math.max(0, Math.round((progress / 100) * totalCount));

  Object.assign(logSummary, {
    fileName: row.name,
    matchedCount,
    totalCount,
    progress,
    status,
  });

  const eventPool = [
    { name: '边境联合巡逻保障', typeName: '边境防卫' },
    { name: '防空预警演练复盘', typeName: '防空作战' },
    { name: '海上编队训练协同', typeName: '海上训练' },
    { name: '战备物资调配校验', typeName: '后勤保障' },
    { name: '应急通信链路测试', typeName: '通信保障' },
    { name: '夜间机动部署评估', typeName: '机动部署' },
  ];

  logRows.value = Array.from({ length: matchedCount || 1 }, (_, i) => ({
    name: eventPool[i % eventPool.length].name,
    typeName: eventPool[i % eventPool.length].typeName,
    deptName: ['科室一', '科室二', '科室三'][i % 3],
    proposer: ['张三', '李四', '王五'][i % 3],
    eventAt: '2026-05-18',
    matchedAt: '2026-05-18 10:30:00',
  }));
  logVisible.value = true;
};

onMounted(loadData);
</script>

<style scoped lang="scss">
.query-row { margin-bottom: 0.7rem; }
.pager { margin-top: 0.8rem; display: flex; justify-content: flex-end; }
.summary-row { margin-bottom: 10px; }
.progress-card { margin-bottom: 10px; }
.k { color: #5f6b7a; font-size: 13px; }
.v { margin-top: 4px; font-size: 18px; font-weight: 600; color: #1f2d3d; }
</style>
