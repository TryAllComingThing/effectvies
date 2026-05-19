<template>
  <PageContainer title="绩效审核管理">
    <template #actions>
      <el-space>
        <el-button type="primary" v-permission="['admin']" @click="openCreate"><ActionIcon name="Plus" />新增</el-button>
        <el-button v-permission="['admin']" @click="openEditBySelection"><ActionIcon name="Pencil" />编辑</el-button>
        <el-button type="danger" plain :disabled="!selectedIds.length" v-permission="['admin']" @click="todo('删除')"><ActionIcon name="Trash2" />删除</el-button>
      </el-space>
    </template>

    <el-form inline :model="query" class="query-row">
      <el-form-item label="主题"><el-input v-model="query.title" clearable /></el-form-item>
      <el-form-item label="路线"><el-input v-model="query.routeName" clearable /></el-form-item>
      <el-form-item label="科室"><el-select v-model="query.deptName" clearable><el-option v-for="d in DEPT_OPTIONS" :key="d" :label="d" :value="d" /></el-select></el-form-item>
      <el-form-item label="提出人"><el-input v-model="query.proposer" clearable /></el-form-item>
      <el-form-item>
        <el-button type="primary" @click="loadData"><ActionIcon name="Search" />查询</el-button>
        <el-button @click="resetQuery"><ActionIcon name="RotateCcw" />重置</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="rows" size="small" @selection-change="onSelectionChange">
      <el-table-column type="selection" width="45" />
      <el-table-column type="index" width="56" label="#" />
      <el-table-column prop="title" label="主题" min-width="160" />
      <el-table-column prop="routeName" label="路线" min-width="110" />
      <el-table-column prop="deptName" label="科室" min-width="110" />
      <el-table-column prop="proposer" label="提出人" min-width="100" />
      <el-table-column prop="score" label="分数" width="80" />
      <el-table-column prop="confidence" label="置信度" width="90" />
      <el-table-column label="审核状态" width="120">
        <template #default="scope"><StatusTag :status="scope.row.reviewStatus" /></template>
      </el-table-column>
      <el-table-column label="操作" min-width="340" fixed="right">
        <template #default="scope">
          <el-space>
            <el-button text type="success" size="small" v-permission="['admin']" @click="runApprove(scope.row.id)"><ActionIcon name="CheckCircle2" />审核</el-button>
            <el-button text type="danger" size="small" v-permission="['admin']" @click="openReject(scope.row.id)"><ActionIcon name="XCircle" />驳回</el-button>
            <el-button text type="primary" size="small" v-permission="['admin']" @click="openEdit(scope.row)"><ActionIcon name="Pencil" />编辑</el-button>
            <el-button text type="primary" size="small" @click="openDetail(scope.row)"><ActionIcon name="Eye" />详情</el-button>
          </el-space>
        </template>
      </el-table-column>
    </el-table>

    <div class="pager"><el-pagination v-model:current-page="query.pageNum" v-model:page-size="query.pageSize" :total="total" layout="total, sizes, prev, pager, next" :page-sizes="[10,20,50]" @current-change="loadData" @size-change="loadData" /></div>

    <el-dialog v-model="editVisible" :title="editMode==='create'?'新增绩效审核':'编辑绩效审核'" width="560px">
      <el-form :model="editForm" label-width="88px">
        <el-form-item label="主题"><el-input v-model="editForm.title" /></el-form-item>
        <el-form-item label="内容"><el-input v-model="editForm.content" type="textarea" :rows="3" /></el-form-item>
        <el-form-item label="路线"><el-input v-model="editForm.routeName" /></el-form-item>
        <el-form-item label="科室"><el-input v-model="editForm.deptName" /></el-form-item>
        <el-form-item label="提出人"><el-input v-model="editForm.proposer" /></el-form-item>
      </el-form>
      <template #footer><el-button @click="editVisible=false">取消</el-button><el-button type="primary" @click="submitEdit">保存</el-button></template>
    </el-dialog>

    <el-dialog v-model="rejectVisible" title="驳回审核" width="420px"><el-form><el-form-item label="驳回意见" required><el-input v-model="rejectComment" type="textarea" :rows="4" /></el-form-item></el-form><template #footer><el-button @click="rejectVisible=false">取消</el-button><el-button type="primary" @click="runReject">确认</el-button></template></el-dialog>
    <el-dialog v-model="detailVisible" title="审核详情" width="620px"><template v-if="detailItem"><el-descriptions :column="2" border><el-descriptions-item label="任务号">{{detailItem.sourceTaskNo}}</el-descriptions-item><el-descriptions-item label="批号">{{detailItem.sourceBatchNo}}</el-descriptions-item><el-descriptions-item label="匹配时间">{{detailItem.parsedAt}}</el-descriptions-item><el-descriptions-item label="提出人">{{detailItem.proposer}}</el-descriptions-item></el-descriptions></template></el-dialog>
  </PageContainer>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import PageContainer from '@/components/common/PageContainer.vue';
