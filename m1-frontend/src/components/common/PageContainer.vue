<template>
  <section class="page-card">
    <header class="page-header">
      <div>
        <h2>{{ title }}</h2>
        <p v-if="subtitle">{{ subtitle }}</p>
      </div>
      <slot name="actions" />
    </header>
    <slot />
  </section>
</template>

<script setup lang="ts">
defineProps<{ title: string; subtitle?: string }>();
</script>

<style scoped lang="scss">
h2 {
  margin: 0;
  font-size: 1.05rem;
}

p {
  margin: 0.35rem 0 0;
  font-size: 0.82rem;
  color: var(--color-text-secondary);
}
</style>
