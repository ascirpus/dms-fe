<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { useInvites } from '@/composables/useInvites';
import { UsersService, type TenantUser } from '@/services/UsersService';
import { useAuth } from '@/composables/useAuth';
import type { TenantInvite } from '@/types';

import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import ProgressSpinner from 'primevue/progressspinner';
import Tag from 'primevue/tag';

import InviteDialog from '@/components/invite/InviteDialog.vue';
import InviteLinkDialog from '@/components/invite/InviteLinkDialog.vue';

const { t } = useI18n();
const toast = useToast();
const confirm = useConfirm();
const { apiClient } = useAuth();
const {
  pendingInvites,
  fetchPendingInvites,
  cancelInvite,
} = useInvites();

const usersService = new UsersService(apiClient);

const members = ref<TenantUser[]>([]);
const loadingMembers = ref(true);
const loadingInvites = ref(true);

const showInviteDialog = ref(false);
const lastCreatedInvite = ref<TenantInvite | null>(null);
const showLinkDialog = ref(false);

function roleSeverity(role: string): 'info' | 'warn' | 'success' | 'secondary' {
  switch (role) {
    case 'OWNER': return 'warn';
    case 'ADMIN': return 'info';
    default: return 'secondary';
  }
}

onMounted(async () => {
  try {
    members.value = await usersService.fetchTenantUsers();
  } catch {
    toast.add({ severity: 'error', summary: t('common.error'), detail: t('workspaceMembers.failedToLoadMembers'), life: 5000 });
  } finally {
    loadingMembers.value = false;
  }

  try {
    await fetchPendingInvites();
  } catch {
    toast.add({ severity: 'error', summary: t('common.error'), detail: t('workspaceMembers.failedToLoadInvites'), life: 5000 });
  } finally {
    loadingInvites.value = false;
  }
});

function onInviteCreated(invite: TenantInvite) {
  lastCreatedInvite.value = invite;
  showLinkDialog.value = true;
}

function confirmCancelInvite(invite: TenantInvite) {
  confirm.require({
    message: t('workspaceMembers.cancelInviteConfirm', { email: invite.email }),
    header: t('workspaceMembers.cancelInviteHeader'),
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => handleCancelInvite(invite),
  });
}

async function handleCancelInvite(invite: TenantInvite) {
  try {
    await cancelInvite(invite.id);
    toast.add({ severity: 'success', summary: t('workspaceMembers.cancelled'), detail: t('workspaceMembers.cancelledDetail', { email: invite.email }), life: 3000 });
  } catch (err) {
    toast.add({ severity: 'error', summary: t('common.error'), detail: err instanceof Error ? err.message : t('workspaceMembers.failedToCancel'), life: 5000 });
  }
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatInviterName(invite: TenantInvite): string {
  const { firstName, lastName, email } = invite.invitedBy;
  if (firstName || lastName) return [firstName, lastName].filter(Boolean).join(' ');
  return email;
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Members Section -->
    <div>
      <div class="flex items-center justify-end mb-4">
        <Button
          icon="pi pi-user-plus"
          :label="$t('workspaceMembers.inviteMember')"
          size="small"
          @click="showInviteDialog = true"
        />
      </div>

      <div v-if="loadingMembers" class="flex items-center justify-center gap-4 p-12 text-[var(--text-secondary)]">
        <ProgressSpinner style="width: 40px; height: 40px" />
        <span>{{ $t('workspaceMembers.loadingMembers') }}</span>
      </div>

      <div v-else class="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-[10px] overflow-hidden">
        <DataTable :value="members" dataKey="userId" stripedRows class="members-table">
          <Column field="firstName" :header="$t('workspaceMembers.name')" sortable style="min-width: 200px">
            <template #body="{ data }">
              <span class="font-medium text-[var(--text-color)]">
                {{ [data.firstName, data.lastName].filter(Boolean).join(' ') || '—' }}
              </span>
            </template>
          </Column>
          <Column field="email" :header="$t('workspaceMembers.email')" sortable style="min-width: 220px" />
          <Column field="role" :header="$t('workspaceMembers.role')" sortable style="min-width: 120px">
            <template #body="{ data }">
              <Tag :value="data.role" :severity="roleSeverity(data.role)" />
            </template>
          </Column>
          <Column field="createdAt" :header="$t('workspaceMembers.joined')" sortable style="min-width: 140px">
            <template #body="{ data }">
              {{ formatDate(data.createdAt) }}
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- Pending Invites Section -->
    <div>
      <h2 class="font-[Inter,sans-serif] font-semibold text-2xl leading-[1.25] text-[var(--text-color)] m-0 mb-4">{{ $t('workspaceMembers.pendingInvites') }}</h2>

      <div v-if="loadingInvites" class="flex items-center justify-center gap-4 p-12 text-[var(--text-secondary)]">
        <ProgressSpinner style="width: 40px; height: 40px" />
        <span>{{ $t('workspaceMembers.loadingInvites') }}</span>
      </div>

      <div v-else-if="pendingInvites.length === 0" class="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-[10px] p-8 text-center text-[var(--text-secondary)]">
        <i class="pi pi-inbox text-3xl mb-3 block"></i>
        <p class="m-0">{{ $t('workspaceMembers.noPendingInvites') }}</p>
      </div>

      <div v-else class="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-[10px] overflow-hidden">
        <DataTable :value="pendingInvites" dataKey="id" stripedRows class="members-table">
          <Column field="email" :header="$t('workspaceMembers.email')" sortable style="min-width: 220px" />
          <Column field="role" :header="$t('workspaceMembers.role')" sortable style="min-width: 120px">
            <template #body="{ data }">
              <Tag :value="data.role" :severity="roleSeverity(data.role)" />
            </template>
          </Column>
          <Column :header="$t('workspaceMembers.invitedBy')" style="min-width: 160px">
            <template #body="{ data }">
              {{ formatInviterName(data) }}
            </template>
          </Column>
          <Column field="expiresAt" :header="$t('workspaceMembers.expires')" sortable style="min-width: 140px">
            <template #body="{ data }">
              {{ formatDate(data.expiresAt) }}
            </template>
          </Column>
          <Column header="" style="width: 80px" :exportable="false">
            <template #body="{ data }">
              <Button
                icon="pi pi-times"
                text
                rounded
                size="small"
                severity="danger"
                @click="confirmCancelInvite(data)"
                :aria-label="$t('workspaceMembers.cancelInvite')"
              />
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- Invite Dialog (with project assignment support) -->
    <InviteDialog
      v-model:visible="showInviteDialog"
      @created="onInviteCreated"
    />

    <!-- Invite Link Dialog -->
    <InviteLinkDialog
      v-model:visible="showLinkDialog"
      :invite="lastCreatedInvite"
    />
  </div>
</template>

<style scoped>
.members-table {
  border: none;
}

:deep(.p-datatable-thead > tr > th) {
  background: var(--surface-card);
  border-color: var(--surface-border);
  padding: 16px;
  font-weight: 600;
  color: var(--text-color);
}

:deep(.p-datatable-tbody > tr > td) {
  border-color: var(--surface-border);
  padding: 16px;
}

:deep(.p-datatable-tbody > tr:hover) {
  background: var(--surface-hover);
}
</style>
