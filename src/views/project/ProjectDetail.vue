<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { FilterMatchMode } from '@primevue/core/api';
import { useAuth } from '@/composables/useAuth';
import type { Project } from '@/types/Project';
import { DocumentStatus, type Document } from '@/types/Document';
import type { ApiResponse } from '@/types/response';
import { UsersService, type TenantUser } from '@/services/UsersService';

// PrimeVue Components
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import InputIcon from 'primevue/inputicon';
import IconField from 'primevue/iconfield';
import Paginator from 'primevue/paginator';
import Popover from 'primevue/popover';
import ToggleSwitch from 'primevue/toggleswitch';
import Dialog from 'primevue/dialog';
import Select from 'primevue/select';
import Tag from 'primevue/tag';
import FloatLabel from 'primevue/floatlabel';
import ProgressSpinner from 'primevue/progressspinner';
import FileUpload from 'primevue/fileupload';
import SelectButton from 'primevue/selectbutton';
import Divider from 'primevue/divider';
import Drawer from 'primevue/drawer';
import Accordion from 'primevue/accordion';
import AccordionPanel from 'primevue/accordionpanel';
import AccordionHeader from 'primevue/accordionheader';
import AccordionContent from 'primevue/accordioncontent';

import { useProjects, useProjectDocuments } from "@/composables/useProjects";
import { useDocumentTypes } from "@/composables/useDocumentTypes";
import { sanitizeIcon } from "@/utils/documentTypeIcons";
import { useMainStore } from "@/stores/mainStore";
import DocumentCard from "@/components/project/DocumentCard.vue";
import type { DocumentViewMode } from "@/types";

const route = useRoute();
const router = useRouter();
const toast = useToast();
const confirm = useConfirm();
const auth = useAuth();
const usersApi = new UsersService(auth.apiClient);

const { useResolvedProjectId, fetchProjectById, getProjectUrl, loading: projectsLoading } = useProjects();

const projectSlug = computed(() => route.params.id as string);
const projectId = useResolvedProjectId(projectSlug);

const {
  documents,
  loading: documentsLoading,
  getDocumentUrl,
  uploadDocument,
} = useProjectDocuments(() => projectId.value);

// --- Project state ---
const loading = ref(true);
const error = ref<string | null>(null);
const project = ref<Project | null>(null);

// --- Inline editing: project name ---
const editingName = ref(false);
const editNameValue = ref('');
const nameInput = ref<InstanceType<typeof InputText> | null>(null);

function startEditName() {
  editNameValue.value = project.value?.name ?? '';
  editingName.value = true;
  nextTick(() => {
    const el = nameInput.value?.$el as HTMLInputElement | undefined;
    el?.focus();
    el?.select();
  });
}

function saveEditName() {
  const trimmed = editNameValue.value.trim();
  if (!trimmed || trimmed === project.value?.name) {
    editingName.value = false;
    return;
  }
  editingName.value = false;
  toast.add({
    severity: 'info',
    summary: 'Coming Soon',
    detail: 'Project name editing will be available soon',
    life: 3000,
  });
}

function cancelEditName() {
  editingName.value = false;
}

// --- Inline editing: project description ---
const editingDescription = ref(false);
const editDescriptionValue = ref('');
const descriptionInput = ref<InstanceType<typeof Textarea> | null>(null);

function startEditDescription() {
  editDescriptionValue.value = project.value?.description ?? '';
  editingDescription.value = true;
  nextTick(() => {
    const el = descriptionInput.value?.$el as HTMLTextAreaElement | undefined;
    el?.focus();
  });
}

function saveEditDescription() {
  const trimmed = editDescriptionValue.value.trim();
  if (trimmed === (project.value?.description ?? '')) {
    editingDescription.value = false;
    return;
  }
  editingDescription.value = false;
  toast.add({
    severity: 'info',
    summary: 'Coming Soon',
    detail: 'Project description editing will be available soon',
    life: 3000,
  });
}

function cancelEditDescription() {
  editingDescription.value = false;
}

// --- Inline editing: document name (table view) ---
const editingDocId = ref<string | null>(null);
const editDocTitle = ref('');
const docTitleInput = ref<InstanceType<typeof InputText> | null>(null);

function startEditDocTitle(doc: Document) {
  editingDocId.value = doc.id;
  editDocTitle.value = doc.title;
  nextTick(() => {
    const el = docTitleInput.value?.$el as HTMLInputElement | undefined;
    el?.focus();
    el?.select();
  });
}

function saveEditDocTitle(doc: Document) {
  const trimmed = editDocTitle.value.trim();
  if (trimmed && trimmed !== doc.title) {
    const index = documents.value.findIndex(d => d.id === doc.id);
    if (index !== -1) {
      documents.value[index] = { ...documents.value[index], title: trimmed };
    }
    toast.add({
      severity: 'success',
      summary: 'Document Updated',
      detail: 'Document name has been updated.',
      life: 3000,
    });
  }
  editingDocId.value = null;
}

function cancelEditDocTitle() {
  editingDocId.value = null;
}

// Save title from DocumentCard (tile view)
function onCardSaveTitle(doc: Document, newTitle: string) {
  const index = documents.value.findIndex(d => d.id === doc.id);
  if (index !== -1) {
    documents.value[index] = { ...documents.value[index], title: newTitle };
  }
  toast.add({
    severity: 'success',
    summary: 'Document Updated',
    detail: 'Document name has been updated.',
    life: 3000,
  });
}

// --- Settings popover (column visibility) ---
const settingsPopover = ref();
const columnSettings = reactive({
  documentType: true,
  documentName: true,
  modifiedDate: true,
  status: true,
  version: true,
});

// --- Search and filters ---
const globalFilter = ref('');
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  status: { value: null, matchMode: FilterMatchMode.EQUALS },
});

const statusOptions = [
  { label: 'All', value: null },
  { label: 'Pending', value: DocumentStatus.PENDING },
  { label: 'Approved', value: DocumentStatus.APPROVED },
  { label: 'Declined', value: DocumentStatus.DECLINED },
];

// --- Pagination ---
const first = ref(0);
const rows = ref(10);

// --- Upload dialog ---
const showUploadDialog = ref(false);
const uploading = ref(false);
const uploadForm = reactive({
  title: '',
  documentType: '' as string,
  file: null as File | null,
});

// --- Document types ---
const { documentTypes } = useDocumentTypes();
const documentTypeOptions = computed(() =>
  (documentTypes.value ?? []).map(dt => ({ label: dt.name, value: dt.id }))
);

