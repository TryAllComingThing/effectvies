<template>
  <section class="page-card">
    <header class="page-header">
      <div class="page-heading">
        <h2>{{ title }}</h2>
      </div>
      <div v-if="$slots.actions" class="page-actions">
        <slot name="actions" />
      </div>
    </header>
    <slot />
  </section>
</template>

<script setup lang="ts">
defineProps<{ title: string; subtitle?: string }>();
</script>

<style scoped lang="scss">
.page-heading {
  min-width: 0;
}

h2 {
  margin: 0;
  color: #22324a;
  font-size: 22px;
  line-height: 1.2;
}

.page-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 16px;
}

@media (max-width: 900px) {
  h2 {
    font-size: 20px;
  }

  .page-actions {
    width: 100%;
    margin-left: 0;
  }
}
</style>
