<script setup lang="ts">
import { computed } from 'vue';
import Select from 'primevue/select';
import { availableLocales, setLocale, type SupportedLocale, type LocaleMeta } from '@/plugins/i18n';
import { useI18n } from 'vue-i18n';
import { useAuth } from '@/composables/useAuth';

const { locale } = useI18n();
const auth = useAuth();

const selected = computed({
  get: () => availableLocales.find(l => l.code === locale.value) ?? availableLocales[0],
  set: (meta: LocaleMeta) => {
    setLocale(meta.code);
    if (auth.isAuthenticated.value) {
      auth.updateProfile({ locale: meta.code });
    }
  },
});
</script>

<template>
  <Select
    :model-value="selected"
    @update:model-value="selected = $event"
    :options="availableLocales"
    optionLabel="label"
    class="language-switcher"
  >
    <template #value="{ value }">
      <span v-if="value" class="flex items-center gap-1.5 text-xs">
        <span>{{ value.flag }}</span>
        <span>{{ value.label }}</span>
      </span>
    </template>
    <template #option="{ option }">
      <span class="flex items-center gap-2 text-sm">
        <span>{{ option.flag }}</span>
        <span>{{ option.label }}</span>
      </span>
    </template>
  </Select>
</template>

<style scoped>
.language-switcher {
  --p-select-padding-y: 0.25rem;
  --p-select-padding-x: 0.5rem;
}

.language-switcher :deep(.p-select-label) {
  padding: 0.25rem 0.25rem;
  font-size: 0.75rem;
}
</style>
