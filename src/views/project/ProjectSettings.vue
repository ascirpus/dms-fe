<script setup lang="ts">
import { ref, computed, onMounted, reactive, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { FilterMatchMode } from '@primevue/core/api';
import { useAuth } from '@/composables/useAuth';
import { useProjects } from '@/composables/useProjects';
import { useDocumentTypes } from '@/composables/useDocumentTypes';
import { UsersService, type TenantUser } from '@/services/UsersService';
import type { Project } from '@/types/Project';
import type { ApiResponse } from '@/types/response';

// PrimeVue Components
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import Select from 'primevue/select';
import ProgressSpinner from 'primevue/progressspinner';
import TabMenu from 'primevue/tabmenu';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import Paginator from 'primevue/paginator';

// Types
interface UserDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface PartyMetaDTO {
  contactEmail?: string;
  contactPhone?: string;
  vatNumber?: string;
  address?: string;
}

interface PartyDTO {
  id: string;
  name: string;
  description?: string;
  meta: PartyMetaDTO;
  createdAt: string;
}

type PermissionAction = 'VIEW' | 'COMMENT' | 'DECIDE';

interface PartyPermissionsDTO {
  partyId: string;
  permissions: Record<string, PermissionAction>;
}

interface PartyWithMembers {
  party: PartyDTO;
  members: UserDTO[];
}

interface ProjectPartyMembers {
  projectId: string;
  parties: PartyWithMembers[];
}

const route = useRoute();
const router = useRouter();
const toast = useToast();
const confirm = useConfirm();
const auth = useAuth();
const usersApi = new UsersService(auth.apiClient);

const { useResolvedProjectId, fetchProjectById, loading: projectsLoading } = useProjects();
const { documentTypes } = useDocumentTypes();

// Resolve project ID from route
const projectSlug = computed(() => route.params.id as string);
const projectId = useResolvedProjectId(projectSlug);

// Check if project ID is resolved (is a full UUID, not a slug)
const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
const isProjectIdResolved = computed(() => isUUID(projectId.value));

// Tab navigation
const activeTab = ref(0);
const tabItems = [
  { label: 'Details', icon: 'pi pi-file-edit' },
  { label: 'Parties', icon: 'pi pi-users' },
];

// State
const loading = ref(true);
const saving = ref(false);
const project = ref<Project | null>(null);
const parties = ref<PartyWithMembers[]>([]);
const tenantUsers = ref<TenantUser[]>([]);

// Selected party for viewing members
const selectedParty = ref<PartyWithMembers | null>(null);

// Search and filters
const globalFilter = ref('');
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});

// Pagination
const first = ref(0);
const rows = ref(10);

// Edit forms
const projectForm = reactive({
  name: '',
  description: '',
});

// Add party dialog
const showAddPartyDialog = ref(false);
const addPartyForm = reactive({
  name: '',
  description: '',
  vatNumber: '',
  contactEmail: '',
  contactPhone: '',
  address: '',
});

// Edit party dialog
const showEditPartyDialog = ref(false);
const editingParty = ref<PartyWithMembers | null>(null);
const editPartyForm = reactive({
  name: '',
  description: '',
  vatNumber: '',
  contactEmail: '',
  contactPhone: '',
  address: '',
});
const editPartyPermissions = ref<Record<string, PermissionAction | ''>>({});

// Party permissions
const partyPermissions = ref<Map<string, Record<string, PermissionAction>>>(new Map());

const permissionOptions = [
  { label: 'None', value: '' },
  { label: 'View', value: 'VIEW' },
  { label: 'Comment', value: 'COMMENT' },
  { label: 'Decide', value: 'DECIDE' },
];

// Add member dialog
const showAddMemberDialog = ref(false);
const addMemberParty = ref<PartyWithMembers | null>(null);
const selectedUser = ref<(TenantUser & { displayName: string }) | null>(null);

// Current user
const currentUserId = computed(() => {
  return (auth.decodedToken.value as Record<string, unknown> | null)?.sub as string | undefined;
});

