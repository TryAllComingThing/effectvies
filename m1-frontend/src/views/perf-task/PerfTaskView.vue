<template>
  <PageContainer title="任务管理">
    <template #actions>
      <el-space>
        <el-button type="primary" v-permission="['admin']" @click="openCreate"><ActionIcon name="Plus" />新增</el-button>
        <el-button type="danger" plain :disabled="!selectedIds.length" v-permission="['admin']" @click="todo('删除')">
          <ActionIcon name="Trash2" />批量删除
        </el-button>
      </el-space>
    </template>

    <el-form inline :model="query" class="query-row">
      <el-form-item label="任务号"><el-input v-model="query.taskNo" clearable /></el-form-item>
      <el-form-item label="批号"><el-input v-model="query.batchNo" clearable /></el-form-item>
      <el-form-item label="文件名"><el-input v-model="query.fileName" clearable /></el-form-item>
      <el-form-item label="任务状态">
        <el-select v-model="query.taskStatus" clearable style="width: 120px">
          <el-option label="待开始" value="pending" />
          <el-option label="运行中" value="running" />
          <el-option label="已停止" value="stopped" />
          <el-option label="已完成" value="done" />
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
      <el-table-column prop="taskNo" label="任务号" min-width="180" />
      <el-table-column prop="batchNo" label="批号" min-width="180" />
      <el-table-column prop="fileName" label="文件名称" min-width="120" />
      <el-table-column label="状态" width="120">
        <template #default="scope"><StatusTag :status="scope.row.taskStatus" /></template>
      </el-table-column>
      <el-table-column label="进度" min-width="170">
        <template #default="scope">
          <el-progress :percentage="scope.row.progress" :status="scope.row.taskStatus === 'fail' ? 'exception' : undefined" />
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" min-width="160" />
      <el-table-column label="操作" min-width="380" fixed="right">
        <template #default="scope">
          <el-space>
            <el-button text type="primary" size="small" v-permission="['admin']" @click="runMainAction(scope.row)">
              <ActionIcon :name="getMainActionMeta(scope.row).icon" />{{ getMainActionMeta(scope.row).label }}
            </el-button>
            <el-button text type="primary" size="small" v-permission="['admin']" @click="openEdit(scope.row)">
              <ActionIcon name="Pencil" />编辑
            </el-button>
            <el-button text size="small" v-permission="['admin']" @click="openLogDialog(scope.row)">
              <ActionIcon name="FileText" />运行日志
            </el-button>
            <el-button text type="danger" size="small" v-permission="['admin']" @click="runAction('clear', scope.row.id)">
              <ActionIcon name="Eraser" />清除
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

    <el-dialog v-model="dialogVisible" :title="dialogMode === 'create' ? '新增任务' : '编辑任务'" width="480px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="批号">
          <el-select v-model="form.batchNo" :disabled="dialogMode === 'edit'" style="width:100%" placeholder="请选择已上传文件批号">
            <el-option v-for="item in batchNoOptions" :key="item.batchNo" :label="`${item.batchNo}（${item.name}）`" :value="item.batchNo" />
          </el-select>
        </el-form-item>
        <el-form-item label="任务名称"><el-input v-model="form.fileName" /></el-form-item>
        <el-form-item label="任务状态">
          <el-select v-model="form.taskStatus" style="width:100%">
            <el-option label="待开始" value="pending" />
            <el-option label="运行中" value="running" />
            <el-option label="已停止" value="stopped" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitDialog">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="logVisible" title="智能匹配日志" width="980px">
      <el-row :gutter="12" class="summary-row">
        <el-col :span="6"><el-card><div class="k">任务号</div><div class="v">{{ logSummary.taskNo }}</div></el-card></el-col>
        <el-col :span="6"><el-card><div class="k">批号</div><div class="v">{{ logSummary.batchNo }}</div></el-card></el-col>
        <el-col :span="6"><el-card><div class="k">已匹配条数</div><div class="v">{{ logSummary.matchedCount }}</div></el-card></el-col>
        <el-col :span="6"><el-card><div class="k">总条数</div><div class="v">{{ logSummary.totalCount }}</div></el-card></el-col>
      </el-row>
      <el-card class="progress-card">
        <div class="k">匹配进度</div>
        <el-progress :percentage="logSummary.progress" :status="logSummary.status === 'fail' ? 'exception' : undefined" />
      </el-card>
      <el-table :data="logRows" size="small">
        <el-table-column type="index" width="56" label="#" />
        <el-table-column prop="perfNo" label="绩效编号" min-width="160" />
        <el-table-column prop="name" label="绩效名称" min-width="160" />
        <el-table-column prop="deptName" label="科室" min-width="120" />
        <el-table-column prop="score" label="分数" width="90" />
        <el-table-column prop="matchResult" label="匹配结果" min-width="140" />
        <el-table-column prop="matchedAt" label="匹配时间" min-width="170" />
      </el-table>
      <template #footer><el-button @click="logVisible = false">关闭</el-button></template>
    </el-dialog>
  </PageContainer>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import PageContainer from '@/components/common/PageContainer.vue';
