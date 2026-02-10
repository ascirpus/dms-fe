<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import LanguageSwitcher from '@/components/base/LanguageSwitcher.vue';

const { t } = useI18n();
</script>

<template>
  <footer class="border-t border-solid border-[var(--surface-border)]">
    <div class="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 py-4 px-6 text-sm text-[var(--text-secondary)]">
      <div class="flex items-center gap-4">
        <router-link to="/terms" class="hover:underline text-[var(--text-secondary)]">{{ t('footer.terms') }}</router-link>
        <router-link to="/privacy" class="hover:underline text-[var(--text-secondary)]">{{ t('footer.privacy') }}</router-link>
        <a href="/docs/" class="hover:underline text-[var(--text-secondary)]">{{ t('footer.documentation') }}</a>
      </div>
      <div class="flex items-center gap-4">
        <a href="mailto:support@cedar-stack.com" class="hover:underline text-[var(--text-secondary)]">support@cedar-stack.com</a>
        <LanguageSwitcher />
      </div>
    </div>
  </footer>
</template>