// Helper to get display name
function getUserDisplayName(user: { firstName?: string; lastName?: string; email: string }): string {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return fullName || user.email;
}

// Get all members across all parties (for the main members view)
const allMembers = computed(() => {
  const membersMap = new Map<string, UserDTO & { partyName: string; partyId: string }>();

  for (const pw of parties.value) {
    for (const member of pw.members) {
      if (!membersMap.has(member.id)) {
        membersMap.set(member.id, {
          ...member,
          partyName: pw.party.name,
          partyId: pw.party.id,
        });
      }
    }
  }

  return Array.from(membersMap.values());
});

// Get members for selected party or all
const displayedMembers = computed(() => {
  if (selectedParty.value) {
    return selectedParty.value.members.map(m => ({
      ...m,
      partyName: selectedParty.value!.party.name,
      partyId: selectedParty.value!.party.id,
    }));
  }
  return allMembers.value;
});

// Get available users (not already members)
const availableUsers = computed(() => {
  const memberIds = allMembers.value.map(m => m.id);
  return tenantUsers.value
    .filter(u => !memberIds.includes(u.userId))
    .map(u => ({
      ...u,
      displayName: getUserDisplayName(u),
    }));
});

// Fetch project
async function fetchProject() {
  if (!projectId.value) return;

  try {
    project.value = await fetchProjectById(projectId.value);
    if (project.value) {
      projectForm.name = project.value.name;
      projectForm.description = project.value.description || '';
    }
  } catch (err) {
    console.error('Failed to fetch project:', err);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load project',
      life: 3000,
    });
  }
}

// Fetch parties with members
async function fetchParties() {
  if (!projectId.value) return;

  try {
    const response = await auth.apiClient.get<ApiResponse<ProjectPartyMembers>>(
      `/api/projects/${projectId.value}/party`
    );
    parties.value = response.data.data.parties;

    // Select first party by default if available
    if (parties.value.length > 0 && !selectedParty.value) {
      selectedParty.value = parties.value[0];
    }
  } catch (err) {
    console.error('Failed to fetch parties:', err);
    parties.value = [];
  }
}

// Fetch tenant users
async function fetchTenantUsers() {
  try {
    tenantUsers.value = await usersApi.fetchTenantUsers();
  } catch (err) {
    console.error('Failed to fetch tenant users:', err);
    tenantUsers.value = [];
  }
}

// Fetch party permissions
async function fetchPartyPermissions() {
  if (!projectId.value) return;

  try {
    const response = await auth.apiClient.get<ApiResponse<PartyPermissionsDTO[]>>(
      `/api/projects/${projectId.value}/party/permissions`
    );
    const map = new Map<string, Record<string, PermissionAction>>();
    for (const pp of response.data.data) {
      map.set(pp.partyId, pp.permissions);
    }
    partyPermissions.value = map;
  } catch (err) {
    console.error('Failed to fetch party permissions:', err);
  }
}

// Check if a party has any metadata
function hasPartyMeta(meta?: PartyMetaDTO): boolean {
  if (!meta) return false;
  return !!(meta.vatNumber || meta.contactEmail || meta.contactPhone || meta.address);
}

// Get permission count for a party
function getPermissionCount(partyId: string): number {
  const perms = partyPermissions.value.get(partyId);
  return perms ? Object.keys(perms).length : 0;
}

// Open edit party dialog
function openEditPartyDialog(pw: PartyWithMembers) {
  editingParty.value = pw;
  editPartyForm.name = pw.party.name;
  editPartyForm.description = pw.party.description || '';
  editPartyForm.vatNumber = pw.party.meta?.vatNumber || '';
  editPartyForm.contactEmail = pw.party.meta?.contactEmail || '';
  editPartyForm.contactPhone = pw.party.meta?.contactPhone || '';
  editPartyForm.address = pw.party.meta?.address || '';

  // Populate permissions for this party
  const currentPerms = partyPermissions.value.get(pw.party.id) || {};
  const permsMap: Record<string, PermissionAction | ''> = {};
  for (const dt of (documentTypes.value || [])) {
    permsMap[dt.id] = currentPerms[dt.id] || '';
  }
  editPartyPermissions.value = permsMap;

  showEditPartyDialog.value = true;
}