// --- View mode ---
const mainStore = useMainStore();
const viewMode = computed<DocumentViewMode>({
  get: () => mainStore.documentViewMode,
  set: (val) => mainStore.setDocumentViewMode(val),
});

const viewModeOptions = [
  { icon: 'pi pi-th-large', value: 'tiles' },
  { icon: 'pi pi-list', value: 'table' },
];

// --- Filtered documents ---
const filteredDocuments = computed(() => {
  let docs = documents.value ?? [];
  const statusFilter = filters.value.status.value;
  if (statusFilter) {
    docs = docs.filter(d => d.status === statusFilter);
  }
  const q = globalFilter.value.toLowerCase();
  if (q) {
    docs = docs.filter(d => d.title.toLowerCase().includes(q));
  }
  return docs;
});

const paginatedDocuments = computed(() => {
  return filteredDocuments.value.slice(first.value, first.value + rows.value);
});

const totalRecords = computed(() => {
  if (viewMode.value === 'tiles') {
    return filteredDocuments.value.length;
  }
  return documents.value?.length ?? 0;
});

watch([globalFilter, () => filters.value.status.value], () => {
  first.value = 0;
});

// --- Project loading ---
watch(projectId, (id) => {
  if (id && !project.value) {
    fetchProject();
  }
}, { immediate: true });

async function fetchProject() {
  if (!projectId.value) return;
  loading.value = true;
  error.value = null;
  try {
    project.value = await fetchProjectById(projectId.value);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error occurred';
    console.error('Error fetching project:', err);
  } finally {
    loading.value = false;
  }
}

// --- Utility ---
function formatDate(date: Date): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = String(d.getFullYear()).slice(-2);
  return `${day}.${month}.${year}`;
}

function getStatusSeverity(status: DocumentStatus): "success" | "warn" | "danger" | "secondary" | "info" | "contrast" | undefined {
  switch (status) {
    case DocumentStatus.APPROVED: return 'success';
    case DocumentStatus.PENDING: return 'warn';
    case DocumentStatus.DECLINED: return 'danger';
    default: return 'secondary';
  }
}

function toggleSettings(event: Event) {
  settingsPopover.value.toggle(event);
}

function clearFilters() {
  globalFilter.value = '';
  filters.value.global.value = null;
  filters.value.status.value = null;
}

function navigateToDocument(doc: Document) {
  router.push({
    name: 'project-document',
    params: { id: projectSlug.value, documentId: getDocumentUrl(doc) }
  });
}

function confirmDeleteDocument(doc: Document) {
  confirm.require({
    message: `Are you sure you want to delete "${doc.title}"?`,
    header: 'Delete Document',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => deleteDocument(doc.id),
    reject: () => {}
  });
}

async function deleteDocument(documentId: string) {
  try {
    documents.value = documents.value.filter(d => d.id !== documentId);
    toast.add({
      severity: 'success',
      summary: 'Document Deleted',
      detail: 'Document has been deleted successfully.',
      life: 3000
    });
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err instanceof Error ? err.message : 'Failed to delete document',
      life: 5000
    });
  }
}

function onPageChange(event: { first: number; rows: number }) {
  first.value = event.first;
  rows.value = event.rows;
}

function openUploadDialog() {
  uploadForm.title = '';
  uploadForm.documentType = '';
  uploadForm.file = null;
  showUploadDialog.value = true;
}

function onFileSelect(event: { files: File[] }) {
  if (event.files && event.files.length > 0) {
    uploadForm.file = event.files[0];
    if (!uploadForm.title) {
      uploadForm.title = uploadForm.file.name.replace(/\.[^/.]+$/, '');
    }
  }
}

async function handleUploadDocument() {
  if (!uploadForm.file || !uploadForm.title) {
    toast.add({
      severity: 'warn',
      summary: 'Missing Information',
      detail: 'Please select a file and enter a title.',
      life: 3000
    });
    return;
  }

  uploading.value = true;
  try {
    await uploadDocument({
      file: uploadForm.file,
      title: uploadForm.title,
      documentType: uploadForm.documentType,
    });
    showUploadDialog.value = false;
    toast.add({
      severity: 'success',
      summary: 'Document Uploaded',
      detail: 'Document has been uploaded successfully.',
      life: 3000
    });
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Upload Failed',
      detail: err instanceof Error ? err.message : 'Failed to upload document',
      life: 5000
    });
  } finally {
    uploading.value = false;
  }
}

// ===== SETTINGS DRAWER (Party Management) =====

// Party types (inline, matching ProjectSettings.vue)
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

// Drawer state
const showSettingsDrawer = ref(false);
const drawerView = ref<'list' | 'create' | 'edit'>('list');
const drawerLoading = ref(false);
const drawerLoaded = ref(false);

// Party state
const parties = ref<PartyWithMembers[]>([]);
const tenantUsers = ref<TenantUser[]>([]);
const partyPermissions = ref<Map<string, Record<string, PermissionAction>>>(new Map());

// Current user
const currentUserId = computed(() => {
  return (auth.decodedToken.value as Record<string, unknown> | null)?.sub as string | undefined;
});

function getUserDisplayName(user: { firstName?: string; lastName?: string; email: string }): string {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return fullName || user.email;
}

// Available users (not already a member in any party)
const allMemberIds = computed(() => {
  const ids = new Set<string>();
  for (const pw of parties.value) {
    for (const m of pw.members) {
      ids.add(m.id);
    }
  }
  return ids;
});

const availableUsers = computed(() => {
  return tenantUsers.value
    .filter(u => !allMemberIds.value.has(u.userId))
    .map(u => ({ ...u, displayName: getUserDisplayName(u) }));
});

const permissionOptions = [
  { label: 'None', value: '' },
  { label: 'View', value: 'VIEW' },
  { label: 'Comment', value: 'COMMENT' },
  { label: 'Decide', value: 'DECIDE' },
];

// Open drawer
function openSettingsDrawer() {
  showSettingsDrawer.value = true;
  drawerView.value = 'list';
  if (!drawerLoaded.value) {
    loadDrawerData();
  }
}

async function loadDrawerData() {
  drawerLoading.value = true;
  await Promise.all([
    fetchParties(),
    fetchTenantUsers(),
    fetchPartyPermissions(),
  ]);
  drawerLoading.value = false;
  drawerLoaded.value = true;
}

