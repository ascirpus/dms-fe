<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { useInvites } from '@/composables/useInvites';
import { useWorkspace } from '@/composables/useWorkspace';
import { UsersService, type TenantUser } from '@/services/UsersService';
import { useAuth } from '@/composables/useAuth';
import type { TenantInvite, TenantRole } from '@/types';

import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import ProgressSpinner from 'primevue/progressspinner';
import Tag from 'primevue/tag';

const toast = useToast();
const confirm = useConfirm();
const { apiClient } = useAuth();
const { currentWorkspaceName } = useWorkspace();
const {
  pendingInvites,
  fetchPendingInvites,
  createInvite,
  cancelInvite,
} = useInvites();

const usersService = new UsersService(apiClient);

const members = ref<TenantUser[]>([]);
const loadingMembers = ref(true);
const loadingInvites = ref(true);

const showInviteDialog = ref(false);
const inviteForm = reactive({
  email: '',
  role: 'MEMBER' as TenantRole,
});
const isInviting = ref(false);

const lastCreatedInvite = ref<TenantInvite | null>(null);
const showLinkDialog = ref(false);
const linkCopied = ref(false);

const roleOptions = [
  { label: 'Member', value: 'MEMBER' },
  { label: 'Admin', value: 'ADMIN' },
];

const inviteLink = computed(() => {
  if (!lastCreatedInvite.value) return '';
  const invite = lastCreatedInvite.value;
  const params = new URLSearchParams({
    email: invite.email,
    workspace: currentWorkspaceName.value,
  });
  return `${window.location.origin}/invite/${invite.id}?${params.toString()}`;
});

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
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load members', life: 5000 });
  } finally {
    loadingMembers.value = false;
  }

  try {
    await fetchPendingInvites();
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load invites', life: 5000 });
  } finally {
    loadingInvites.value = false;
  }
});

function openInviteDialog() {
  inviteForm.email = '';
  inviteForm.role = 'MEMBER';
  showInviteDialog.value = true;
}

async function submitInvite() {
  if (!inviteForm.email.trim()) return;

  isInviting.value = true;
  try {
    const invite = await createInvite(inviteForm.email.trim(), inviteForm.role);
    showInviteDialog.value = false;
    lastCreatedInvite.value = invite;
    linkCopied.value = false;
    showLinkDialog.value = true;
    toast.add({ severity: 'success', summary: 'Invite Sent', detail: `Invite created for ${inviteForm.email}`, life: 3000 });
  } catch (err: any) {
    const detail = err?.response?.status === 409
      ? 'This email has already been invited'
      : err instanceof Error ? err.message : 'Failed to create invite';
    toast.add({ severity: 'error', summary: 'Error', detail, life: 5000 });
  } finally {
    isInviting.value = false;
  }
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(inviteLink.value);
    linkCopied.value = true;
    toast.add({ severity: 'success', summary: 'Copied', detail: 'Invite link copied to clipboard', life: 2000 });
  } catch {
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to copy link', life: 3000 });
  }
}

function confirmCancelInvite(invite: TenantInvite) {
  confirm.require({
    message: `Cancel the invite for ${invite.email}?`,
    header: 'Cancel Invite',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => handleCancelInvite(invite),
  });
}

