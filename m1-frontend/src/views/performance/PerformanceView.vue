<template>
  <PageContainer title="绩效数据台账">
    <template #actions>
      <el-space>
        <el-button type="primary" v-permission="['admin']" @click="openCreate">
          <ActionIcon name="Plus" />新增
        </el-button>
        <el-button
          type="danger"
          plain
          :disabled="!selectedIds.length"
          v-permission="['admin']"
          @click="todo('删除')"
        >
          <ActionIcon name="Trash2" />删除
        </el-button>
      </el-space>
    </template>

    <el-form inline :model="query" class="query-row">
      <el-form-item label="主题">
        <el-input v-model="query.title" clearable placeholder="请输入关键词" />
      </el-form-item>
      <el-form-item label="数据源">
        <el-select v-model="query.sourceName" clearable placeholder="全部数据源">
          <el-option label="源1" value="源1" />
          <el-option label="源2" value="源2" />
        </el-select>
      </el-form-item>
      <el-form-item label="类型">
        <el-input v-model="query.routeName" clearable placeholder="请输入类型" />
      </el-form-item>
      <el-form-item label="科室">
        <el-select v-model="query.deptName" clearable placeholder="全部科室">
          <el-option v-for="item in DEPT_OPTIONS" :key="item" :label="item" :value="item" />
        </el-select>
      </el-form-item>
      <el-form-item label="提报人">
        <el-input v-model="query.proposer" clearable placeholder="请输入提报人" />
      </el-form-item>
      <el-form-item label="时间">
        <el-date-picker v-model="query.eventDate" type="date" value-format="YYYY-MM-DD" placeholder="请选择日期" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="loadData"><ActionIcon name="Search" />查询</el-button>
        <el-button @click="resetQuery"><ActionIcon name="RotateCcw" />重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="rows" size="small" @selection-change="onSelectionChange" @sort-change="onSortChange">
      <el-table-column type="selection" width="45" />
      <el-table-column type="index" width="56" label="#" />
      <el-table-column prop="title" label="主题" min-width="180" />
      <el-table-column prop="routeName" label="类型" min-width="120" />
      <el-table-column prop="sourceName" label="数据源" min-width="100" />
      <el-table-column prop="deptName" label="科室" min-width="120" />
      <el-table-column prop="proposer" label="提报人" min-width="110" />
      <el-table-column prop="confidence" label="置信度" width="100" sortable="custom" />
      <el-table-column prop="eventAt" label="上报时间" min-width="170" />
      <el-table-column prop="matchedAt" label="匹配时间" min-width="170" />
      <el-table-column label="操作" min-width="220" fixed="right" class-name="table-action-cell">
        <template #default="scope">
          <el-space>
            <el-button text type="primary" size="small" v-permission="['admin']" @click="openEdit(scope.row)">
              <ActionIcon name="Pencil" />修改
            </el-button>
            <el-button text type="primary" size="small" @click="openTrace(scope.row)">
              <ActionIcon name="GitBranch" />溯源
            </el-button>
            <el-button text type="primary" size="small" @click="openDetail(scope.row)">
              <ActionIcon name="Eye" />详情
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

    <el-dialog v-model="editVisible" :title="editMode === 'create' ? '新增绩效' : '编辑绩效'" width="560px">
      <el-form :model="editForm" label-width="88px">
        <el-form-item label="主题"><el-input v-model="editForm.title" /></el-form-item>
        <el-form-item label="内容"><el-input v-model="editForm.content" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="类型"><el-input v-model="editForm.routeName" /></el-form-item>
        <el-form-item label="科室"><el-input v-model="editForm.deptName" /></el-form-item>
        <el-form-item label="提报人"><el-input v-model="editForm.proposer" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEdit">保存</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailVisible" title="查看绩效详情" width="620px">
      <template v-if="detailItem">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="任务号">{{ detailItem.sourceTaskNo }}</el-descriptions-item>
          <el-descriptions-item label="批次号">{{ detailItem.sourceBatchNo }}</el-descriptions-item>
          <el-descriptions-item label="匹配时间">{{ detailItem.matchedAt }}</el-descriptions-item>
          <el-descriptions-item label="提报人">{{ detailItem.proposer }}</el-descriptions-item>
          <el-descriptions-item label="主题" :span="2">{{ detailItem.title }}</el-descriptions-item>
          <el-descriptions-item label="内容" :span="2">{{ detailItem.content }}</el-descriptions-item>
        </el-descriptions>
      </template>
    </el-dialog>

    <el-dialog v-model="traceVisible" title="溯源" width="700px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="源数据内容">{{ traceData.sourceContent }}</el-descriptions-item>
        <el-descriptions-item label="当前主题内容">{{ traceData.currentContent }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button @click="traceVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import PageContainer from '@/components/common/PageContainer.vue';
import ActionIcon from '@/components/common/ActionIcon.vue';
import { DEPT_OPTIONS } from '@/utils/dept-options';
import { getPerformanceList } from '@/api/review';
import type { PerformanceItem } from '@/types';

const loading = ref(false);
const rows = ref<PerformanceItem[]>([]);
const total = ref(0);
const selectedIds = ref<string[]>([]);
const query = reactive({ pageNum: 1, pageSize: 10, title: '', sourceName: '', routeName: '', deptName: '', proposer: '', eventDate: '' });
const sortState = ref<'ascending' | 'descending' | null>(null);
const detailVisible = ref(false);
const detailItem = ref<PerformanceItem | null>(null);
const traceVisible = ref(false);
const traceData = reactive({ sourceContent: '', currentContent: '' });
const editVisible = ref(false);
const editMode = ref<'create' | 'edit'>('create');
const editForm = reactive({ id: '', title: '', content: '', routeName: '', deptName: '', proposer: '' });

const loadData = async () => {
  loading.value = true;
  try {
    const res = await getPerformanceList(query);
    let list = [...res.data.list];
    if (query.title.trim()) {
      list = list.filter((item) => item.title.includes(query.title.trim()));
    }
    if (query.sourceName) {
      list = list.filter((item) => item.sourceName === query.sourceName);
    }
    if (query.eventDate) {
      list = list.filter((item) => String(item.eventAt).startsWith(query.eventDate));
    }
    if (sortState.value) {
      list.sort((a, b) => (sortState.value === 'ascending' ? a.confidence - b.confidence : b.confidence - a.confidence));
    }
    rows.value = list;
    total.value = res.data.total;
  } finally {
    loading.value = false;
  }
};

const onSortChange = (payload: { prop: string; order: 'ascending' | 'descending' | null }) => {
  if (payload.prop !== 'confidence') return;
  sortState.value = payload.order;
  loadData();
};

const resetQuery = () => {
  Object.assign(query, { pageNum: 1, pageSize: 10, title: '', sourceName: '', routeName: '', deptName: '', proposer: '', eventDate: '' });
  loadData();
};

const onSelectionChange = (items: PerformanceItem[]) => {
  selectedIds.value = items.map((item) => item.id);
};

const todo = (name: string) => ElMessage.info(`${name}功能待对接`);

const openCreate = () => {
  editMode.value = 'create';
  Object.assign(editForm, { id: '', title: '', content: '', routeName: '', deptName: '', proposer: '' });
  editVisible.value = true;
};

const openEdit = (row: PerformanceItem) => {
  editMode.value = 'edit';
  Object.assign(editForm, {
    id: row.id,
    title: row.title,
    content: row.content,
    routeName: row.routeName,
    deptName: row.deptName,
    proposer: row.proposer,
  });
  editVisible.value = true;
};

const submitEdit = () => {
  ElMessage.success(editMode.value === 'create' ? '新增成功（模拟）' : '编辑成功（模拟）');
  editVisible.value = false;
};

const openDetail = (row: PerformanceItem) => {
  detailItem.value = row;
  detailVisible.value = true;
};

const openTrace = (row: PerformanceItem) => {
  traceData.sourceContent = `源数据(${row.sourceName})：${row.content}`;
  traceData.currentContent = `当前主题：${row.title}；内容：${row.content}`;
  traceVisible.value = true;
};

onMounted(loadData);
</script>

<style scoped>
.query-row {
  margin-bottom: 0.7rem;
}

.pager {
  margin-top: 0.8rem;
  display: flex;
  justify-content: flex-end;
}

.query-row :deep(.el-input) {
  min-width: 96px;
}
</style>
