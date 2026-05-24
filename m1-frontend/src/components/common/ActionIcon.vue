<template>
  <el-icon class="action-icon"><component :is="iconComp" /></el-icon>
</template>

<script setup lang="ts">
import * as LucideIcons from 'lucide-vue-next';
import { computed } from 'vue';

const props = defineProps<{ name: string }>();
const iconComp = computed(() => (LucideIcons as Record<string, unknown>)[props.name] || LucideIcons.Circle);
</script>

<style scoped>
.action-icon {
  display: inline-flex;
  vertical-align: middle;
  margin-right: 4px;
}
</style>
