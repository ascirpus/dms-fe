<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Textarea from 'primevue/textarea';

const { t } = useI18n();

const visible = defineModel<boolean>('visible', { required: true });

interface Props {
  loading?: boolean;
}

withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<{
  confirm: [comment: string | undefined];
}>();

const comment = ref('');

function onConfirm() {
  emit('confirm', comment.value.trim() || undefined);
  comment.value = '';
}

function onCancel() {
  visible.value = false;
  comment.value = '';
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    :header="t('documentViewer.declineDialogHeader')"
    modal
    :style="{ width: '450px' }"
  >
    <div class="flex flex-col gap-3 py-2">
      <p class="text-sm text-[var(--text-secondary)] m-0">
        {{ t('documentViewer.declineDialogMessage') }}
      </p>
      <Textarea
        v-model="comment"
        :placeholder="t('documentViewer.declineComment')"
        rows="3"
        class="w-full"
      />
    </div>
    <template #footer>
      <Button :label="t('common.cancel')" text @click="onCancel" />
      <Button
        :label="t('documentViewer.confirmDecline')"
        severity="danger"
        :loading="loading"
        @click="onConfirm"
      />
    </template>
  </Dialog>
</template>
