<script setup lang="ts">
import { computed } from 'vue';
import { marked } from 'marked';

const props = defineProps<{
  source: string;
}>();

const html = computed(() => marked.parse(props.source) as string);
</script>

<template>
  <div class="prose-legal" v-html="html" />
</template>

<style scoped>
.prose-legal {
  line-height: 1.75;
}

.prose-legal :deep(h1) {
  font-size: 1.875rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.prose-legal :deep(h2) {
  font-size: 1.25rem;
  font-weight: 600;
  margin-top: 2.5rem;
  margin-bottom: 0.75rem;
  color: var(--text-color);
}

.prose-legal :deep(h3) {
  font-weight: 500;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.prose-legal :deep(p) {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  color: var(--text-color);
}

.prose-legal :deep(h1 + p) {
  color: var(--text-secondary);
  margin-bottom: 2.5rem;
}

.prose-legal :deep(ul) {
  list-style-type: disc;
  padding-left: 1.5rem;
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.prose-legal :deep(a) {
  color: var(--primary-color);
}

.prose-legal :deep(a:hover) {
  text-decoration: underline;
}

.prose-legal :deep(strong) {
  font-weight: 600;
}
</style>