async function handleCancelInvite(invite: TenantInvite) {
  try {
    await cancelInvite(invite.id);
    toast.add({ severity: 'success', summary: 'Cancelled', detail: `Invite for ${invite.email} has been cancelled`, life: 3000 });
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Error', detail: err instanceof Error ? err.message : 'Failed to cancel invite', life: 5000 });
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
          label="Invite Member"
          size="small"
          @click="openInviteDialog"
        />
      </div>

      <div v-if="loadingMembers" class="flex items-center justify-center gap-4 p-12 text-[var(--text-secondary)]">
        <ProgressSpinner style="width: 40px; height: 40px" />
        <span>Loading members...</span>
      </div>

      <div v-else class="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-[10px] overflow-hidden">
        <DataTable :value="members" dataKey="userId" stripedRows class="members-table">
          <Column field="firstName" header="Name" sortable style="min-width: 200px">
            <template #body="{ data }">
              <span class="font-medium text-[var(--text-color)]">
                {{ [data.firstName, data.lastName].filter(Boolean).join(' ') || '—' }}
              </span>
            </template>
          </Column>
          <Column field="email" header="Email" sortable style="min-width: 220px" />
          <Column field="role" header="Role" sortable style="min-width: 120px">
            <template #body="{ data }">
              <Tag :value="data.role" :severity="roleSeverity(data.role)" />
            </template>
          </Column>
          <Column field="createdAt" header="Joined" sortable style="min-width: 140px">
            <template #body="{ data }">
              {{ formatDate(data.createdAt) }}
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- Pending Invites Section -->
    <div>
      <h2 class="font-[Inter,sans-serif] font-semibold text-2xl leading-[1.25] text-[var(--text-color)] m-0 mb-4">Pending Invites</h2>

      <div v-if="loadingInvites" class="flex items-center justify-center gap-4 p-12 text-[var(--text-secondary)]">
        <ProgressSpinner style="width: 40px; height: 40px" />
        <span>Loading invites...</span>
      </div>

      <div v-else-if="pendingInvites.length === 0" class="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-[10px] p-8 text-center text-[var(--text-secondary)]">
        <i class="pi pi-inbox text-3xl mb-3 block"></i>
        <p class="m-0">No pending invites</p>
      </div>

      <div v-else class="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-[10px] overflow-hidden">
        <DataTable :value="pendingInvites" dataKey="id" stripedRows class="members-table">
          <Column field="email" header="Email" sortable style="min-width: 220px" />
          <Column field="role" header="Role" sortable style="min-width: 120px">
            <template #body="{ data }">
              <Tag :value="data.role" :severity="roleSeverity(data.role)" />
            </template>
          </Column>
          <Column header="Invited By" style="min-width: 160px">
            <template #body="{ data }">
              {{ formatInviterName(data) }}
            </template>
          </Column>
          <Column field="expiresAt" header="Expires" sortable style="min-width: 140px">
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
                aria-label="Cancel invite"
              />
            </template>
          </Column>
        </DataTable>
      </div>
    </div>

    <!-- Invite Dialog -->
    <Dialog v-model:visible="showInviteDialog" header="Invite Member" modal :style="{ width: '440px' }">
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label for="inviteEmail" class="font-semibold text-sm text-[var(--text-color)]">Email Address</label>
          <InputText
            id="inviteEmail"
            v-model="inviteForm.email"
            type="email"
            placeholder="colleague@company.com"
            class="w-full"
            @keypress.enter="submitInvite"
          />
        </div>
        <div class="flex flex-col gap-2">
          <label for="inviteRole" class="font-semibold text-sm text-[var(--text-color)]">Role</label>
          <Select
            id="inviteRole"
            v-model="inviteForm.role"
            :options="roleOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
          />
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-4">
          <Button label="Cancel" text severity="secondary" @click="showInviteDialog = false" />
          <Button
            label="Send Invite"
            icon="pi pi-send"
            @click="submitInvite"
            :disabled="!inviteForm.email.trim()"
            :loading="isInviting"
          />
        </div>
      </template>
    </Dialog>

    <!-- Invite Link Dialog -->
    <Dialog v-model:visible="showLinkDialog" header="Invite Link" modal :style="{ width: '520px' }">
      <div class="flex flex-col gap-4">
        <p class="text-sm text-[var(--text-secondary)] m-0">
          Share this link with <strong>{{ lastCreatedInvite?.email }}</strong> to invite them to the workspace.
        </p>
        <div class="flex gap-2">
          <InputText :model-value="inviteLink" readonly class="w-full font-mono text-xs" />
          <Button
            :icon="linkCopied ? 'pi pi-check' : 'pi pi-copy'"
            :severity="linkCopied ? 'success' : 'secondary'"
            @click="copyLink"
            aria-label="Copy link"
          />
        </div>
      </div>
      <template #footer>
        <Button label="Done" @click="showLinkDialog = false" />
      </template>
    </Dialog>
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
