<script setup lang="ts">
import { computed } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { useMainStore } from '@/stores/mainStore';
import type { ThemeMode } from '@/types';

import SelectButton from 'primevue/selectbutton';

const auth = useAuth();
const store = useMainStore();

const themeOptions = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'System', value: 'auto' },
];

const selectedTheme = computed(() => store.theme);

function onThemeChange(value: ThemeMode) {
  if (!value) return;
  store.setTheme(value);
  auth.updateProfile({ themePreference: value });
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <h2 class="font-semibold text-2xl leading-[1.25] text-[var(--text-color)] m-0">Appearance</h2>
    <div class="flex flex-col gap-2">
      <SelectButton
        :modelValue="selectedTheme"
        :options="themeOptions"
        optionLabel="label"
        optionValue="value"
        @update:modelValue="onThemeChange"
      />
      <p v-if="selectedTheme === 'auto'" class="text-sm text-[var(--text-secondary)] m-0">
        Follows your operating system preference
      </p>
    </div>
  </div>
</template>