// Save edit party (optimistic, local-only for name/desc/meta since no PUT endpoint)
async function saveEditParty() {
  if (!editingParty.value || !projectId.value) return;

  const partyId = editingParty.value.party.id;
  const pw = parties.value.find(p => p.party.id === partyId);
  if (!pw) return;

  // Update local state optimistically
  pw.party.name = editPartyForm.name;
  pw.party.description = editPartyForm.description || undefined;
  pw.party.meta = {
    vatNumber: editPartyForm.vatNumber || undefined,
    contactEmail: editPartyForm.contactEmail || undefined,
    contactPhone: editPartyForm.contactPhone || undefined,
    address: editPartyForm.address || undefined,
  };

  // Save permissions via API
  const previousPerms = partyPermissions.value.get(partyId) || {};
  const newPerms: Record<string, PermissionAction> = {};
  for (const [dtId, action] of Object.entries(editPartyPermissions.value)) {
    if (action) {
      newPerms[dtId] = action;
    }
  }

  // Update permissions optimistically
  if (Object.keys(newPerms).length > 0) {
    partyPermissions.value.set(partyId, newPerms);
  } else {
    partyPermissions.value.delete(partyId);
  }

  showEditPartyDialog.value = false;
  editingParty.value = null;

  // Check if permissions changed
  const permsChanged =
    JSON.stringify(previousPerms) !== JSON.stringify(newPerms);

  if (permsChanged) {
    try {
      if (Object.keys(newPerms).length === 0 && Object.keys(previousPerms).length > 0) {
        await auth.apiClient.delete(
          `/api/projects/${projectId.value}/party/${partyId}/permission`
        );
      } else if (Object.keys(newPerms).length > 0) {
        await auth.apiClient.post(
          `/api/projects/${projectId.value}/party/${partyId}/permission`,
          { permissions: newPerms }
        );
      }
    } catch (err) {
      console.error('Failed to save permissions:', err);
      // Roll back permissions
      if (Object.keys(previousPerms).length > 0) {
        partyPermissions.value.set(partyId, previousPerms);
      } else {
        partyPermissions.value.delete(partyId);
      }
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to save permissions',
        life: 3000,
      });
      return;
    }
  }

  console.warn('Party name/description/meta update: no PUT endpoint available yet. Changes are local only.');
  toast.add({
    severity: 'success',
    summary: 'Party Updated',
    detail: permsChanged
      ? 'Party details and permissions have been updated'
      : 'Party details updated locally (backend sync coming soon)',
    life: 3000,
  });
}

// Load all data
async function loadData() {
  if (!isProjectIdResolved.value) return;

  loading.value = true;
  await Promise.all([
    fetchProject(),
    fetchParties(),
    fetchTenantUsers(),
    fetchPartyPermissions(),
  ]);
  loading.value = false;
}

// Watch for project ID to be resolved to a full UUID
watch(isProjectIdResolved, (resolved) => {
  if (resolved) {
    loadData();
  }
});

// Save project details
async function saveProjectDetails() {
  if (!projectId.value) return;

  saving.value = true;
  try {
    // TODO: API endpoint for updating project details not available yet
    toast.add({
      severity: 'info',
      summary: 'Coming Soon',
      detail: 'Project editing will be available soon',
      life: 3000,
    });
  } catch (err) {
    console.error('Failed to save project:', err);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to save project',
      life: 3000,
    });
  } finally {
    saving.value = false;
  }
}

// Clear filters
function clearFilters() {
  globalFilter.value = '';
  filters.value.global.value = null;
}

