<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { FilterMatchMode } from '@primevue/core/api';
import type { Project } from '@/types/Project';
import { DocumentStatus, type Document } from '@/types/Document';

// PrimeVue Components
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import InputText from 'primevue/inputtext';
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

import { useProjects, useProjectDocuments } from "@/composables/useProjects";
import { useDocumentTypes } from "@/composables/useDocumentTypes";
import { sanitizeIcon } from "@/utils/documentTypeIcons";

const route = useRoute();
const router = useRouter();
const toast = useToast();
const confirm = useConfirm();

const { useResolvedProjectId, fetchProjectById, getProjectUrl, loading: projectsLoading } = useProjects();

// Resolve slug URL to full project ID (reactive - updates when projects load)
const projectSlug = computed(() => route.params.id as string);
const projectId = useResolvedProjectId(projectSlug);

const {
  documents,
  loading: documentsLoading,
  getDocumentUrl,
  uploadDocument,
} = useProjectDocuments(() => projectId.value);

// State
const loading = ref(true);
const error = ref<string | null>(null);
const project = ref<Project | null>(null);

// Settings popover
const settingsPopover = ref();
const columnSettings = reactive({
  documentType: true,
  documentName: true,
  modifiedDate: true,
  status: true,
  version: true,
});

// Search and filters
const globalFilter = ref('');
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  status: { value: null, matchMode: FilterMatchMode.EQUALS },
});

// Status filter options
const statusOptions = [
  { label: 'All', value: null },
  { label: 'Pending', value: DocumentStatus.PENDING },
  { label: 'Approved', value: DocumentStatus.APPROVED },
  { label: 'Declined', value: DocumentStatus.DECLINED },
];

// Pagination
const first = ref(0);
const rows = ref(10);
const totalRecords = computed(() => documents.value?.length ?? 0);

// Edit dialog
const showEditDialog = ref(false);
const editingDocument = ref<Document | null>(null);
const editForm = reactive({
  title: '',
  status: DocumentStatus.PENDING as DocumentStatus,
});

// Upload dialog
const showUploadDialog = ref(false);
const uploading = ref(false);
const uploadForm = reactive({
  title: '',
  documentType: '' as string,
  file: null as File | null,
});

// Document types from API
const { documentTypes } = useDocumentTypes();
const documentTypeOptions = computed(() =>
  (documentTypes.value ?? []).map(dt => ({ label: dt.name, value: dt.id }))
);


// Wait for projects to load, then fetch project details
watch(projectsLoading, (isLoading) => {
  if (!isLoading && !project.value) {
    fetchProject();
  }
}, { immediate: true });