import StatusTag from '@/components/common/StatusTag.vue';
import ActionIcon from '@/components/common/ActionIcon.vue';
import { clearPerfTask, getPerfFileList, getPerfTaskList, resumePerfTask, startPerfTask, stopPerfTask } from '@/api/perf';
import type { PerfFileItem, PerfTaskItem } from '@/types';

const loading = ref(false);
const rows = ref<PerfTaskItem[]>([]);
const total = ref(0);
const selectedIds = ref<string[]>([]);
const query = reactive({ pageNum: 1, pageSize: 10, taskNo: '', batchNo: '', fileName: '', taskStatus: '' });

const dialogVisible = ref(false);
const dialogMode = ref<'create' | 'edit'>('create');
const form = reactive({ id: '', batchNo: '', fileName: '', taskStatus: 'pending' });
const batchNoOptions = ref<PerfFileItem[]>([]);
const logVisible = ref(false);
const logSummary = reactive({ taskNo: '-', batchNo: '-', matchedCount: 0, totalCount: 0, progress: 0, status: 'pending' as PerfTaskItem['taskStatus'] });
const logRows = ref<Array<{ perfNo: string; name: string; deptName: string; score: number; matchResult: string; matchedAt: string }>>([]);

const loadData = async () => {
  loading.value = true;
  try {
    const res = await getPerfTaskList(query);
    rows.value = res.data.list;
    total.value = res.data.total;
  } finally {
    loading.value = false;
  }
};

const loadBatchNoOptions = async () => {
  const res = await getPerfFileList({ pageNum: 1, pageSize: 200 });
  batchNoOptions.value = res.data.list;
};

const onSelectionChange = (s: PerfTaskItem[]) => {
  selectedIds.value = s.map((i) => i.id);
};

const resetQuery = () => {
  Object.assign(query, { pageNum: 1, pageSize: 10, taskNo: '', batchNo: '', fileName: '', taskStatus: '' });
  loadData();
};

const todo = (name: string) => ElMessage.info(`${name}功能待对接`);

const openCreate = async () => {
  dialogMode.value = 'create';
  await loadBatchNoOptions();
  Object.assign(form, { id: '', batchNo: '', fileName: '', taskStatus: 'pending' });
  dialogVisible.value = true;
};

const openEdit = (row: PerfTaskItem) => {
  dialogMode.value = 'edit';
  Object.assign(form, { id: row.id, batchNo: row.batchNo, fileName: row.fileName, taskStatus: row.taskStatus });
  dialogVisible.value = true;
};

const submitDialog = () => {
  if (!form.batchNo) {
    ElMessage.warning('请选择批号');
    return;
  }

  ElMessage.success(dialogMode.value === 'create' ? '新增成功（模拟）' : '编辑成功（模拟）');
  dialogVisible.value = false;
};

const runAction = async (action: 'start' | 'stop' | 'resume' | 'clear', id: string) => {
  const map = { start: startPerfTask, stop: stopPerfTask, resume: resumePerfTask, clear: clearPerfTask };
  const res = await map[action](id);
  if (res.code === 0) {
    ElMessage.success('操作成功');
    loadData();
    return;
  }

  ElMessage.warning(res.message);
};

const getMainActionMeta = (row: PerfTaskItem) => {
  if (row.taskStatus === 'running') return { action: 'stop' as const, label: '停止', icon: 'Pause' };
  if (row.taskStatus === 'stopped') return { action: 'resume' as const, label: '继续', icon: 'RotateCw' };
  return { action: 'start' as const, label: '开始', icon: 'Play' };
};

const runMainAction = (row: PerfTaskItem) => runAction(getMainActionMeta(row).action, row.id);

const openLogDialog = (row: PerfTaskItem) => {
  const totalCount = 20;
  const matchedCount = Math.max(0, Math.round((row.progress / 100) * totalCount));
  Object.assign(logSummary, {
    taskNo: row.taskNo,
    batchNo: row.batchNo,
    matchedCount,
    totalCount,
    progress: row.progress,
    status: row.taskStatus,
  });

  logRows.value = Array.from({ length: matchedCount || 1 }, (_, i) => ({
    perfNo: `PF-${row.taskNo}-${String(i + 1).padStart(3, '0')}`,
    name: `绩效项 ${i + 1}`,
    deptName: ['科室一', '科室二', '科室三'][i % 3],
    score: 70 + (i % 30),
    matchResult: i % 7 === 0 ? '待人工复核' : '智能匹配成功',
    matchedAt: '2026-05-18 10:30:00',
  }));
  logVisible.value = true;
};

onMounted(loadData);
</script>

<style scoped>
.query-row { margin-bottom: .7rem; }
.pager { margin-top: .8rem; display: flex; justify-content: flex-end; }
.summary-row { margin-bottom: 10px; }
.progress-card { margin-bottom: 10px; }
.k { color: #5f6b7a; font-size: 13px; }
.v { margin-top: 4px; font-size: 18px; font-weight: 600; color: #1f2d3d; }
</style>