// Add party (optimistic)
async function addParty() {
  if (!projectId.value || !addPartyForm.name.trim()) return;

  const partyName = addPartyForm.name;
  const partyDescription = addPartyForm.description;
  const meta: PartyMetaDTO = {};
  if (addPartyForm.vatNumber) meta.vatNumber = addPartyForm.vatNumber;
  if (addPartyForm.contactEmail) meta.contactEmail = addPartyForm.contactEmail;
  if (addPartyForm.contactPhone) meta.contactPhone = addPartyForm.contactPhone;
  if (addPartyForm.address) meta.address = addPartyForm.address;

  const tempId = `temp-${Date.now()}`;
  const optimisticParty: PartyWithMembers = {
    party: {
      id: tempId,
      name: partyName,
      description: partyDescription || undefined,
      meta,
      createdAt: new Date().toISOString(),
    },
    members: [],
  };

  parties.value.push(optimisticParty);
  showAddPartyDialog.value = false;
  addPartyForm.name = '';
  addPartyForm.description = '';
  addPartyForm.vatNumber = '';
  addPartyForm.contactEmail = '';
  addPartyForm.contactPhone = '';
  addPartyForm.address = '';

  toast.add({
    severity: 'success',
    summary: 'Party Created',
    detail: `Party "${partyName}" has been created`,
    life: 3000,
  });

  try {
    const requestBody: Record<string, unknown> = { name: partyName, description: partyDescription };
    if (Object.keys(meta).length > 0) {
      requestBody.meta = meta;
    }
    const response = await auth.apiClient.post<ApiResponse<PartyDTO>>(
      `/api/projects/${projectId.value}/party`,
      requestBody
    );
    const created = parties.value.find(p => p.party.id === tempId);
    if (created) {
      created.party.id = response.data.data.id;
    }
  } catch (err) {
    console.error('Failed to create party:', err);
    parties.value = parties.value.filter(p => p.party.id !== tempId);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to create party',
      life: 3000,
    });
  }
}

// Delete party
function confirmDeleteParty(party: PartyWithMembers) {
  confirm.require({
    message: `Are you sure you want to delete the party "${party.party.name}"?`,
    header: 'Delete Party',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => deleteParty(party.party.id),
  });
}

async function deleteParty(partyId: string) {
  if (!projectId.value) return;

  const partyIndex = parties.value.findIndex(p => p.party.id === partyId);
  if (partyIndex === -1) return;

  const removedParty = parties.value[partyIndex];

  parties.value.splice(partyIndex, 1);

  if (selectedParty.value?.party.id === partyId) {
    selectedParty.value = parties.value.length > 0 ? parties.value[0] : null;
  }

  toast.add({
    severity: 'success',
    summary: 'Party Deleted',
    detail: 'Party has been deleted',
    life: 3000,
  });

  try {
    await auth.apiClient.delete(`/api/projects/${projectId.value}/party/${partyId}`);
  } catch (err) {
    console.error('Failed to delete party:', err);
    parties.value.splice(partyIndex, 0, removedParty);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to delete party',
      life: 3000,
    });
  }
}

// Open add member dialog
function openAddMemberDialog() {
  addMemberParty.value = selectedParty.value ?? null;
  selectedUser.value = null;
  showAddMemberDialog.value = true;
}

// Add member to party (optimistic)
async function addMemberToParty() {
  if (!projectId.value || !addMemberParty.value || !selectedUser.value) return;

  const user = selectedUser.value;
  const party = parties.value.find(p => p.party.id === addMemberParty.value!.party.id);
  if (!party) return;

  const newMember: UserDTO = {
    id: user.userId,
    email: user.email,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
  };

  party.members.push(newMember);
  showAddMemberDialog.value = false;
  selectedUser.value = null;

  toast.add({
    severity: 'success',
    summary: 'Member Added',
    detail: `${getUserDisplayName(user)} has been added`,
    life: 3000,
  });

  try {
    await auth.apiClient.post(
      `/api/projects/${projectId.value}/party/${party.party.id}/members`,
      { user_id: user.userId }
    );
  } catch (err) {
    console.error('Failed to add member:', err);
    party.members = party.members.filter(m => m.id !== newMember.id);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to add member',
      life: 3000,
    });
  }
}

