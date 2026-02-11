<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import MarkdownContent from '@/components/base/MarkdownContent.vue';
import { getLegalMarkdown } from '@/content/legal';

const { locale } = useI18n();
const markdown = computed(() => getLegalMarkdown('privacy-policy', locale.value));
</script>

<template>
  <div class="max-w-[800px] mx-auto py-12 px-6 text-[var(--text-color)]">
    <MarkdownContent :source="markdown" />
  </div>
</template>
