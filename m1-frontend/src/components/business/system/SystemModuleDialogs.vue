<template>
  <el-dialog v-model="viewDialogVisible" :title="`${moduleTitle}详情`" width="560px">
    <el-descriptions :column="1" border>
      <el-descriptions-item v-for="item in viewData" :key="item.label" :label="item.label">
        {{ item.value }}
      </el-descriptions-item>
    </el-descriptions>
    <template #footer>
      <el-button type="primary" @click="viewDialogVisible = false">关闭</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="editDialogVisible" :title="editMode === 'create' ? `新增${moduleTitle}` : `编辑${moduleTitle}`" width="620px">
    <el-form :model="editForm" label-width="96px">
      <el-form-item v-for="field in editFields" :key="field.key" :label="field.label">
        <el-select v-if="field.type === 'select'" v-model="editForm[field.key]" style="width: 100%">
          <el-option v-for="option in field.options || []" :key="option.value" :label="option.label" :value="option.value" />
        </el-select>
        <el-input v-else v-model="editForm[field.key]" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="editDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="$emit('submitEdit')">保存</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="deleteDialogVisible" title="删除确认" width="420px">
    <div>确认删除当前记录吗？</div>
    <template #footer>
      <el-button @click="deleteDialogVisible = false">取消</el-button>
      <el-button type="primary" @click="$emit('runDelete')">确认</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="dictDataDialogVisible" :title="`字典条目 - ${dictDataTitle}`" width="86%" class="dict-data-dialog">
    <template #header>
      <div class="dict-data-head">
        <span>字典条目 - {{ dictDataTitle }}</span>
        <el-space>
          <el-button type="primary" @click="$emit('openDictDataCreate')"><ActionIcon name="Plus" />新增条目</el-button>
          <el-button type="danger" plain @click="$emit('confirmDelete')">删除</el-button>
        </el-space>
      </div>
    </template>
    <el-table :data="dictDataRows" size="small" class="dict-data-table">
      <el-table-column type="selection" width="45" />
      <el-table-column prop="dictCode" label="字典编码" width="120" />
      <el-table-column prop="dictLabel" label="字典标签" min-width="140" />
      <el-table-column prop="dictValue" label="字典值" width="120" />
      <el-table-column prop="sort" label="排序" width="100" />
      <el-table-column label="状态" width="100">
        <template #default="scope"><StatusTag :status="scope.row.status" /></template>
      </el-table-column>
      <el-table-column prop="remark" label="备注" min-width="140" />
      <el-table-column prop="createdAt" label="创建时间" width="170" />
      <el-table-column label="操作" width="180" fixed="right">
        <template #default="scope">
          <el-space>
            <el-button text type="primary" size="small" @click="$emit('openDictDataEdit', scope.row)">
              <ActionIcon name="Pencil" />编辑
            </el-button>
            <el-button text type="danger" size="small" @click="$emit('confirmDelete')">删除</el-button>
          </el-space>
        </template>
      </el-table-column>
    </el-table>
    <div class="pager dict-data-pager">
      <el-pagination :total="dictDataRows.length" layout="total, sizes, prev, pager, next" :page-sizes="[10, 20, 50]" />
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ActionIcon from '@/components/common/ActionIcon.vue';
import StatusTag from '@/components/common/StatusTag.vue';
import type { DictDataRow, EditField, ViewDataItem } from '@/types/system-module';

const props = defineProps<{
  moduleTitle: string;
  viewVisible: boolean;
  viewData: ViewDataItem[];
  editVisible: boolean;
  editMode: 'create' | 'edit';
  editForm: Record<string, string>;
  editFields: EditField[];
  deleteVisible: boolean;
  dictDataVisible: boolean;
  dictDataTitle: string;
  dictDataRows: DictDataRow[];
}>();

const emit = defineEmits<{
  (event: 'update:viewVisible', value: boolean): void;
  (event: 'update:editVisible', value: boolean): void;
  (event: 'update:deleteVisible', value: boolean): void;
  (event: 'update:dictDataVisible', value: boolean): void;
  (event: 'submitEdit'): void;
  (event: 'runDelete'): void;
  (event: 'confirmDelete'): void;
  (event: 'openDictDataCreate'): void;
  (event: 'openDictDataEdit', row: Record<string, unknown>): void;
}>();

const viewDialogVisible = computed({
  get: () => props.viewVisible,
  set: (value: boolean) => emit('update:viewVisible', value),
});

const editDialogVisible = computed({
  get: () => props.editVisible,
  set: (value: boolean) => emit('update:editVisible', value),
});

const deleteDialogVisible = computed({
  get: () => props.deleteVisible,
  set: (value: boolean) => emit('update:deleteVisible', value),
});

const dictDataDialogVisible = computed({
  get: () => props.dictDataVisible,
  set: (value: boolean) => emit('update:dictDataVisible', value),
});
</script>

<style scoped>
.dict-data-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.dict-data-dialog :deep(.el-dialog) {
  overflow: hidden;
}

.dict-data-dialog :deep(.el-dialog__header) {
  padding: 14px 16px;
  border-bottom: 1px solid #eef1f6;
  background: #fafcff;
}

.dict-data-dialog :deep(.el-dialog__body) {
  padding: 12px 16px 14px;
}

.dict-data-dialog :deep(.el-button) {
  height: 30px;
  font-size: 13px;
  padding: 0 12px;
  font-weight: 400;
}

.dict-data-table :deep(.el-table__header th) {
  font-size: 13px;
  color: #4b5565;
  background: #f8faff;
}

.dict-data-table :deep(.el-table__row td) {
  font-size: 13px;
}

.dict-data-pager {
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid #f0f2f5;
}
</style>
