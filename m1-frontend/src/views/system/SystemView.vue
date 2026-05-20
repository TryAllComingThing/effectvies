<template>
  <SystemModuleContent :module="module" />
</template>

<script setup lang="ts">
import SystemModuleContent from '@/components/business/system/SystemModuleContent.vue';
import type { SystemModuleKey } from '@/types/system-module';

defineProps<{
  module?: SystemModuleKey;
}>();
</script>
