<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useInvites } from '@/composables/useInvites';
import { useWorkspace } from '@/composables/useWorkspace';
import { useToast } from 'primevue/usetoast';
import type { UserPendingInvite } from '@/types';
import Button from 'primevue/button';
import Tag from 'primevue/tag';

const toast = useToast();
const { userPendingInvites, fetchUserPendingInvites, acceptInvite } = useInvites();
const { switchWorkspace } = useWorkspace();

const dismissedIds = ref<Set<string>>(new Set());
const accepting = ref<string | null>(null);
const loaded = ref(false);

const visibleInvites = ref<UserPendingInvite[]>([]);

function updateVisible() {
  visibleInvites.value = userPendingInvites.value.filter(i => !dismissedIds.value.has(i.inviteId));
}

onMounted(async () => {
  try {
    await fetchUserPendingInvites();
    updateVisible();
  } catch {
    // silently fail — banner is non-critical
  } finally {
    loaded.value = true;
  }
});

async function handleAccept(invite: UserPendingInvite) {
  accepting.value = invite.inviteId;
  try {
    await acceptInvite(invite.inviteId);
    visibleInvites.value = visibleInvites.value.filter(i => i.inviteId !== invite.inviteId);
    toast.add({ severity: 'success', summary: 'Joined', detail: `You joined ${invite.tenantName}`, life: 3000 });
    await switchWorkspace(invite.tenantId);
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: err instanceof Error ? err.message : 'Failed to accept invite', life: 5000 });
  } finally {
    accepting.value = null;
  }
}

function dismiss(inviteId: string) {
  dismissedIds.value.add(inviteId);
  visibleInvites.value = visibleInvites.value.filter(i => i.inviteId !== inviteId);
}
</script>

<template>
  <div v-if="loaded && visibleInvites.length > 0" class="flex flex-col gap-2 px-4 py-3">
    <div
      v-for="invite in visibleInvites"
      :key="invite.inviteId"
      class="flex items-center gap-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-3"
    >
      <i class="pi pi-envelope text-[var(--primary-color)]"></i>
      <span class="flex-1 text-sm text-[var(--text-color)]">
        You've been invited to join <strong>{{ invite.tenantName }}</strong>
        <Tag :value="invite.role" severity="info" class="ml-2" />
      </span>
      <Button
        label="Accept"
        size="small"
        @click="handleAccept(invite)"
        :loading="accepting === invite.inviteId"
      />
      <Button
        icon="pi pi-times"
        text
        rounded
        size="small"
        severity="secondary"
        @click="dismiss(invite.inviteId)"
        aria-label="Dismiss"
      />
    </div>
  </div>
</template>
