<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useMainStore } from '@/stores/mainStore';

const { t } = useI18n();

const props = defineProps<{
  size?: 'sm' | 'md' | 'lg'
  showTagline?: boolean
}>();

const mainStore = useMainStore();

const resolvedSize = computed(() => props.size ?? 'md');

const isDark = computed(() => {
  if (mainStore.theme === 'auto') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return mainStore.theme === 'dark';
});

const logoTextSrc = computed(() =>
  isDark.value ? '/images/logo-text-dark.svg' : '/images/logo-text.svg'
);

const iconWidthClass = computed(() => {
  switch (resolvedSize.value) {
    case 'sm': return 'w-8';
    case 'md': return 'w-[42px]';
    case 'lg': return 'w-[53px]';
  }
});

const textWidthClass = computed(() => {
  switch (resolvedSize.value) {
    case 'sm': return 'w-[60px]';
    case 'md': return 'w-20';
    case 'lg': return 'w-[102px]';
  }
});
</script>

<template>
  <div class="flex items-end gap-2">
    <img src="/images/logo.svg" :alt="$t('logo.altText')" class="block h-auto" :class="iconWidthClass" />
    <img :src="logoTextSrc" alt="CedarStack" class="block h-auto" :class="textWidthClass" />
    <div v-if="showTagline" class="font-['Inter',sans-serif] font-medium text-sm leading-[1.4] text-[var(--text-color)] flex flex-col ml-2">
      <span>{{ $t('logo.intelligent') }}</span>
      <span>{{ $t('logo.documentHub') }}</span>
    </div>
  </div>
</template>
