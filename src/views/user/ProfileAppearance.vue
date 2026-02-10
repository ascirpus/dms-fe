<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuth } from '@/composables/useAuth';
import { useMainStore } from '@/stores/mainStore';
import type { ThemeMode } from '@/types';

import SelectButton from 'primevue/selectbutton';

const { t } = useI18n();
const auth = useAuth();
const store = useMainStore();

const themeOptions = computed(() => [
  { label: t('profileAppearance.light'), value: 'light' },
  { label: t('profileAppearance.dark'), value: 'dark' },
  { label: t('profileAppearance.system'), value: 'auto' },
]);

const selectedTheme = computed(() => store.theme);

function onThemeChange(value: ThemeMode) {
  if (!value) return;
  store.setTheme(value);
  auth.updateProfile({ themePreference: value });
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <h2 class="font-semibold text-2xl leading-[1.25] text-[var(--text-color)] m-0">{{ $t('profileAppearance.title') }}</h2>
    <div class="flex flex-col gap-2">
      <SelectButton
        :modelValue="selectedTheme"
        :options="themeOptions"
        optionLabel="label"
        optionValue="value"
        @update:modelValue="onThemeChange"
      />
      <p v-if="selectedTheme === 'auto'" class="text-sm text-[var(--text-secondary)] m-0">
        {{ $t('profileAppearance.followsSystem') }}
      </p>
    </div>
  </div>
</template>
