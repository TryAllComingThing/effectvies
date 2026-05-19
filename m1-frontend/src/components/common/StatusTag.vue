<template>
  <el-tag :type="type" effect="light">{{ text }}</el-tag>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{ status: string }>();

const type = computed(() => {
  if (['success', 'done', 'approved', 'enabled'].includes(props.status)) {
    return 'success';
  }
  if (['fail', 'rejected', 'disabled'].includes(props.status)) {
    return 'danger';
  }
  if (['running', 'parsing'].includes(props.status)) {
    return 'warning';
  }
  return 'info';
});

const text = computed(() => {
  const map: Record<string, string> = {
    unparsed: '未解析',
    parsing: '解析中',
    success: '成功',
    fail: '失败',
    pending: '待开始',
    running: '运行中',
    stopped: '已停止',
    done: '已完成',
    approved: '通过',
    rejected: '驳回',
    enabled: '启用',
    disabled: '停用',
  };
  return map[props.status] || props.status;
});
</script>