async function fetchParties() {
  if (!projectId.value) return;
  try {
    const response = await auth.apiClient.get<ApiResponse<ProjectPartyMembers>>(
      `/api/projects/${projectId.value}/party`
    );
    parties.value = response.data.data.parties;
  } catch (err) {
    console.error('Failed to fetch parties:', err);
    parties.value = [];
  }
}

async function fetchTenantUsers() {
  try {
    tenantUsers.value = await usersApi.fetchTenantUsers();
  } catch (err) {
    console.error('Failed to fetch tenant users:', err);
    tenantUsers.value = [];
  }
}

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

function hasPartyMeta(meta?: PartyMetaDTO): boolean {
  if (!meta) return false;
  return !!(meta.vatNumber || meta.contactEmail || meta.contactPhone || meta.address);
}

function getPermissionCount(partyId: string): number {
  const perms = partyPermissions.value.get(partyId);
  return perms ? Object.keys(perms).length : 0;
}

interface PermissionGroupEntry { id: string; name: string; }
interface PermissionGroup { action: PermissionAction; docTypes: PermissionGroupEntry[]; }

function getPermissionsByAction(partyId: string): PermissionGroup[] {
  const perms = partyPermissions.value.get(partyId);
  if (!perms) return [];
  const grouped = new Map<PermissionAction, PermissionGroupEntry[]>();
  for (const [dtId, action] of Object.entries(perms)) {
    const name = documentTypes.value?.find(dt => dt.id === dtId)?.name || dtId;
    if (!grouped.has(action)) grouped.set(action, []);
    grouped.get(action)!.push({ id: dtId, name });
  }
  return Array.from(grouped.entries())
    .map(([action, docTypes]) => ({ action, docTypes }))
    .sort((a, b) => a.action.localeCompare(b.action));
}

const permissionActionMeta: Record<string, { icon: string; label: string }> = {
  VIEW: { icon: 'pi pi-eye', label: 'View' },
  DECIDE: { icon: 'pi pi-check-circle', label: 'Decide' },
  COMMENT: { icon: 'pi pi-comment', label: 'Comment' },
};

const permissionPopover = ref<InstanceType<typeof Popover> | null>(null);
const permissionPopoverData = ref<{ partyId: string; action: string; docTypes: PermissionGroupEntry[] } | null>(null);

function showPermissionPopover(event: Event, partyId: string, group: PermissionGroup) {
  const isSame = permissionPopoverData.value?.partyId === partyId && permissionPopoverData.value?.action === group.action;
  if (isSame) {
    permissionPopover.value?.toggle(event);
    return;
  }
  permissionPopover.value?.hide();
  permissionPopoverData.value = { partyId, action: group.action, docTypes: group.docTypes };
  nextTick(() => permissionPopover.value?.show(event));
}

async function removePermission(docTypeId: string) {
  if (!permissionPopoverData.value) return;
  const { partyId } = permissionPopoverData.value;
  if (!projectId.value) return;

  const previousPerms = { ...(partyPermissions.value.get(partyId) || {}) };
  const newPerms = { ...previousPerms };
  delete newPerms[docTypeId];

  // Optimistic update
  if (Object.keys(newPerms).length > 0) {
    partyPermissions.value.set(partyId, newPerms);
  } else {
    partyPermissions.value.delete(partyId);
  }

  // Update popover data
  permissionPopoverData.value.docTypes = permissionPopoverData.value.docTypes.filter(dt => dt.id !== docTypeId);
  if (permissionPopoverData.value.docTypes.length === 0) {
    permissionPopover.value?.hide();
  }

  try {
    if (Object.keys(newPerms).length === 0) {
      await auth.apiClient.delete(`/api/projects/${projectId.value}/party/${partyId}/permission`);
    } else {
      await auth.apiClient.post(`/api/projects/${projectId.value}/party/${partyId}/permission`, { permissions: newPerms });
    }
  } catch (err) {
    console.error('Failed to remove permission:', err);
    partyPermissions.value.set(partyId, previousPerms);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to remove permission', life: 3000 });
  }
}

// --- Add party ---
const addPartyForm = reactive({
  name: '',
  description: '',
  vatNumber: '',
  contactEmail: '',
  contactPhone: '',
  address: '',
});
const addPartyPermissions = ref<Record<string, PermissionAction | ''>>({});

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
    party: { id: tempId, name: partyName, description: partyDescription || undefined, meta, createdAt: new Date().toISOString() },
    members: [],
  };

  const newPerms: Record<string, PermissionAction> = {};
  for (const [dtId, action] of Object.entries(addPartyPermissions.value)) {
    if (action) newPerms[dtId] = action;
  }

  // Optimistic: add party + permissions to local state
  parties.value.push(optimisticParty);
  if (Object.keys(newPerms).length > 0) {
    partyPermissions.value.set(tempId, newPerms);
  }

  drawerView.value = 'list';
  addPartyForm.name = '';
  addPartyForm.description = '';
  addPartyForm.vatNumber = '';
  addPartyForm.contactEmail = '';
  addPartyForm.contactPhone = '';
  addPartyForm.address = '';
  addPartyPermissions.value = {};

  toast.add({ severity: 'success', summary: 'Party Created', detail: `Party "${partyName}" has been created`, life: 3000 });

  try {
    const requestBody: Record<string, unknown> = { name: partyName, description: partyDescription };
    if (Object.keys(meta).length > 0) requestBody.meta = meta;
    const response = await auth.apiClient.post<ApiResponse<PartyDTO>>(
      `/api/projects/${projectId.value}/party`,
      requestBody
    );
    const realId = response.data.data.id;
    const created = parties.value.find(p => p.party.id === tempId);
    if (created) created.party.id = realId;

    // Migrate optimistic permissions to real ID
    if (Object.keys(newPerms).length > 0) {
      partyPermissions.value.delete(tempId);
      partyPermissions.value.set(realId, newPerms);
      await auth.apiClient.post(`/api/projects/${projectId.value}/party/${realId}/permission`, { permissions: newPerms });
    }
  } catch (err) {
    console.error('Failed to create party:', err);
    parties.value = parties.value.filter(p => p.party.id !== tempId);
    partyPermissions.value.delete(tempId);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to create party', life: 3000 });
  }
}

// --- Delete party ---
function confirmDeleteParty(party: PartyWithMembers) {
  hidePermissionPopover();
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
  toast.add({ severity: 'success', summary: 'Party Deleted', detail: 'Party has been deleted', life: 3000 });

  try {
    await auth.apiClient.delete(`/api/projects/${projectId.value}/party/${partyId}`);
  } catch (err) {
    console.error('Failed to delete party:', err);
    parties.value.splice(partyIndex, 0, removedParty);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete party', life: 3000 });
  }
}

