<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useWorkspace } from '@/composables/useWorkspace';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import FloatLabel from 'primevue/floatlabel';
import { generateWorkspaceName } from '@/utils/workspaceNames';

const { t } = useI18n();
const toast = useToast();
const { createWorkspace } = useWorkspace();

const name = ref('');
const submitting = ref(false);

async function onSubmit() {
  if (!name.value.trim()) return;
  submitting.value = true;
  try {
    await createWorkspace(name.value.trim());
  } catch {
    toast.add({ severity: 'error', summary: t('common.error'), detail: t('createWorkspace.errorCreate'), life: 3000 });
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="max-w-[520px] mx-auto w-full flex flex-col px-3 md:px-0 pt-16">
      <h1 class="font-[Inter,sans-serif] font-semibold text-[32px] leading-[1.25] text-[var(--text-color)] m-0">{{ $t('createWorkspace.title') }}</h1>
      <p class="text-[var(--text-secondary)] text-sm mt-2 mb-8">{{ $t('createWorkspace.subtitle') }}</p>

      <form @submit.prevent="onSubmit" class="flex flex-col gap-6">
        <div class="flex flex-col gap-1.5">
          <FloatLabel variant="on">
            <InputText id="workspace-name" v-model="name" class="w-full" />
            <label for="workspace-name">{{ $t('createWorkspace.workspaceName') }}</label>
          </FloatLabel>
          <button
            type="button"
            class="self-start flex items-center gap-1.5 text-xs text-[var(--primary-color)] hover:text-[var(--primary-dark)] cursor-pointer bg-transparent border-0 p-0 font-medium"
            @click="name = generateWorkspaceName()"
          >
            <i class="pi pi-sparkles text-xs"></i>
            {{ $t('createWorkspace.suggestName') }}
          </button>
        </div>

        <Button
          type="submit"
          :label="$t('createWorkspace.createButton')"
          icon="pi pi-plus"
          :disabled="!name.trim()"
          :loading="submitting"
        />
      </form>
    </div>
  </div>
</template>
