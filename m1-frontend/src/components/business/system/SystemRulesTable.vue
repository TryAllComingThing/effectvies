<template>
  <div>
    <el-form inline :model="ruleQuery" class="query-row">
      <el-form-item label="规则名称"><el-input v-model="ruleQuery.name" clearable /></el-form-item>
      <el-form-item label="类型">
        <el-select v-model="ruleQuery.type" clearable style="width: 120px">
          <el-option label="规则" value="rule" />
          <el-option label="相似度" value="similarity" />
        </el-select>
      </el-form-item>
      <el-form-item label="规则内容"><el-input v-model="ruleQuery.content" clearable /></el-form-item>
      <el-form-item label="状态">
        <el-select v-model="ruleQuery.status" clearable style="width: 120px">
          <el-option label="启用" value="enabled" />
          <el-option label="停用" value="disabled" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="emit('search')">查询</el-button>
        <el-button @click="emit('reset')">重置</el-button>
      </el-form-item>
    </el-form>

    <el-table :data="rules" size="small" v-loading="rulesLoading" @selection-change="handleSelect">
      <el-table-column type="selection" width="45" />
      <el-table-column type="index" width="56" label="#" />
      <el-table-column prop="name" label="规则名称" min-width="130" />
      <el-table-column label="类型" width="100">
        <template #default="scope">{{ scope.row.type === 'similarity' ? '相似度' : '规则' }}</template>
      </el-table-column>
      <el-table-column prop="content" label="规则内容" min-width="160" />
      <el-table-column label="状态" width="100">
        <template #default="scope"><StatusTag :status="scope.row.status" /></template>
      </el-table-column>
      <el-table-column label="操作" min-width="240" fixed="right" class-name="table-action-cell">
        <template #default="scope">
          <el-space>
            <el-button text type="primary" size="small" @click="emit('view', scope.row)">
              <ActionIcon name="Eye" />查看
            </el-button>
            <el-button text type="primary" size="small" @click="emit('edit', scope.row)">
              <ActionIcon name="Pencil" />编辑
            </el-button>
            <el-button text type="primary" size="small" @click="emit('toggle', scope.row.id)">
              <ActionIcon name="Power" />{{ scope.row.status === 'enabled' ? '停用' : '启用' }}
            </el-button>
          </el-space>
        </template>
      </el-table-column>
    </el-table>
    <div class="pager">
      <el-pagination
        v-model:current-page="ruleQuery.pageNum"
        v-model:page-size="ruleQuery.pageSize"
        :total="ruleTotal"
        layout="total, sizes, prev, pager, next"
        :page-sizes="[10, 20, 50]"
        @current-change="emit('search')"
        @size-change="emit('search')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import ActionIcon from '@/components/common/ActionIcon.vue';
import StatusTag from '@/components/common/StatusTag.vue';
import type { RuleItem } from '@/api/modules/system/rule';

type RuleQuery = {
  pageNum: number;
  pageSize: number;
  name: string;
  type: string;
  tag: string;
  content: string;
  deptName: string;
  status: string;
};

const props = defineProps<{
  ruleQuery: RuleQuery;
  rulesLoading: boolean;
  rules: RuleItem[];
  ruleTotal: number;
}>();

const emit = defineEmits<{
  search: [];
  reset: [];
  'selection-change': [items: RuleItem[]];
  view: [row: Record<string, unknown>];
  edit: [row: Record<string, unknown>];
  toggle: [id: string];
}>();

const handleSelect = (items: RuleItem[]) => {
  emit('selection-change', items);
};
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
</style>