// --- Edit party ---
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

function hidePermissionPopover() {
  permissionPopover.value?.hide();
}

function openEditPartyDialog(pw: PartyWithMembers) {
  hidePermissionPopover();
  editingParty.value = pw;
  editPartyForm.name = pw.party.name;
  editPartyForm.description = pw.party.description || '';
  editPartyForm.vatNumber = pw.party.meta?.vatNumber || '';
  editPartyForm.contactEmail = pw.party.meta?.contactEmail || '';
  editPartyForm.contactPhone = pw.party.meta?.contactPhone || '';
  editPartyForm.address = pw.party.meta?.address || '';

  const currentPerms = partyPermissions.value.get(pw.party.id) || {};
  const permsMap: Record<string, PermissionAction | ''> = {};
  for (const dt of (documentTypes.value || [])) {
    permsMap[dt.id] = currentPerms[dt.id] || '';
  }
  editPartyPermissions.value = permsMap;
  drawerView.value = 'edit';
}

async function saveEditParty() {
  if (!editingParty.value || !projectId.value) return;

  const partyId = editingParty.value.party.id;
  const pw = parties.value.find(p => p.party.id === partyId);
  if (!pw) return;

  pw.party.name = editPartyForm.name;
  pw.party.description = editPartyForm.description || undefined;
  pw.party.meta = {
    vatNumber: editPartyForm.vatNumber || undefined,
    contactEmail: editPartyForm.contactEmail || undefined,
    contactPhone: editPartyForm.contactPhone || undefined,
    address: editPartyForm.address || undefined,
  };

  const previousPerms = partyPermissions.value.get(partyId) || {};
  const newPerms: Record<string, PermissionAction> = {};
  for (const [dtId, action] of Object.entries(editPartyPermissions.value)) {
    if (action) newPerms[dtId] = action;
  }

  if (Object.keys(newPerms).length > 0) {
    partyPermissions.value.set(partyId, newPerms);
  } else {
    partyPermissions.value.delete(partyId);
  }

  drawerView.value = 'list';
  editingParty.value = null;

  const permsChanged = JSON.stringify(previousPerms) !== JSON.stringify(newPerms);

  if (permsChanged) {
    try {
      if (Object.keys(newPerms).length === 0 && Object.keys(previousPerms).length > 0) {
        await auth.apiClient.delete(`/api/projects/${projectId.value}/party/${partyId}/permission`);
      } else if (Object.keys(newPerms).length > 0) {
        await auth.apiClient.post(`/api/projects/${projectId.value}/party/${partyId}/permission`, { permissions: newPerms });
      }
    } catch (err) {
      console.error('Failed to save permissions:', err);
      if (Object.keys(previousPerms).length > 0) {
        partyPermissions.value.set(partyId, previousPerms);
      } else {
        partyPermissions.value.delete(partyId);
      }
      toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save permissions', life: 3000 });
      return;
    }
  }

  toast.add({
    severity: 'success',
    summary: 'Party Updated',
    detail: permsChanged ? 'Party details and permissions have been updated' : 'Party details updated locally (backend sync coming soon)',
    life: 3000,
  });
}

// --- Add member ---
const showAddMemberDialog = ref(false);
const addMemberParty = ref<PartyWithMembers | null>(null);
const selectedUser = ref<(TenantUser & { displayName: string }) | null>(null);

function openAddMemberDialog(pw: PartyWithMembers) {
  hidePermissionPopover();
  addMemberParty.value = pw;
  selectedUser.value = null;
  showAddMemberDialog.value = true;
}

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

  toast.add({ severity: 'success', summary: 'Member Added', detail: `${getUserDisplayName(user)} has been added`, life: 3000 });

  try {
    await auth.apiClient.post(
      `/api/projects/${projectId.value}/party/${party.party.id}/members`,
      { user_id: user.userId }
    );
  } catch (err) {
    console.error('Failed to add member:', err);
    party.members = party.members.filter(m => m.id !== newMember.id);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to add member', life: 3000 });
  }
}

