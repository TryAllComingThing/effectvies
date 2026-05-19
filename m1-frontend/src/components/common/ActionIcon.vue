<template>
  <el-icon style="margin-right: 4px"><component :is="iconComp" /></el-icon>
</template>

<script setup lang="ts">
import * as LucideIcons from 'lucide-vue-next';
import { computed } from 'vue';

const props = defineProps<{ name: string }>();
const iconComp = computed(() => (LucideIcons as Record<string, unknown>)[props.name] || LucideIcons.Circle);
</script>