// Remove member
function confirmRemoveMember(member: UserDTO & { partyId: string }) {
  if (member.id === currentUserId.value) {
    toast.add({
      severity: 'warn',
      summary: 'Cannot Remove',
      detail: 'You cannot remove yourself',
      life: 3000,
    });
    return;
  }

  confirm.require({
    message: `Are you sure you want to remove ${getUserDisplayName(member)}?`,
    header: 'Remove Member',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => removeMember(member.partyId, member.id),
  });
}

async function removeMember(partyId: string, memberId: string) {
  if (!projectId.value) return;

  const party = parties.value.find(p => p.party.id === partyId);
  if (!party) return;

  const memberIndex = party.members.findIndex(m => m.id === memberId);
  if (memberIndex === -1) return;

  const removedMember = party.members[memberIndex];

  party.members.splice(memberIndex, 1);

  toast.add({
    severity: 'success',
    summary: 'Member Removed',
    detail: 'Member has been removed',
    life: 3000,
  });

  try {
    await auth.apiClient.delete(
      `/api/projects/${projectId.value}/party/${partyId}/members`,
      { data: { user_id: memberId } }
    );
  } catch (err) {
    console.error('Failed to remove member:', err);
    party.members.splice(memberIndex, 0, removedMember);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to remove member',
      life: 3000,
    });
  }
}

function onPageChange(event: { first: number; rows: number }) {
  first.value = event.first;
  rows.value = event.rows;
}

// Navigate back
function goBack() {
  router.push({ name: 'project-details', params: { id: projectSlug.value } });
}

// Load data on mount if project ID is already resolved
onMounted(() => {
  if (isProjectIdResolved.value) {
    loadData();
  }
});
</script>

