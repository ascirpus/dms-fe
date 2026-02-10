<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { useAuth } from '@/composables/useAuth';
import { useWorkspace } from '@/composables/useWorkspace';
import type { TenantInvite } from '@/types';

import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';

const props = defineProps<{
  visible: boolean;
  invite: TenantInvite | null;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
}>();

const { t } = useI18n();
const toast = useToast();
const { getCurrentTenantId } = useAuth();
const { currentWorkspaceName } = useWorkspace();

const linkCopied = ref(false);

const inviteLink = computed(() => {
  if (!props.invite) return '';
  const params = new URLSearchParams({
    email: props.invite.email,
    tenantId: getCurrentTenantId() ?? '',
    workspace: currentWorkspaceName.value,
  });
  return `${window.location.origin}/invite/${props.invite.id}?${params.toString()}`;
});

async function copyLink() {
  try {
    await navigator.clipboard.writeText(inviteLink.value);
    linkCopied.value = true;
    toast.add({ severity: 'success', summary: t('inviteLinkDialog.copied'), detail: t('inviteLinkDialog.copiedDetail'), life: 2000 });
  } catch {
    toast.add({ severity: 'error', summary: t('common.error'), detail: t('inviteLinkDialog.failedToCopy'), life: 3000 });
  }
}

function close() {
  linkCopied.value = false;
  emit('update:visible', false);
}
</script>

<template>
  <Dialog :visible="visible" @update:visible="emit('update:visible', $event)" :header="$t('inviteLinkDialog.header')" modal :style="{ width: '520px' }">
    <div class="flex flex-col gap-4">
      <i18n-t keypath="inviteLinkDialog.shareLink" tag="p" class="text-sm text-[var(--text-secondary)] m-0">
        <template #email><strong>{{ invite?.email }}</strong></template>
      </i18n-t>
      <div class="flex gap-2">
        <InputText :model-value="inviteLink" readonly class="w-full font-mono text-xs" />
        <Button
          :icon="linkCopied ? 'pi pi-check' : 'pi pi-copy'"
          :severity="linkCopied ? 'success' : 'secondary'"
          @click="copyLink"
          :aria-label="$t('inviteLinkDialog.copyLink')"
        />
      </div>
    </div>
    <template #footer>
      <Button :label="$t('common.done')" @click="close" />
    </template>
  </Dialog>
</template>