// --- Remove member ---
function confirmRemoveMember(partyId: string, member: UserDTO) {
  hidePermissionPopover();
  if (member.id === currentUserId.value) {
    toast.add({ severity: 'warn', summary: 'Cannot Remove', detail: 'You cannot remove yourself', life: 3000 });
    return;
  }
  confirm.require({
    message: `Are you sure you want to remove ${getUserDisplayName(member)}?`,
    header: 'Remove Member',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => removeMember(partyId, member.id),
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
  toast.add({ severity: 'success', summary: 'Member Removed', detail: 'Member has been removed', life: 3000 });

  try {
    await auth.apiClient.delete(
      `/api/projects/${projectId.value}/party/${partyId}/members`,
      { data: { user_id: memberId } }
    );
  } catch (err) {
    console.error('Failed to remove member:', err);
    party.members.splice(memberIndex, 0, removedMember);
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to remove member', life: 3000 });
  }
}
</script>

<template>
  <div class="flex flex-col gap-4 h-full">
    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center p-12 text-center text-[var(--text-secondary)]">
      <ProgressSpinner />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex flex-col items-center justify-center p-12 text-center text-[var(--text-secondary)]">
      <i class="pi pi-exclamation-triangle text-[48px] mb-4 text-[var(--color-danger)]"></i>
      <h3 class="text-lg font-semibold text-[var(--text-color)] m-0 mb-2">Error loading project</h3>
      <p class="m-0 mb-6">{{ error }}</p>
      <Button icon="pi pi-refresh" label="Try Again" @click="fetchProject" />
    </div>

    <!-- Project Content -->
    <template v-else>
      <!-- Project Header -->
      <div class="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-[10px] p-5">
        <nav class="flex items-center gap-1.5 text-sm mb-3">
          <router-link :to="{ name: 'projects' }" class="text-[var(--text-secondary)] hover:text-[var(--primary-color)] transition-colors no-underline">
            Projects
          </router-link>
        </nav>
        <div class="flex justify-between items-start">
          <div class="flex-1 min-w-0">
            <!-- Inline editable name -->
            <div class="flex items-center gap-2 group/name">
              <template v-if="editingName">
                <InputText
                  ref="nameInput"
                  v-model="editNameValue"
                  class="text-2xl font-semibold w-full max-w-[500px]"
                  @keydown.enter="saveEditName"
                  @keydown.escape="cancelEditName"
                  @blur="saveEditName"
                />
              </template>
              <template v-else>
                <h1 class="font-semibold text-2xl text-[var(--text-color)] m-0">{{ project?.name }}</h1>
                <Button
                  icon="pi pi-pencil"
                  text
                  rounded
                  size="small"
                  class="opacity-0 group-hover/name:opacity-100 transition-opacity shrink-0"
                  aria-label="Edit project name"
                  @click="startEditName"
                />
              </template>
            </div>
            <!-- Inline editable description -->
            <div class="flex items-start gap-2 mt-2 group/desc">
              <template v-if="editingDescription">
                <Textarea
                  ref="descriptionInput"
                  v-model="editDescriptionValue"
                  rows="2"
                  class="text-sm w-full max-w-[500px]"
                  @keydown.escape="cancelEditDescription"
                  @blur="saveEditDescription"
                />
              </template>
              <template v-else>
                <p v-if="project?.description" class="text-sm text-[var(--text-secondary)] m-0">{{ project.description }}</p>
                <p v-else class="text-sm text-[var(--text-secondary)] m-0 italic">No description</p>
                <Button
                  icon="pi pi-pencil"
                  text
                  rounded
                  size="small"
                  class="opacity-0 group-hover/desc:opacity-100 transition-opacity shrink-0"
                  aria-label="Edit project description"
                  @click="startEditDescription"
                />
              </template>
            </div>
          </div>
          <div class="shrink-0">
            <Button
              icon="pi pi-cog"
              label="Settings"
              outlined
              size="small"
              @click="openSettingsDrawer"
            />
          </div>
        </div>
      </div>

      <!-- Documents Table Container -->
      <div class="bg-[var(--ui-input-fill-default)] border border-[var(--ui-input-fill-disabled)] rounded-[10px] overflow-hidden flex flex-col flex-1">
        <!-- Toolbar -->
        <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between px-4 py-3 border-b border-[var(--ui-button-outlined-stroke)] gap-4">
          <div class="flex items-center gap-3">
            <Button
              icon="pi pi-filter-slash"
              label="Clear"
              outlined
              size="small"
              @click="clearFilters"
            />
            <Select
              v-model="filters.status.value"
              :options="statusOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Status"
              size="small"
              class="min-w-[120px]"
            />
            <SelectButton
              v-model="viewMode"
              :options="viewModeOptions"
              optionLabel="value"
              optionValue="value"
              dataKey="value"
              :allowEmpty="false"
            >
              <template #option="{ option }">
                <i :class="option.icon"></i>
              </template>
            </SelectButton>
          </div>

          <div class="flex items-center gap-3 flex-wrap md:flex-nowrap">
            <Button
              icon="pi pi-upload"
              label="Upload Document"
              outlined
              size="small"
              @click="openUploadDialog"
            />
            <template v-if="viewMode === 'table'">
            <Button
              icon="pi pi-cog"
              outlined
              size="small"
              aria-label="Settings"
              @click="toggleSettings"
            />
            <Popover ref="settingsPopover">
              <div class="min-w-[200px] bg-white rounded-xl">
                <div class="py-3 px-4 font-semibold text-sm text-[var(--ui-input-label)]">Columns</div>
                <div class="flex items-center justify-between gap-2 py-3 px-4 text-sm text-[var(--ui-button-primary)]">
                  <span class="flex-1">Document Type</span>
                  <ToggleSwitch v-model="columnSettings.documentType" />
                </div>
                <div class="flex items-center justify-between gap-2 py-3 px-4 text-sm text-[var(--ui-button-primary)]">
                  <span class="flex-1">Document Name</span>
                  <ToggleSwitch v-model="columnSettings.documentName" disabled />
                </div>
                <div class="flex items-center justify-between gap-2 py-3 px-4 text-sm text-[var(--ui-button-primary)]">
                  <span class="flex-1">Modified Date</span>
                  <ToggleSwitch v-model="columnSettings.modifiedDate" />
                </div>
                <div class="flex items-center justify-between gap-2 py-3 px-4 text-sm text-[var(--ui-button-primary)]">
                  <span class="flex-1">Status</span>
                  <ToggleSwitch v-model="columnSettings.status" />
                </div>
                <div class="flex items-center justify-between gap-2 py-3 px-4 text-sm text-[var(--ui-button-primary)]">
                  <span class="flex-1">Version</span>
                  <ToggleSwitch v-model="columnSettings.version" />
                </div>
              </div>
            </Popover>
            </template>
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

        <!-- Tile View -->
        <div v-if="viewMode === 'tiles'" class="flex-1">
          <div v-if="!paginatedDocuments.length" class="flex flex-col items-center justify-center p-12 text-center text-[var(--text-secondary)]">
            <i class="pi pi-file text-[48px] mb-4 text-[var(--text-muted)]"></i>
            <h3 class="text-lg font-semibold text-[var(--text-color)] m-0 mb-2">No documents found</h3>
            <p class="m-0 mb-6">Upload a document to get started.</p>
            <Button icon="pi pi-upload" label="Upload Document" @click="openUploadDialog" />
          </div>
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            <DocumentCard
              v-for="doc in paginatedDocuments"
              :key="doc.id"
              :document="doc"
              @click="navigateToDocument"
              @save-title="onCardSaveTitle"
              @delete="confirmDeleteDocument"
            />
          </div>
        </div>

        <!-- Data Table -->
        <DataTable
          v-else
          :value="documents"
          :loading="loading"
          :filters="filters"
          :globalFilterFields="['title']"
          :first="first"
          :rows="rows"
          dataKey="id"
          stripedRows
          @row-click="(e) => navigateToDocument(e.data)"
          class="documents-table flex-1"
          :pt="{
            table: { class: 'w-full' },
            bodyRow: { class: 'cursor-pointer hover:bg-gray-50' }
          }"
        >
          <template #empty>
            <div class="flex flex-col items-center justify-center p-12 text-center text-[var(--text-secondary)]">
              <i class="pi pi-file text-[48px] mb-4 text-[var(--text-muted)]"></i>
              <h3 class="text-lg font-semibold text-[var(--text-color)] m-0 mb-2">No documents found</h3>
              <p class="m-0 mb-6">Upload a document to get started.</p>
              <Button icon="pi pi-upload" label="Upload Document" @click="openUploadDialog" />
            </div>
          </template>

          <Column
            v-if="columnSettings.documentType"
            header="Type"
            style="width: 60px"
          >
            <template #body="{ data }">
              <i :class="'pi ' + sanitizeIcon(data.documentType?.meta?.icon)" class="text-lg text-[var(--text-secondary)]"></i>
            </template>
          </Column>

          <Column
            v-if="columnSettings.documentName"
            field="title"
            header="Document Name"
            sortable
            style="min-width: 250px"
          >
            <template #body="{ data }">
              <template v-if="editingDocId === data.id">
                <InputText
                  ref="docTitleInput"
                  v-model="editDocTitle"
                  size="small"
                  class="w-full"
                  @click.stop
                  @keydown.enter="saveEditDocTitle(data)"
                  @keydown.escape="cancelEditDocTitle"
                  @blur="saveEditDocTitle(data)"
                />
              </template>
              <span v-else class="text-[var(--primary-color)] font-medium">{{ data.title }}</span>
            </template>
          </Column>

          <Column
            v-if="columnSettings.modifiedDate"
            header="Modified Date"
            sortable
            sortField="currentVersion.uploadedAt"
            style="min-width: 140px"
          >
            <template #body="{ data }">
              <span class="text-[var(--text-secondary)]">{{ data.currentVersion ? formatDate(data.currentVersion.uploadedAt) : '—' }}</span>
            </template>
          </Column>

          <Column
            v-if="columnSettings.status"
            field="status"
            header="Status"
            sortable
            style="min-width: 120px"
          >
            <template #body="{ data }">
              <Tag :value="data.status" :severity="getStatusSeverity(data.status)" />
            </template>
          </Column>

          <Column
            v-if="columnSettings.version"
            header="Version"
            sortable
            sortField="currentVersion.version"
            style="min-width: 100px"
          >
            <template #body="{ data }">
              <span class="text-[var(--text-secondary)] font-medium">{{ data.currentVersion ? `v${data.currentVersion.version}` : '—' }}</span>
            </template>
          </Column>

          <Column header="" style="width: 100px" :exportable="false">
            <template #body="{ data }">
              <div class="flex items-center gap-1 opacity-60 hover:opacity-100">
                <Button
                  icon="pi pi-pencil"
                  text
                  rounded
                  size="small"
                  aria-label="Edit"
                  @click.stop="startEditDocTitle(data)"
                />
                <Button
                  icon="pi pi-trash"
                  text
                  rounded
                  size="small"
                  severity="danger"
                  aria-label="Delete"
                  @click.stop="confirmDeleteDocument(data)"
                />
              </div>
            </template>
          </Column>
        </DataTable>

        <!-- Pagination -->
        <div class="table-pagination flex justify-center py-2 px-4 border-t border-[var(--ui-button-outlined-stroke)]">
          <Paginator
            :first="first"
            :rows="rows"
            :totalRecords="totalRecords"
            :rowsPerPageOptions="[10, 20, 50]"
            @page="onPageChange"
            template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          />
        </div>
      </div>
    </template>

    <!-- Upload Document Dialog -->
    <Dialog
      v-model:visible="showUploadDialog"
      header="Upload Document"
      modal
      :style="{ width: '500px' }"
    >
      <div class="flex flex-col gap-4 py-2">
        <div class="form-field w-full">
          <FileUpload
            mode="basic"
            accept=".pdf"
            :maxFileSize="50000000"
            chooseLabel="Select PDF"
            class="w-full"
            @select="onFileSelect"
          />
          <small v-if="uploadForm.file" class="block mt-2 text-[var(--text-secondary)]">
            Selected: {{ uploadForm.file.name }}
          </small>
        </div>

        <div class="form-field w-full">
          <FloatLabel variant="on">
            <InputText
              id="uploadTitle"
              v-model="uploadForm.title"
              class="w-full"
            />
            <label for="uploadTitle">Document Title</label>
          </FloatLabel>
        </div>

        <div class="form-field w-full">
          <FloatLabel variant="on">
            <Select
              id="uploadType"
              v-model="uploadForm.documentType"
              :options="documentTypeOptions"
              optionLabel="label"
              optionValue="value"
              class="w-full"
            />
            <label for="uploadType">Document Type</label>
          </FloatLabel>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-4">
          <Button
            label="Cancel"
            text
            severity="secondary"
            @click="showUploadDialog = false"
            :disabled="uploading"
          />
          <Button
            label="Upload"
            icon="pi pi-upload"
            @click="handleUploadDocument"
            :loading="uploading"
            :disabled="!uploadForm.file || !uploadForm.title"
          />
        </div>
      </template>
    </Dialog>

    <!-- ===== Settings Drawer ===== -->
    <Drawer
      v-model:visible="showSettingsDrawer"
      position="right"
      :header="drawerView === 'list' ? 'Project Settings' : drawerView === 'create' ? 'New Party' : 'Edit Party'"
      class="!w-[480px]"
    >
      <div v-if="drawerLoading" class="flex items-center justify-center p-12">
        <ProgressSpinner style="width: 40px; height: 40px" />
      </div>

      <!-- ===== List View ===== -->
      <template v-else-if="drawerView === 'list'">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-semibold text-[var(--text-color)] m-0">Parties</h3>
          <Button
            icon="pi pi-plus"
            label="New Party"
            size="small"
            outlined
            @click="drawerView = 'create'"
          />
        </div>

        <div v-if="parties.length === 0" class="text-center py-8 text-[var(--text-secondary)]">
          <i class="pi pi-users text-3xl mb-3 block"></i>
          <p class="m-0">No parties yet. Create one to get started.</p>
        </div>

        <Accordion v-else :multiple="true" class="parties-accordion">
          <AccordionPanel v-for="pw in parties" :key="pw.party.id" :value="pw.party.id">
            <AccordionHeader>
              <div class="flex items-center justify-between w-full pr-2">
                <div class="flex items-center gap-2">
                  <span class="font-semibold text-sm">{{ pw.party.name }}</span>
                  <span class="text-xs text-[var(--text-secondary)] bg-[var(--surface-ground)] rounded-full px-2 py-0.5">
                    {{ pw.members.length }} member{{ pw.members.length !== 1 ? 's' : '' }}
                  </span>
                </div>
                <div class="flex items-center gap-0.5" @click.stop>
                  <Button
                    icon="pi pi-pencil"
                    text
                    rounded
                    size="small"
                    severity="secondary"
                    @click="openEditPartyDialog(pw)"
                    aria-label="Edit party"
                  />
                  <Button
                    icon="pi pi-trash"
                    text
                    rounded
                    size="small"
                    severity="danger"
                    @click="confirmDeleteParty(pw)"
                    aria-label="Delete party"
                  />
                </div>
              </div>
            </AccordionHeader>
            <AccordionContent>
              <div class="flex flex-col gap-3">
                <!-- Permissions -->
                <div v-if="getPermissionCount(pw.party.id) > 0" class="flex flex-wrap gap-1.5">
                  <span
                    v-for="group in getPermissionsByAction(pw.party.id)"
                    :key="group.action"
                    class="inline-flex items-center gap-1 text-xs text-[var(--text-secondary)] border border-[var(--surface-border)] rounded-full px-2.5 py-1 cursor-pointer hover:border-[var(--primary-color)] hover:text-[var(--primary-color)] transition-colors"
                    @click="showPermissionPopover($event, pw.party.id, group)"
                  >
                    <i :class="permissionActionMeta[group.action]?.icon || 'pi pi-lock'" class="text-[11px]" />
                    {{ permissionActionMeta[group.action]?.label || group.action }}
                    <span class="opacity-40">·</span>
                    <span class="opacity-60">{{ group.docTypes.length }}</span>
                    <i class="pi pi-chevron-down text-[9px] opacity-40" />
                  </span>
                </div>

                <Divider v-if="getPermissionCount(pw.party.id) > 0" class="!my-0" />

                <!-- Members -->
                <div v-if="pw.members.length > 0" class="flex flex-col gap-2">
                  <div
                    v-for="member in pw.members"
                    :key="member.id"
                    class="flex items-center justify-between py-1.5 px-2 rounded hover:bg-[var(--surface-ground)]"
                  >
                    <div class="flex items-center gap-2.5 min-w-0">
                      <div class="w-7 h-7 rounded-full bg-[var(--primary-color)] text-white flex items-center justify-center text-xs font-semibold shrink-0">
                        {{ (member.firstName?.[0] || member.email[0]).toUpperCase() }}
                      </div>
                      <div class="flex flex-col min-w-0">
                        <span class="text-sm font-medium text-[var(--text-color)] truncate">
                          {{ getUserDisplayName(member) }}
                          <span v-if="member.id === currentUserId" class="text-xs text-[var(--text-secondary)]">(You)</span>
                        </span>
                        <span class="text-xs text-[var(--text-secondary)] truncate">{{ member.email }}</span>
                      </div>
                    </div>
                    <Button
                      v-if="member.id !== currentUserId"
                      icon="pi pi-times"
                      text
                      rounded
                      size="small"
                      severity="secondary"
                      @click="confirmRemoveMember(pw.party.id, member)"
                      aria-label="Remove member"
                    />
                  </div>
                </div>
                <p v-else class="text-sm text-[var(--text-secondary)] m-0">No members yet.</p>

                <!-- Metadata -->
                <div v-if="hasPartyMeta(pw.party.meta)" class="flex flex-col gap-1 pt-2 border-t border-[var(--surface-border)]">
                  <span class="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-1">Details</span>
                  <span v-if="pw.party.meta.vatNumber" class="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                    <i class="pi pi-building text-[11px] w-3.5 text-center" /> {{ pw.party.meta.vatNumber }}
                  </span>
                  <span v-if="pw.party.meta.contactEmail" class="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                    <i class="pi pi-envelope text-[11px] w-3.5 text-center" /> {{ pw.party.meta.contactEmail }}
                  </span>
                  <span v-if="pw.party.meta.contactPhone" class="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                    <i class="pi pi-phone text-[11px] w-3.5 text-center" /> {{ pw.party.meta.contactPhone }}
                  </span>
                  <span v-if="pw.party.meta.address" class="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                    <i class="pi pi-map-marker text-[11px] w-3.5 text-center" /> {{ pw.party.meta.address }}
                  </span>
                </div>

                <!-- Add member button -->
                <Button
                  icon="pi pi-user-plus"
                  label="Add Member"
                  size="small"
                  text
                  class="self-start mt-1"
                  @click="openAddMemberDialog(pw)"
                />
              </div>
            </AccordionContent>
          </AccordionPanel>
        </Accordion>
      </template>

      <!-- ===== Create Party View ===== -->
      <template v-else-if="drawerView === 'create'">
        <button class="flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-color)] transition-colors mb-4 cursor-pointer bg-transparent border-0 p-0" @click="drawerView = 'list'">
          <i class="pi pi-arrow-left text-xs" />
          Back to parties
        </button>
        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-2">
            <label for="partyName" class="font-semibold text-sm text-[var(--text-color)]">Party Name</label>
            <InputText id="partyName" v-model="addPartyForm.name" class="w-full" placeholder="e.g., Legal Team, Finance" />
          </div>
          <div class="flex flex-col gap-2">
            <label for="partyDescription" class="font-semibold text-sm text-[var(--text-color)]">Description (optional)</label>
            <InputText id="partyDescription" v-model="addPartyForm.description" class="w-full" placeholder="Brief description" />
          </div>
          <div class="font-semibold text-[13px] text-[var(--text-secondary)] uppercase tracking-wide mt-2 pb-1 border-b border-[var(--surface-border)]">Metadata (optional)</div>
          <div class="flex flex-col gap-2">
            <label for="addPartyVat" class="font-semibold text-sm text-[var(--text-color)]">VAT Number</label>
            <InputText id="addPartyVat" v-model="addPartyForm.vatNumber" class="w-full" placeholder="VAT number" />
          </div>
          <div class="flex flex-col gap-2">
            <label for="addPartyEmail" class="font-semibold text-sm text-[var(--text-color)]">Contact Email</label>
            <InputText id="addPartyEmail" v-model="addPartyForm.contactEmail" class="w-full" placeholder="contact@example.com" />
          </div>
          <div class="flex flex-col gap-2">
            <label for="addPartyPhone" class="font-semibold text-sm text-[var(--text-color)]">Contact Phone</label>
            <InputText id="addPartyPhone" v-model="addPartyForm.contactPhone" class="w-full" placeholder="+1 234 567 890" />
          </div>
          <div class="flex flex-col gap-2">
            <label for="addPartyAddress" class="font-semibold text-sm text-[var(--text-color)]">Address</label>
            <InputText id="addPartyAddress" v-model="addPartyForm.address" class="w-full" placeholder="Street, City, Country" />
          </div>
          <div v-if="documentTypes && documentTypes.length > 0" class="font-semibold text-[13px] text-[var(--text-secondary)] uppercase tracking-wide mt-2 pb-1 border-b border-[var(--surface-border)]">Document Permissions</div>
          <div v-if="documentTypes && documentTypes.length > 0" class="flex flex-col gap-2">
            <div v-for="dt in documentTypes" :key="dt.id" class="flex items-center justify-between gap-3">
              <span class="text-sm text-[var(--text-color)] flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{{ dt.name }}</span>
              <Select v-model="addPartyPermissions[dt.id]" :options="permissionOptions" optionLabel="label" optionValue="value" placeholder="None" class="w-[140px] shrink-0" />
            </div>
          </div>
          <div class="flex justify-end gap-2 mt-2">
            <Button label="Cancel" text severity="secondary" @click="drawerView = 'list'" />
            <Button label="Create Party" icon="pi pi-check" :disabled="!addPartyForm.name.trim()" @click="addParty" />
          </div>
        </div>
      </template>

      <!-- ===== Edit Party View ===== -->
      <template v-else-if="drawerView === 'edit'">
        <button class="flex items-center gap-1 text-sm text-[var(--text-secondary)] hover:text-[var(--text-color)] transition-colors mb-4 cursor-pointer bg-transparent border-0 p-0" @click="drawerView = 'list'">
          <i class="pi pi-arrow-left text-xs" />
          Back to parties
        </button>
        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-2">
            <label for="editPartyName" class="font-semibold text-sm text-[var(--text-color)]">Party Name</label>
            <InputText id="editPartyName" v-model="editPartyForm.name" class="w-full" />
          </div>
          <div class="flex flex-col gap-2">
            <label for="editPartyDescription" class="font-semibold text-sm text-[var(--text-color)]">Description</label>
            <InputText id="editPartyDescription" v-model="editPartyForm.description" class="w-full" placeholder="Brief description" />
          </div>
          <div class="font-semibold text-[13px] text-[var(--text-secondary)] uppercase tracking-wide mt-2 pb-1 border-b border-[var(--surface-border)]">Metadata</div>
          <div class="flex flex-col gap-2">
            <label for="editPartyVat" class="font-semibold text-sm text-[var(--text-color)]">VAT Number</label>
            <InputText id="editPartyVat" v-model="editPartyForm.vatNumber" class="w-full" placeholder="VAT number" />
          </div>
          <div class="flex flex-col gap-2">
            <label for="editPartyEmail" class="font-semibold text-sm text-[var(--text-color)]">Contact Email</label>
            <InputText id="editPartyEmail" v-model="editPartyForm.contactEmail" class="w-full" placeholder="contact@example.com" />
          </div>
          <div class="flex flex-col gap-2">
            <label for="editPartyPhone" class="font-semibold text-sm text-[var(--text-color)]">Contact Phone</label>
            <InputText id="editPartyPhone" v-model="editPartyForm.contactPhone" class="w-full" placeholder="+1 234 567 890" />
          </div>
          <div class="flex flex-col gap-2">
            <label for="editPartyAddress" class="font-semibold text-sm text-[var(--text-color)]">Address</label>
            <InputText id="editPartyAddress" v-model="editPartyForm.address" class="w-full" placeholder="Street, City, Country" />
          </div>
          <div v-if="documentTypes && documentTypes.length > 0" class="font-semibold text-[13px] text-[var(--text-secondary)] uppercase tracking-wide mt-2 pb-1 border-b border-[var(--surface-border)]">Document Permissions</div>
          <div v-if="documentTypes && documentTypes.length > 0" class="flex flex-col gap-2">
            <div v-for="dt in documentTypes" :key="dt.id" class="flex items-center justify-between gap-3">
              <span class="text-sm text-[var(--text-color)] flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">{{ dt.name }}</span>
              <Select v-model="editPartyPermissions[dt.id]" :options="permissionOptions" optionLabel="label" optionValue="value" placeholder="None" class="w-[140px] shrink-0" />
            </div>
          </div>
          <div class="flex justify-end gap-2 mt-2">
            <Button label="Cancel" text severity="secondary" @click="drawerView = 'list'" />
            <Button label="Save" icon="pi pi-check" :disabled="!editPartyForm.name.trim()" @click="saveEditParty" />
          </div>
        </div>
      </template>
    </Drawer>

    <!-- Permission action popover -->
    <Popover ref="permissionPopover" class="!min-w-0">
      <div v-if="permissionPopoverData" class="flex flex-col gap-0.5 py-1">
        <div
          v-for="dt in permissionPopoverData.docTypes"
          :key="dt.id"
          class="flex items-center justify-between gap-3 px-2 py-0.5 rounded hover:bg-[var(--surface-ground)]"
        >
          <span class="text-sm text-[var(--text-color)]">{{ dt.name }}</span>
          <button
            class="text-[var(--text-secondary)] hover:text-[#e74c3c] transition-colors p-0.5 cursor-pointer"
            @click="removePermission(dt.id)"
            aria-label="Remove permission"
          >
            <i class="pi pi-times text-[10px]" />
          </button>
        </div>
      </div>
    </Popover>

    <!-- Add Member Dialog -->
    <Dialog
      v-model:visible="showAddMemberDialog"
      header="Add Member"
      modal
      :style="{ width: '400px' }"
    >
      <div class="flex flex-col gap-4">
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
          :disabled="!selectedUser"
          @click="addMemberToParty"
        />
      </template>
    </Dialog>

  </div>
</template>

<style scoped>
.documents-table :deep(.p-datatable-thead > tr > th) {
  background-color: var(--surface-ground);
  color: var(--ui-input-label);
  font-weight: 600;
  font-size: 14px;
  padding: 16px;
  border-color: var(--ui-button-outlined-stroke);
}

.documents-table :deep(.p-datatable-tbody > tr > td) {
  padding: 16px;
  border-color: var(--ui-button-outlined-stroke);
  font-size: 14px;
  color: var(--ui-input-label);
}

.documents-table :deep(.p-datatable-tbody > tr:hover) {
  background-color: var(--surface-ground);
}

.table-pagination :deep(.p-paginator) {
  background: transparent;
  border: none;
  padding: 0;
}

.form-field :deep(.p-inputtext),
.form-field :deep(.p-select) {
  width: 100%;
}

.parties-accordion :deep(.p-accordionheader) {
  padding: 12px 8px;
  background: transparent;
}

.parties-accordion :deep(.p-accordioncontent-content) {
  padding: 8px 8px 16px;
}
</style>
