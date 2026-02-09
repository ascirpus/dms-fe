<script setup lang="ts">
import { ref } from 'vue';
import { useWorkspace } from '@/composables/useWorkspace';
import { useToast } from 'primevue/usetoast';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import FloatLabel from 'primevue/floatlabel';

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
    toast.add({ severity: 'error', summary: 'Error', detail: 'Could not create workspace. Please try again.', life: 3000 });
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="flex flex-col h-full">
    <div class="max-w-[520px] mx-auto w-full flex flex-col px-3 md:px-0 pt-16">
      <h1 class="font-[Inter,sans-serif] font-semibold text-[32px] leading-[1.25] text-[var(--text-color)] m-0">Create Workspace</h1>
      <p class="text-[var(--text-secondary)] text-sm mt-2 mb-8">Set up a new workspace for your team.</p>

      <form @submit.prevent="onSubmit" class="flex flex-col gap-6">
        <FloatLabel variant="on">
          <InputText id="workspace-name" v-model="name" class="w-full" />
          <label for="workspace-name">Workspace name</label>
        </FloatLabel>

        <Button
          type="submit"
          label="Create Workspace"
          icon="pi pi-plus"
          :disabled="!name.trim()"
          :loading="submitting"
        />
      </form>
    </div>
  </div>
</template>
