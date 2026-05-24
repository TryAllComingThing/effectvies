<template>
  <el-tabs :model-value="tab" @update:model-value="handleTabChange">
    <el-tab-pane label="业务语义定义" name="biz">
      <el-form inline :model="semanticQuery" class="query-row">
        <el-form-item label="语义名称"><el-input v-model="semanticQuery.name" clearable /></el-form-item>
        <el-form-item label="语义内容"><el-input v-model="semanticQuery.keyword" clearable /></el-form-item>
        <el-form-item label="状态">
          <el-select v-model="semanticQuery.status" clearable style="width: 120px">
            <el-option label="启用" value="enabled" />
            <el-option label="停用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="emit('search-semantic')">查询</el-button>
          <el-button @click="emit('reset-semantic')">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="semantics" size="small" v-loading="semanticsLoading" @selection-change="handleSemanticSelect">
        <el-table-column type="selection" width="45" />
        <el-table-column type="index" width="56" label="#" />
        <el-table-column prop="code" label="语义编码" min-width="120" />
        <el-table-column prop="name" label="语义名称" min-width="130" />
        <el-table-column prop="keyword" label="语义内容" min-width="220" />
        <el-table-column label="状态" width="100">
          <template #default="scope"><StatusTag :status="scope.row.status" /></template>
        </el-table-column>
        <el-table-column label="操作" min-width="220" fixed="right" class-name="table-action-cell">
          <template #default="scope">
            <el-space>
              <el-button text type="primary" size="small" @click="emit('semantic-edit', scope.row)">
                <ActionIcon name="Pencil" />编辑
              </el-button>
              <el-button text type="primary" size="small" @click="emit('semantic-toggle', scope.row.id)">
                <ActionIcon name="Power" />{{ scope.row.status === 'enabled' ? '停用' : '启用' }}
              </el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
      <div class="pager">
        <el-pagination
          v-model:current-page="semanticQuery.pageNum"
          v-model:page-size="semanticQuery.pageSize"
          :total="semanticTotal"
          layout="total, sizes, prev, pager, next"
          :page-sizes="[10, 20, 50]"
          @current-change="emit('search-semantic')"
          @size-change="emit('search-semantic')"
        />
      </div>
    </el-tab-pane>

    <el-tab-pane label="SQL 模板定义" name="sql">
      <el-form inline :model="sqlQuery" class="query-row">
        <el-form-item label="模板编码"><el-input v-model="sqlQuery.code" clearable /></el-form-item>
        <el-form-item label="模板名称"><el-input v-model="sqlQuery.name" clearable /></el-form-item>
        <el-form-item label="SQL 摘要"><el-input v-model="sqlQuery.sqlBrief" clearable /></el-form-item>
        <el-form-item label="状态">
          <el-select v-model="sqlQuery.status" clearable style="width: 120px">
            <el-option label="启用" value="enabled" />
            <el-option label="停用" value="disabled" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="emit('search-sql')">查询</el-button>
          <el-button @click="emit('reset-sql')">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="sqlTemplates" size="small" v-loading="sqlLoading" @selection-change="handleSqlSelect">
        <el-table-column type="selection" width="45" />
        <el-table-column type="index" width="56" label="#" />
        <el-table-column prop="code" label="模板编码" min-width="120" />
        <el-table-column prop="name" label="模板名称" min-width="130" />
        <el-table-column prop="sqlBrief" label="SQL 摘要" min-width="180" />
        <el-table-column label="状态" width="100">
          <template #default="scope"><StatusTag :status="scope.row.status" /></template>
        </el-table-column>
        <el-table-column label="操作" min-width="260" fixed="right" class-name="table-action-cell">
          <template #default="scope">
            <el-space>
              <el-button text type="primary" size="small" @click="emit('sql-edit', scope.row)">
                <ActionIcon name="Pencil" />编辑
              </el-button>
              <el-button text type="success" size="small" @click="emit('sql-test', scope.row)">测试 SQL</el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
      <div class="pager">
        <el-pagination
          v-model:current-page="sqlQuery.pageNum"
          v-model:page-size="sqlQuery.pageSize"
          :total="sqlTotal"
          layout="total, sizes, prev, pager, next"
          :page-sizes="[10, 20, 50]"
          @current-change="emit('search-sql')"
          @size-change="emit('search-sql')"
        />
      </div>
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
import ActionIcon from '@/components/common/ActionIcon.vue';
import StatusTag from '@/components/common/StatusTag.vue';
import type { SemanticItem, SqlTemplateItem } from '@/api/modules/system/semantic';

type SemanticQuery = {
  pageNum: number;
  pageSize: number;
  name: string;
  keyword: string;
  deptName: string;
  status: string;
};

type SqlQuery = {
  pageNum: number;
  pageSize: number;
  code: string;
  name: string;
  sqlBrief: string;
  deptName: string;
  status: string;
};

const props = defineProps<{
  tab: 'biz' | 'sql';
  semanticQuery: SemanticQuery;
  semanticsLoading: boolean;
  semantics: SemanticItem[];
  semanticTotal: number;
  sqlQuery: SqlQuery;
  sqlLoading: boolean;
  sqlTemplates: SqlTemplateItem[];
  sqlTotal: number;
}>();

const emit = defineEmits<{
  'update:tab': [value: 'biz' | 'sql'];
  'search-semantic': [];
  'reset-semantic': [];
  'semantic-selection-change': [items: SemanticItem[]];
  'semantic-edit': [row: Record<string, unknown>];
  'semantic-toggle': [id: string];
  'search-sql': [];
  'reset-sql': [];
  'sql-selection-change': [items: SqlTemplateItem[]];
  'sql-edit': [row: Record<string, unknown>];
  'sql-test': [row: SqlTemplateItem];
}>();

const handleTabChange = (value: string | number) => {
  emit('update:tab', value as 'biz' | 'sql');
};

const handleSemanticSelect = (items: SemanticItem[]) => {
  emit('semantic-selection-change', items);
};

const handleSqlSelect = (items: SqlTemplateItem[]) => {
  emit('sql-selection-change', items);
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