import StatusTag from '@/components/common/StatusTag.vue';
import ActionIcon from '@/components/common/ActionIcon.vue';
import { DEPT_OPTIONS } from '@/utils/dept-options';import { approveReview, getReviewList, rejectReview } from '@/api/review';
import type { PerfReviewItem } from '@/types';

const loading=ref(false),rows=ref<PerfReviewItem[]>([]),total=ref(0),selectedIds=ref<string[]>([]);
const query=reactive({pageNum:1,pageSize:10,title:'',routeName:'',deptName:'',proposer:''});
const rejectVisible=ref(false),rejectTargetId=ref(''),rejectComment=ref('');
const detailVisible=ref(false),detailItem=ref<PerfReviewItem|null>(null);
const editVisible=ref(false),editMode=ref<'create'|'edit'>('create');
const editForm=reactive({id:'',title:'',content:'',routeName:'',deptName:'',proposer:''});

const loadData=async()=>{loading.value=true;try{const r=await getReviewList(query);rows.value=r.data.list;total.value=r.data.total;}finally{loading.value=false;}};
const resetQuery=()=>{Object.assign(query,{pageNum:1,pageSize:10,title:'',routeName:'',deptName:'',proposer:''});loadData();};
const onSelectionChange=(s:PerfReviewItem[])=>selectedIds.value=s.map(i=>i.id);
const todo=(n:string)=>ElMessage.info(`${n}功能待对接`);

const openCreate=()=>{editMode.value='create';Object.assign(editForm,{id:'',title:'',content:'',routeName:'',deptName:'',proposer:''});editVisible.value=true;};
const openEdit=(row:PerfReviewItem)=>{editMode.value='edit';Object.assign(editForm,{id:row.id,title:row.title,content:row.content,routeName:row.routeName,deptName:row.deptName,proposer:row.proposer});editVisible.value=true;};
const openEditBySelection=()=>{const row=rows.value.find(i=>i.id===selectedIds.value[0]); if(!row){ElMessage.warning('请先选择一条数据');return;} openEdit(row);};
const submitEdit=()=>{ElMessage.success(editMode.value==='create'?'新增成功（模拟）':'编辑成功（模拟）');editVisible.value=false;};

const runApprove=async(id:string)=>{const r=await approveReview(id);if(r.code===0){ElMessage.success('审核通过');loadData();return;}ElMessage.warning(r.message);};
const openReject=(id:string)=>{rejectTargetId.value=id;rejectComment.value='';rejectVisible.value=true;};
const runReject=async()=>{if(!rejectComment.value.trim())return ElMessage.warning('驳回意见必填');const r=await rejectReview(rejectTargetId.value,rejectComment.value);if(r.code===0){ElMessage.success('驳回完成');rejectVisible.value=false;loadData();return;}ElMessage.warning(r.message);};
const openDetail=(row:PerfReviewItem)=>{detailItem.value=row;detailVisible.value=true;};

onMounted(loadData);
</script>

<style scoped>.query-row{margin-bottom:.7rem}.pager{margin-top:.8rem;display:flex;justify-content:flex-end}</style>
