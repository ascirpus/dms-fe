<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useTenantFeatures } from '@/composables/useTenantFeatures';
import Tag from 'primevue/tag';

const { t } = useI18n();
const { selfStorageEnabled } = useTenantFeatures();
</script>

<template>
  <div class="flex flex-col">
    <div class="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-[10px] p-6">
      <div class="flex items-start gap-4">
        <div class="flex items-center justify-center w-12 h-12 rounded-lg bg-[var(--surface-ground)]">
          <i class="pi pi-server text-xl text-[var(--text-secondary)]"></i>
        </div>
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-2">
            <h2 class="text-lg font-semibold text-[var(--text-color)] m-0">{{ t('workspaceStorage.title') }}</h2>
            <Tag
              :value="selfStorageEnabled ? t('workspaceStorage.available') : t('workspaceStorage.comingSoon')"
              :severity="selfStorageEnabled ? 'success' : 'info'"
            />
          </div>
          <p class="text-sm text-[var(--text-secondary)] m-0 leading-relaxed">
            {{ t('workspaceStorage.description') }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
