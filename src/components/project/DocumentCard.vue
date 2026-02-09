<script setup lang="ts">
import { ref, nextTick } from 'vue';
import { DocumentStatus, type Document } from '@/types/Document';
import { sanitizeIcon } from '@/utils/documentTypeIcons';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Tag from 'primevue/tag';

const props = defineProps<{
  document: Document;
}>();

const emit = defineEmits<{
  click: [doc: Document];
  'save-title': [doc: Document, newTitle: string];
  delete: [doc: Document];
}>();

const editing = ref(false);
const editTitle = ref('');
const editInput = ref<InstanceType<typeof InputText> | null>(null);

function startEdit() {
  editing.value = true;
  editTitle.value = props.document.title;
  nextTick(() => {
    const input = editInput.value?.$el as HTMLInputElement | undefined;
    input?.focus();
    input?.select();
  });
}

function saveEdit() {
  const trimmed = editTitle.value.trim();
  if (trimmed && trimmed !== props.document.title) {
    emit('save-title', props.document, trimmed);
  }
  editing.value = false;
}

function cancelEdit() {
  editing.value = false;
}

function formatDate(date: string): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = String(d.getFullYear()).slice(-2);
  return `${day}.${month}.${year}`;
}

function getStatusSeverity(status: DocumentStatus): "success" | "warn" | "danger" | "secondary" | undefined {
  switch (status) {
    case DocumentStatus.APPROVED:
      return 'success';
    case DocumentStatus.PENDING:
      return 'warn';
    case DocumentStatus.DECLINED:
      return 'danger';
    default:
      return 'secondary';
  }
}
</script>

<template>
  <div
    class="group bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-[10px] p-5 cursor-pointer transition-colors hover:border-[var(--primary-color)]"
    @click="$emit('click', document)"
  >
    <!-- Header -->
    <div class="flex items-start justify-between gap-2 mb-3">
      <div class="flex items-center gap-2 min-w-0 flex-1">
        <i :class="'pi ' + sanitizeIcon(document.documentType?.meta?.icon)" class="text-lg text-[var(--text-secondary)] shrink-0"></i>
        <template v-if="editing">
          <InputText
            ref="editInput"
            v-model="editTitle"
            size="small"
            class="w-full text-[15px]"
            @click.stop
            @keydown.enter="saveEdit"
            @keydown.escape="cancelEdit"
            @blur="saveEdit"
          />
        </template>
        <h3 v-else class="text-[15px] font-semibold text-[var(--text-color)] m-0 group-hover:text-[var(--primary-color)] transition-colors truncate">
          {{ document.title }}
        </h3>
      </div>
      <div class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <Button
          v-if="!editing"
          icon="pi pi-pencil"
          text
          rounded
          size="small"
          aria-label="Edit"
          @click.stop="startEdit"
        />
        <Button
          icon="pi pi-trash"
          text
          rounded
          size="small"
          severity="danger"
          aria-label="Delete"
          @click.stop="$emit('delete', document)"
        />
      </div>
    </div>

    <!-- Description -->
    <p class="text-[13px] text-[var(--text-secondary)] m-0 mb-4 line-clamp-2 min-h-[2.6em]">
      {{ document.description || document.documentType?.name || '—' }}
    </p>

    <!-- Footer -->
    <div class="flex items-center gap-3 text-xs">
      <Tag :value="document.status" :severity="getStatusSeverity(document.status)" />
      <span v-if="document.currentVersion" class="text-[var(--text-secondary)] font-medium">
        v{{ document.currentVersion.version }}
      </span>
      <span v-if="document.currentVersion" class="text-[var(--text-secondary)]">
        {{ formatDate(document.currentVersion.uploadedAt) }}
      </span>
    </div>
  </div>
</template>