<template>
  <div class="min-h-screen bg-[var(--surface-ground)]">
    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center gap-4 p-16 text-[var(--text-secondary)]">
      <ProgressSpinner style="width: 50px; height: 50px" />
      <span>Loading project settings...</span>
    </div>

    <template v-else>
      <!-- Tabs -->
      <div class="bg-[var(--surface-card)] border-b border-[var(--surface-border)] px-4">
        <TabMenu v-model:activeIndex="activeTab" :model="tabItems" />
      </div>

      <!-- Details Tab -->
      <div v-if="activeTab === 0" class="p-0">
        <div class="max-w-[600px] p-6">
          <div>
            <h2 class="text-lg font-semibold text-[var(--text-color)] mb-6">Project Details</h2>
          </div>

          <div class="flex flex-col gap-5">
            <div class="flex flex-col gap-2">
              <label for="projectName" class="font-semibold text-sm text-[var(--text-color)]">Project Name</label>
              <InputText
                id="projectName"
                v-model="projectForm.name"
                class="w-full"
                placeholder="Enter project name"
              />
            </div>
            <div class="flex flex-col gap-2">
              <label for="projectDescription" class="font-semibold text-sm text-[var(--text-color)]">Description</label>
              <Textarea
                id="projectDescription"
                v-model="projectForm.description"
                class="w-full"
                rows="4"
                placeholder="Enter project description"
              />
            </div>
            <div class="flex justify-start mt-2">
              <Button
                label="Save Changes"
                icon="pi pi-check"
                :loading="saving"
                @click="saveProjectDetails"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Parties Tab -->
      <div v-if="activeTab === 1" class="p-0">
        <!-- Toolbar -->
        <div class="flex justify-between items-center py-3 px-4 bg-[var(--surface-card)] border-b border-[var(--surface-border)]">
          <div class="flex items-center gap-3">
            <Button
              icon="pi pi-filter-slash"
              label="Clear"
              outlined
              size="small"
              @click="clearFilters"
            />

            <!-- Party selector -->
            <Select
              v-model="selectedParty"
              :options="parties"
              optionLabel="party.name"
              placeholder="All Parties"
              size="small"
              class="min-w-[180px]"
              showClear
            />
          </div>

          <div class="flex items-center gap-3">
            <Button
              label="New Party"
              icon="pi pi-plus"
              size="small"
              outlined
              @click="showAddPartyDialog = true"
            />
            <Button
              label="Add Member"
              icon="pi pi-user-plus"
              size="small"
              :disabled="parties.length === 0"
              @click="openAddMemberDialog"
            />
            <IconField>
              <InputIcon class="pi pi-search" />
              <InputText
                v-model="globalFilter"
                placeholder="Search"
                size="small"
                @input="filters.global.value = globalFilter"
              />
            </IconField>
          </div>
        </div>

        <!-- Members Table -->
        <div class="bg-[var(--surface-card)]">
          <DataTable
            :value="displayedMembers"
            :filters="filters"
            :globalFilterFields="['firstName', 'lastName', 'email']"
            :paginator="true"
            :rows="rows"
            :first="first"
            @page="onPageChange"
            :rowsPerPageOptions="[10, 25, 50]"
            dataKey="id"
            class="border-none"
            :loading="loading"
            stripedRows
          >
            <template #empty>
              <div class="p-12 text-center text-[var(--text-secondary)]">
                <p v-if="selectedParty">No members in this party yet.</p>
                <p v-else>No members found. Create a party and add members.</p>
              </div>
            </template>

            <Column field="firstName" header="Full Name" sortable style="min-width: 200px">
              <template #body="{ data }">
                <div class="flex items-center gap-2">
                  <span
                    class="font-medium"
                    :class="data.id === currentUserId ? 'text-[var(--text-color)]' : 'text-[var(--primary-color)]'"
                  >
                    {{ getUserDisplayName(data) }}
                  </span>
                  <span v-if="data.id === currentUserId" class="text-xs text-[var(--text-secondary)]">(You)</span>
                </div>
              </template>
            </Column>

            <Column field="email" header="Email" sortable style="min-width: 250px" />

            <Column field="partyName" header="Party" sortable style="min-width: 150px">
              <template #body="{ data }">
                <span class="text-[13px] text-[var(--text-secondary)]">{{ data.partyName }}</span>
              </template>
            </Column>

            <Column header="" style="width: 100px" alignFrozen="right">
              <template #body="{ data }">
                <div class="flex justify-end gap-1">
                  <Button
                    v-if="data.id !== currentUserId"
                    icon="pi pi-trash"
                    text
                    rounded
                    severity="danger"
                    size="small"
                    @click="confirmRemoveMember(data)"
                    aria-label="Remove member"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </div>

        <!-- Party Management Section -->
        <div v-if="parties.length > 0" class="py-6 px-4 border-t border-[var(--surface-border)] bg-[var(--surface-card)]">
          <h3 class="text-base font-semibold text-[var(--text-color)] mb-4">Manage Parties</h3>
          <div class="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-3">
            <div v-for="pw in parties" :key="pw.party.id" class="flex justify-between items-start py-3 px-4 bg-[var(--surface-ground)] border border-[var(--surface-border)] rounded-md">
              <div class="flex flex-col gap-1.5 min-w-0 flex-1">
                <div class="flex flex-col gap-0.5">
                  <span class="font-semibold text-[var(--text-color)]">{{ pw.party.name }}</span>
                  <span class="text-[13px] text-[var(--text-secondary)]">{{ pw.members.length }} members</span>
                </div>
                <div v-if="hasPartyMeta(pw.party.meta)" class="flex flex-col gap-0.5 text-xs text-[var(--text-secondary)]">
                  <span v-if="pw.party.meta.vatNumber" class="flex items-center gap-1.5"><i class="pi pi-building text-[11px] w-3.5 text-center" /> {{ pw.party.meta.vatNumber }}</span>
                  <span v-if="pw.party.meta.contactEmail" class="flex items-center gap-1.5"><i class="pi pi-envelope text-[11px] w-3.5 text-center" /> {{ pw.party.meta.contactEmail }}</span>
                  <span v-if="pw.party.meta.contactPhone" class="flex items-center gap-1.5"><i class="pi pi-phone text-[11px] w-3.5 text-center" /> {{ pw.party.meta.contactPhone }}</span>
                  <span v-if="pw.party.meta.address" class="flex items-center gap-1.5"><i class="pi pi-map-marker text-[11px] w-3.5 text-center" /> {{ pw.party.meta.address }}</span>
                </div>
                <div v-if="getPermissionCount(pw.party.id) > 0" class="text-xs text-[var(--text-secondary)]">
                  <span><i class="pi pi-lock text-[11px] mr-1" /> {{ getPermissionCount(pw.party.id) }} document permission{{ getPermissionCount(pw.party.id) !== 1 ? 's' : '' }}</span>
                </div>
              </div>
              <div class="flex flex-col gap-0.5">
                <Button
                  icon="pi pi-pencil"
                  text
                  severity="secondary"
                  size="small"
                  @click="openEditPartyDialog(pw)"
                  aria-label="Edit party"
                />
                <Button
                  icon="pi pi-trash"
                  text
                  severity="danger"
                  size="small"
                  @click="confirmDeleteParty(pw)"
                  aria-label="Delete party"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Add Party Dialog -->
    <Dialog
      v-model:visible="showAddPartyDialog"
      header="New Party"
      :modal="true"
      :style="{ width: '500px' }"
    >
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label for="partyName" class="font-semibold text-sm text-[var(--text-color)]">Party Name</label>
          <InputText
            id="partyName"
            v-model="addPartyForm.name"
            class="w-full"
            placeholder="e.g., Legal Team, Finance"
          />
        </div>
        <div class="flex flex-col gap-2">
          <label for="partyDescription" class="font-semibold text-sm text-[var(--text-color)]">Description (optional)</label>
          <InputText
            id="partyDescription"
            v-model="addPartyForm.description"
            class="w-full"
            placeholder="Brief description"
          />
        </div>
        <div class="font-semibold text-[13px] text-[var(--text-secondary)] uppercase tracking-wide mt-2 pb-1 border-b border-[var(--surface-border)]">Metadata (optional)</div>
        <div class="flex flex-col gap-2">
          <label for="addPartyVat" class="font-semibold text-sm text-[var(--text-color)]">VAT Number</label>
          <InputText
            id="addPartyVat"
            v-model="addPartyForm.vatNumber"
            class="w-full"
            placeholder="VAT number"
          />
        </div>
        <div class="flex flex-col gap-2">
          <label for="addPartyEmail" class="font-semibold text-sm text-[var(--text-color)]">Contact Email</label>
          <InputText
            id="addPartyEmail"
            v-model="addPartyForm.contactEmail"
            class="w-full"
            placeholder="contact@example.com"
          />
        </div>
        <div class="flex flex-col gap-2">
          <label for="addPartyPhone" class="font-semibold text-sm text-[var(--text-color)]">Contact Phone</label>
          <InputText
            id="addPartyPhone"
            v-model="addPartyForm.contactPhone"
            class="w-full"
            placeholder="+1 234 567 890"
          />
        </div>
        <div class="flex flex-col gap-2">
          <label for="addPartyAddress" class="font-semibold text-sm text-[var(--text-color)]">Address</label>
          <InputText
            id="addPartyAddress"
            v-model="addPartyForm.address"
            class="w-full"
            placeholder="Street, City, Country"
          />
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" text @click="showAddPartyDialog = false" />
        <Button
          label="Create Party"
          icon="pi pi-check"
          :loading="saving"
          :disabled="!addPartyForm.name.trim()"
          @click="addParty"
        />
      </template>
    </Dialog>

    <!-- Add Member Dialog -->
    <Dialog
      v-model:visible="showAddMemberDialog"
      header="Add Member"
      :modal="true"
      :style="{ width: '400px' }"
    >
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label for="selectParty" class="font-semibold text-sm text-[var(--text-color)]">Party</label>
          <Select
            id="selectParty"
            v-model="addMemberParty"
            :options="parties"
            optionLabel="party.name"
            placeholder="Select a party"
            class="w-full"
          />
        </div>
        <div class="flex flex-col gap-2">
          <label for="selectUser" class="font-semibold text-sm text-[var(--text-color)]">User</label>
          <Select
            id="selectUser"
            v-model="selectedUser"
            :options="availableUsers"
            optionLabel="displayName"
            placeholder="Select a user"
            class="w-full"
            filter
          />
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" text @click="showAddMemberDialog = false" />
        <Button
          label="Add Member"
          icon="pi pi-user-plus"
          :disabled="!addMemberParty || !selectedUser"
          @click="addMemberToParty"
        />
      </template>
    </Dialog>

    <!-- Edit Party Dialog -->
    <Dialog
      v-model:visible="showEditPartyDialog"
      header="Edit Party"
      :modal="true"
      :style="{ width: '600px' }"
    >
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label for="editPartyName" class="font-semibold text-sm text-[var(--text-color)]">Party Name</label>
          <InputText
            id="editPartyName"
            v-model="editPartyForm.name"
            class="w-full"
          />
        </div>
        <div class="flex flex-col gap-2">
          <label for="editPartyDescription" class="font-semibold text-sm text-[var(--text-color)]">Description</label>
          <InputText
            id="editPartyDescription"
            v-model="editPartyForm.description"
            class="w-full"
            placeholder="Brief description"
          />
        </div>
        <div class="font-semibold text-[13px] text-[var(--text-secondary)] uppercase tracking-wide mt-2 pb-1 border-b border-[var(--surface-border)]">Metadata</div>
        <div class="flex flex-col gap-2">
          <label for="editPartyVat" class="font-semibold text-sm text-[var(--text-color)]">VAT Number</label>
          <InputText
            id="editPartyVat"
            v-model="editPartyForm.vatNumber"
            class="w-full"
            placeholder="VAT number"
          />
        </div>
        <div class="flex flex-col gap-2">
          <label for="editPartyEmail" class="font-semibold text-sm text-[var(--text-color)]">Contact Email</label>
          <InputText
            id="editPartyEmail"
            v-model="editPartyForm.contactEmail"
            class="w-full"
            placeholder="contact@example.com"
          />
        </div>
        <div class="flex flex-col gap-2">
          <label for="editPartyPhone" class="font-semibold text-sm text-[var(--text-color)]">Contact Phone</label>
          <InputText
            id="editPartyPhone"
            v-model="editPartyForm.contactPhone"
            class="w-full"
            placeholder="+1 234 567 890"
          />
        </div>
        <div class="flex flex-col gap-2">
          <label for="editPartyAddress" class="font-semibold text-sm text-[var(--text-color)]">Address</label>
          <InputText
            id="editPartyAddress"
            v-model="editPartyForm.address"
            class="w-full"
            placeholder="Street, City, Country"
          />
        </div>

        <!-- Document Permissions -->
        <div v-if="documentTypes && documentTypes.length > 0" class="font-semibold text-[13px] text-[var(--text-secondary)] uppercase tracking-wide mt-2 pb-1 border-b border-[var(--surface-border)]">Document Permissions</div>
        <div v-if="documentTypes && documentTypes.length > 0" class="flex flex-col gap-2">
          <div v-for="dt in documentTypes" :key="dt.id" class="flex items-center justify-between gap-3">
            <span class="text-sm text-[var(--text-color)] flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{{ dt.name }}</span>
            <Select
              v-model="editPartyPermissions[dt.id]"
              :options="permissionOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="None"
              class="w-[140px] shrink-0"
            />
          </div>
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" text @click="showEditPartyDialog = false" />
        <Button
          label="Save"
          icon="pi pi-check"
          :disabled="!editPartyForm.name.trim()"
          @click="saveEditParty"
        />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
:deep(.p-tabmenu-nav) {
  border: none;
}

:deep(.p-tabmenu-item) {
  margin-right: 8px;
}

:deep(.p-datatable-header) {
  background: var(--surface-card);
  border: none;
  padding: 16px;
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