async function fetchProject() {
  // Don't fetch while projects list is still loading (ID not resolved yet)
  if (projectsLoading.value) return;

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

function formatDate(date: Date): string {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = String(d.getFullYear()).slice(-2);
  return `${day}.${month}.${year}`;
}

function getStatusSeverity(status: DocumentStatus): "success" | "warn" | "danger" | "secondary" | "info" | "contrast" | undefined {
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

function editDocument(doc: Document) {
  editingDocument.value = doc;
  editForm.title = doc.title;
  editForm.status = doc.status;
  showEditDialog.value = true;
}

function saveDocument() {
  if (!editingDocument.value) return;

  const index = documents.value.findIndex(d => d.id === editingDocument.value!.id);
  if (index !== -1) {
    documents.value[index] = {
      ...documents.value[index],
      title: editForm.title,
      status: editForm.status,
    };
  }

  showEditDialog.value = false;
  editingDocument.value = null;

  toast.add({
    severity: 'success',
    summary: 'Document Updated',
    detail: 'Document has been updated successfully.',
    life: 3000
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
    // TODO: Call API to delete document
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

function goBack() {
  router.push({ name: 'projects' });
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
    // Auto-fill title from filename if empty
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
</script>

<template>
  <div class="project-detail-view">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <ProgressSpinner />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <i class="pi pi-exclamation-triangle"></i>
      <h3>Error loading project</h3>
      <p>{{ error }}</p>
      <Button icon="pi pi-refresh" label="Try Again" @click="fetchProject" />
    </div>

    <!-- Project Content -->
    <template v-else>
      <!-- Breadcrumb / Back link -->
      <div class="project-breadcrumb">
        <Button
          icon="pi pi-arrow-left"
          label="Back to Projects"
          text
          size="small"
          @click="goBack"
        />
      </div>

      <!-- Project Header -->
      <div class="project-header">
        <div class="project-info">
          <h1 class="project-title">{{ project?.name }}</h1>
          <p v-if="project?.description" class="project-description">{{ project.description }}</p>
        </div>
        <div class="project-actions">
          <Button
            icon="pi pi-cog"
            label="Settings"
            outlined
            size="small"
            @click="router.push({ name: 'project-settings', params: { id: projectSlug } })"
          />
        </div>
      </div>

      <!-- Documents Table Container -->
      <div class="data-table-container">
        <!-- Toolbar -->
        <div class="table-toolbar">
          <div class="table-toolbar-left">
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
              class="status-filter"
            />
          </div>

          <div class="table-toolbar-right">
            <Button
              icon="pi pi-upload"
              label="Upload Document"
              outlined
              size="small"
              @click="openUploadDialog"
            />
            <Button
              icon="pi pi-cog"
              outlined
              size="small"
              aria-label="Settings"
              @click="toggleSettings"
            />
            <Popover ref="settingsPopover" class="settings-popover">
              <div class="settings-panel">
                <div class="settings-header">Columns</div>
                <div class="settings-item">
                  <span class="settings-label">Document Type</span>
                  <ToggleSwitch v-model="columnSettings.documentType" />
                </div>
                <div class="settings-item">
                  <span class="settings-label">Document Name</span>
                  <ToggleSwitch v-model="columnSettings.documentName" disabled />
                </div>
                <div class="settings-item">
                  <span class="settings-label">Modified Date</span>
                  <ToggleSwitch v-model="columnSettings.modifiedDate" />
                </div>
                <div class="settings-item">
                  <span class="settings-label">Status</span>
                  <ToggleSwitch v-model="columnSettings.status" />
                </div>
                <div class="settings-item">
                  <span class="settings-label">Version</span>
                  <ToggleSwitch v-model="columnSettings.version" />
                </div>
              </div>
            </Popover>
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

        <!-- Data Table -->
        <DataTable
          :value="documents"
          :loading="loading"
          :filters="filters"
          :globalFilterFields="['title']"
          :first="first"
          :rows="rows"
          dataKey="id"
          stripedRows
          @row-click="(e) => navigateToDocument(e.data)"
          class="documents-table"
          :pt="{
            table: { class: 'w-full' },
            bodyRow: { class: 'cursor-pointer hover:bg-gray-50' }
          }"
        >
          <template #empty>
            <div class="empty-state">
              <i class="pi pi-file"></i>
              <h3>No documents found</h3>
              <p>Upload a document to get started.</p>
              <Button icon="pi pi-upload" label="Upload Document" @click="openUploadDialog" />
            </div>
          </template>

          <Column
            v-if="columnSettings.documentType"
            header="Type"
            style="width: 60px"
          >
            <template #body="{ data }">
              <i :class="'pi ' + sanitizeIcon(data.documentType?.meta?.icon)" class="doc-type-icon"></i>
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
              <span class="document-link">{{ data.title }}</span>
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
              <span class="date-text">{{ data.currentVersion ? formatDate(data.currentVersion.uploadedAt) : '—' }}</span>
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
              <span class="version-text">{{ data.currentVersion ? `v${data.currentVersion.version}` : '—' }}</span>
            </template>
          </Column>

          <Column header="" style="width: 100px" :exportable="false">
            <template #body="{ data }">
              <div class="action-buttons">
                <Button
                  icon="pi pi-pencil"
                  text
                  rounded
                  size="small"
                  aria-label="Edit"
                  @click.stop="editDocument(data)"
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
        <div class="table-pagination">
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

    <!-- Edit Document Dialog -->
    <Dialog
      v-model:visible="showEditDialog"
      header="Edit Document"
      modal
      :style="{ width: '450px' }"
    >
      <div class="dialog-form">
        <div class="form-field">
          <FloatLabel variant="on">
            <InputText
              id="docTitle"
              v-model="editForm.title"
              class="w-full"
            />
            <label for="docTitle">Document Name</label>
          </FloatLabel>
        </div>

        <div class="form-field">
          <FloatLabel variant="on">
            <Select
              id="docStatus"
              v-model="editForm.status"
              :options="statusOptions.filter(o => o.value !== null)"
              optionLabel="label"
              optionValue="value"
              class="w-full"
            />
            <label for="docStatus">Status</label>
          </FloatLabel>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <Button
            label="Cancel"
            text
            severity="secondary"
            @click="showEditDialog = false"
          />
          <Button
            label="Save"
            @click="saveDocument"
          />
        </div>
      </template>
    </Dialog>

    <!-- Upload Document Dialog -->
    <Dialog
      v-model:visible="showUploadDialog"
      header="Upload Document"
      modal
      :style="{ width: '500px' }"
    >
      <div class="dialog-form">
        <div class="form-field">
          <FileUpload
            mode="basic"
            accept=".pdf"
            :maxFileSize="50000000"
            chooseLabel="Select PDF"
            class="w-full"
            @select="onFileSelect"
          />
          <small v-if="uploadForm.file" class="file-selected">
            Selected: {{ uploadForm.file.name }}
          </small>
        </div>

        <div class="form-field">
          <FloatLabel variant="on">
            <InputText
              id="uploadTitle"
              v-model="uploadForm.title"
              class="w-full"
            />
            <label for="uploadTitle">Document Title</label>
          </FloatLabel>
        </div>

        <div class="form-field">
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
        <div class="dialog-footer">
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
  </div>
</template>

<style scoped>
.project-detail-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  text-align: center;
  color: var(--text-secondary);
}

.error-container i {
  font-size: 48px;
  margin-bottom: 16px;
  color: var(--color-danger);
}

.error-container h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 8px 0;
}

.error-container p {
  margin: 0 0 24px 0;
}

/* Breadcrumb */
.project-breadcrumb {
  padding: 0;
}

/* Project Header */
.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 0 0 8px 0;
}

.project-actions {
  flex-shrink: 0;
}

.project-title {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 32px;
  line-height: 1.25;
  color: var(--text-color);
  margin: 0;
}

.project-description {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: var(--text-secondary);
  margin: 8px 0 0 0;
}

/* Table Container */
.data-table-container {
  background-color: var(--ui-input-fill-default);
  border: 1px solid var(--ui-input-fill-disabled);
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.table-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--ui-button-outlined-stroke);
  gap: 16px;
}

.table-toolbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.table-toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-filter {
  min-width: 120px;
}

.documents-table {
  flex: 1;
}

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

.doc-type-icon {
  font-size: 18px;
  color: var(--text-secondary);
}

.document-link {
  color: var(--primary-color);
  font-weight: 500;
}

.date-text {
  color: var(--text-secondary);
}

.version-text {
  color: var(--text-secondary);
  font-weight: 500;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 4px;
  opacity: 0.6;
}

.action-buttons:hover {
  opacity: 1;
}

.table-pagination {
  display: flex;
  justify-content: center;
  padding: 8px 16px;
  border-top: 1px solid var(--ui-button-outlined-stroke);
}

.table-pagination :deep(.p-paginator) {
  background: transparent;
  border: none;
  padding: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px;
  text-align: center;
  color: var(--text-secondary);
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 16px;
  color: var(--text-muted);
}

.empty-state h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 8px 0;
}

.empty-state p {
  margin: 0 0 24px 0;
}

/* Settings Panel */
.settings-panel {
  min-width: 200px;
  background: white;
  border-radius: 12px;
}

.settings-header {
  padding: 12px 16px;
  font-weight: 600;
  font-size: 14px;
  color: var(--ui-input-label);
}

.settings-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 16px;
  font-size: 14px;
  color: var(--ui-button-primary);
}

.settings-item .settings-label {
  flex: 1;
}

/* Edit Dialog */
.dialog-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 8px 0;
}

.form-field {
  width: 100%;
}

.form-field :deep(.p-inputtext),
.form-field :deep(.p-select) {
  width: 100%;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}

.file-selected {
  display: block;
  margin-top: 8px;
  color: var(--text-secondary);
}

/* Responsive */
@media (max-width: 768px) {
  .table-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .table-toolbar-right {
    flex-wrap: wrap;
  }

  .project-title {
    font-size: 24px;
  }
}
</style>
