<!-- src/views/NotFoundView.vue -->
<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
  <div class="flex items-center justify-center min-h-[70vh] text-center">
    <div class="max-w-[500px] p-8">
      <div class="text-[5rem] font-bold text-[var(--primary-color)] mb-4">404</div>
      <h1 class="mb-4 text-[var(--secondary-color)]">{{ $t('notFound.heading') }}</h1>
      <p class="mb-8 text-gray-500">{{ $t('notFound.message') }}</p>
      <router-link to="/" class="inline-block bg-[var(--primary-color)] text-white py-3 px-6 rounded-sm no-underline font-semibold transition-colors duration-300 hover:bg-[#2980b9]">{{ $t('notFound.goHome') }}</router-link>
    </div>
  </div>
</template>
