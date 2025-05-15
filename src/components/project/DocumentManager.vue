<template>
  <div class="document-manager">
    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-12">
      <ProgressSpinner />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
      <div class="flex">
        <div class="flex-shrink-0">
          <i class="pi pi-exclamation-triangle text-red-400 text-lg"></i>
        </div>
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">
            Error loading documents
          </h3>
          <div class="mt-2 text-sm text-red-700">
            {{ error }}
          </div>
          <div class="mt-4">
            <Button
                icon="pi pi-refresh"
                label="Try Again"
                severity="danger"
                outlined
                @click="fetchDocuments"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Documents Content -->
    <div v-else>
      <!-- Document Controls -->
      <div class="mb-6 flex justify-between items-center">
        <div class="w-1/3">
          <span class="p-input-icon-left w-full">
            <i class="pi pi-search" />
            <InputText
                v-model="filters.global"
                placeholder="Search documents..."
                class="w-full"
            />
          </span>
        </div>

        <div class="flex items-center space-x-2">
          <Select
              v-model="filters.status"
              :options="statusOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Status"
              class="w-40"
          />

          <Select
              v-model="filters.documentType"
              :options="documentTypeOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Document Type"
              class="w-40"
          />

          <Button
              icon="pi pi-filter-slash"
              label="Clear"
              text
              @click="clearFilters"
              v-if="isFilterActive"
          />

          <Button
              icon="pi pi-upload"
              label="Upload Document"
              severity="primary"
              @click="openUploadDialog"
          />
        </div>
      </div>

      <!-- No Documents State -->
      <div v-if="!filteredDocuments.length" class="text-center py-12 bg-gray-50 rounded-lg">
        <i class="pi pi-file text-5xl text-gray-400 mb-4"></i>
        <h3 class="text-lg font-medium text-gray-900">No documents found</h3>
        <p class="mt-1 text-sm text-gray-500" v-if="isFilterActive">
          Try adjusting your search filters
        </p>
        <p class="mt-1 text-sm text-gray-500" v-else>
          Get started by uploading a document
        </p>
        <div class="mt-6" v-if="!isFilterActive">
          <Button
              icon="pi pi-upload"
              label="Upload Document"
              @click="openUploadDialog"
              severity="primary"
          />
        </div>
      </div>

      <!-- Documents Table -->
      <DataTable
          v-else
          :value="filteredDocuments"
          :paginator="true"
          :rows="10"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
          :rowsPerPageOptions="[5, 10, 25, 50]"
          currentPageReportTemplate="Showing {first} to {last} of {totalRecords} documents"
          responsiveLayout="scroll"
          stripedRows
          v-model:filters="filters"
          filterDisplay="menu"
          :globalFilterFields="['title', 'description', 'filename', 'documentType']"
      >
        <Column field="title" header="Title" sortable>
          <template #body="{ data }">
            <div class="flex items-center">
              <FileIcon :type="getFileType(data.filename)" class="mr-2" />
              <div>
                <div class="font-medium">{{ data.title }}</div>
                <div class="text-sm text-gray-500 truncate max-w-xs">
                  {{ data.description || 'No description' }}
                </div>
              </div>
            </div>
          </template>
        </Column>

        <Column field="documentType" header="Type" sortable>
          <template #body="{ data }">
            <Tag
                :value="formatDocumentType(data.documentType)"
                :severity="getDocumentTypeSeverity(data.documentType)"
            />
          </template>
        </Column>

        <Column field="status" header="Status" sortable>
          <template #body="{ data }">
            <Tag
                :value="data.status"
                :severity="getStatusSeverity(data.status)"
            />
          </template>
        </Column>

        <Column field="createdAt" header="Created" sortable>
          <template #body="{ data }">
            {{ formatDate(data.createdAt) }}
          </template>
        </Column>

        <Column field="updatedAt" header="Updated" sortable>
          <template #body="{ data }">
            {{ formatDate(data.updatedAt) }}
          </template>
        </Column>

        <Column header="Actions" :exportable="false" style="min-width: 12rem">
          <template #body="{ data }">
            <div class="flex gap-2">
              <Button
                  icon="pi pi-eye"
                  text
                  rounded
                  @click="viewDocument(data)"
                  tooltip="View Document"
                  tooltipOptions="{ position: 'top' }"
              />
              <Button
                  icon="pi pi-pencil"
                  text
                  rounded
                  @click="editDocument(data)"
                  tooltip="Edit Details"
                  tooltipOptions="{ position: 'top' }"
              />
              <Button
                  v-if="canApproveDocument(data)"
                  icon="pi pi-check"
                  text
                  rounded
                  severity="success"
                  @click="approveDocument(data)"
                  tooltip="Approve Document"
                  tooltipOptions="{ position: 'top' }"
              />
              <Button
                  v-if="canRejectDocument(data)"
                  icon="pi pi-times"
                  text
                  rounded
                  severity="danger"
                  @click="rejectDocument(data)"
                  tooltip="Reject Document"
                  tooltipOptions="{ position: 'top' }"
              />
              <Button
                  icon="pi pi-trash"
                  text
                  rounded
                  severity="danger"
                  @click="confirmDeleteDocument(data)"
                  tooltip="Delete Document"
                  tooltipOptions="{ position: 'top' }"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Upload Document Dialog -->
    <Dialog
        v-model:visible="uploadDialog"
        header="Upload Document"
        :modal="true"
        :style="{ width: '500px' }"
    >
      <div class="flex flex-col gap-4">
        <div class="field">
          <label for="title" class="block text-sm font-medium text-gray-700">Document Title</label>
          <InputText
              id="title"
              v-model="newDocument.title"
              class="w-full mt-1"
              :class="{ 'p-invalid': v$.title.$invalid && v$.title.$dirty }"
              aria-describedby="title-error"
          />
          <small id="title-error" class="p-error" v-if="v$.title.$invalid && v$.title.$dirty">
            {{ v$.title.$errors[0].$message }}
          </small>
        </div>

        <div class="field">
          <label for="documentType" class="block text-sm font-medium text-gray-700">Document Type</label>
          <Select
              id="documentType"
              v-model="newDocument.documentType"
              :options="documentTypes"
              optionLabel="description"
              optionValue="id"
              placeholder="Select Document Type"
              class="w-full mt-1"
              :class="{ 'p-invalid': v$.documentType.$invalid && v$.documentType.$dirty }"
              aria-describedby="type-error"
          />
          <small id="type-error" class="p-error" v-if="v$.documentType.$invalid && v$.documentType.$dirty">
            {{ v$.documentType.$errors[0].$message }}
          </small>
        </div>

        <div class="field">
          <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
          <Textarea
              id="description"
              v-model="newDocument.description"
              rows="3"
              class="w-full mt-1"
          />
        </div>

        <div class="field">
          <label class="block text-sm font-medium text-gray-700">Document File</label>
          <div class="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md"
               :class="{ 'border-red-300': v$.file.$invalid && v$.file.$dirty }">
            <div class="space-y-1 text-center">
              <div v-if="!newDocument.file">
                <i class="pi pi-upload text-gray-400 text-3xl mb-4"></i>
                <p class="text-sm text-gray-500">
                  Drag and drop file here, or
                  <span class="text-blue-600 hover:text-blue-700 cursor-pointer" @click="triggerFileSelect">browse</span>
                </p>
                <p class="text-xs text-gray-500">
                  PDF or MS Office files up to 10MB
                </p>
              </div>
              <div v-else class="flex items-center justify-center">
                <FileIcon :type="getFileType(newDocument.file.name)" class="text-4xl mr-2" />
                <div class="text-sm text-gray-900">
                  {{ newDocument.file.name }}
                  <p class="text-xs text-gray-500">{{ formatFileSize(newDocument.file.size) }}</p>
                </div>
                <Button
                    icon="pi pi-times"
                    text
                    rounded
                    severity="secondary"
                    class="ml-2"
                    @click="newDocument.file = null"
                />
              </div>
            </div>

            <input
                ref="fileInput"
                type="file"
                class="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                @change="handleFileSelect"
            />
          </div>
          <small id="file-error" class="p-error" v-if="v$.file.$invalid && v$.file.$dirty">
            {{ v$.file.$errors[0].$message }}
          </small>
        </div>
      </div>

      <template #footer>
        <Button
            label="Cancel"
            icon="pi pi-times"
            @click="uploadDialog = false"
            text
        />
        <Button
            label="Upload"
            icon="pi pi-upload"
            @click="uploadDocument"
            :loading="uploading"
            :disabled="v$.$invalid"
        />
      </template>
    </Dialog>

    <!-- Edit Document Dialog -->
    <Dialog
        v-model:visible="editDialog"
        header="Edit Document"
        :modal="true"
        :style="{ width: '500px' }"
    >
      <div class="flex flex-col gap-4">
        <div class="field">
          <label for="edit-title" class="block text-sm font-medium text-gray-700">Document Title</label>
          <InputText
              id="edit-title"
              v-model="editedDocument.title"
              class="w-full mt-1"
              :class="{ 'p-invalid': v$.title.$invalid && v$.title.$dirty }"
          />
          <small class="p-error" v-if="v$.title.$invalid && v$.title.$dirty">
            {{ v$.title.$errors[0].$message }}
          </small>
        </div>

        <div class="field">
          <label for="edit-documentType" class="block text-sm font-medium text-gray-700">Document Type</label>
          <Select
              id="edit-documentType"
              v-model="editedDocument.documentType"
              :options="documentTypes"
              optionLabel="description"
              optionValue="id"
              placeholder="Select Document Type"
              class="w-full mt-1"
          />
        </div>

        <div class="field">
          <label for="edit-description" class="block text-sm font-medium text-gray-700">Description</label>
          <Textarea
              id="edit-description"
              v-model="editedDocument.description"
              rows="3"
              class="w-full mt-1"
          />
        </div>
      </div>

      <template #footer>
        <Button
            label="Cancel"
            icon="pi pi-times"
            @click="editDialog = false"
            text
        />
        <Button
            label="Save"
            icon="pi pi-check"
            @click="saveDocumentChanges"
            :loading="saving"
            :disabled="v$.$invalid"
        />
      </template>
    </Dialog>

    <!-- Document Status Dialog -->
    <Dialog
        v-model:visible="statusDialog.visible"
        :header="statusDialog.title"
        :modal="true"
        :style="{ width: '450px' }"
    >
      <div class="flex flex-col gap-4">
        <div class="text-center mb-4">
          <i :class="statusDialog.icon" class="text-5xl mb-4"></i>
          <p>{{ statusDialog.message }}</p>
        </div>

        <div class="field">
          <label for="status-comment" class="block text-sm font-medium text-gray-700">Comment (Optional)</label>
          <Textarea
              id="status-comment"
              v-model="statusDialog.comment"
              rows="3"
              class="w-full mt-1"
              placeholder="Add a comment about your decision..."
          />
        </div>
      </div>

      <template #footer>
        <Button
            :label="statusDialog.cancelLabel"
            icon="pi pi-times"
            @click="statusDialog.visible = false"
            text
        />
        <Button
            :label="statusDialog.confirmLabel"
            :icon="statusDialog.confirmIcon"
            :severity="statusDialog.severity"
            @click="confirmStatusChange"
            :loading="statusDialog.processing"
        />
      </template>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <ConfirmDialog></ConfirmDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { useVuelidate } from '@vuelidate/core';
import { required, maxLength, maxSize } from '@vuelidate/validators';
import { useRouter } from 'vue-router';
import { FilterMatchMode } from 'primevue/api';
import type { Document, DocumentType, DocumentStatus } from '@/types/Document';
import type { PermissionType } from '@/types/Permission';

// PrimeVue Components
import {
  Button,
  ProgressSpinner,
  Dialog,
  InputText,
  Textarea,
  Select,
  DataTable,
  Column,
  Tag,
  ConfirmDialog
} from 'primevue';

// Custom Components
import FileIcon from '@/components/FileIcon.vue';

const props = defineProps<{
  projectId: string;
}>();

const emit = defineEmits(['documentCreated', 'documentDeleted']);

const router = useRouter();
const toast = useToast();
const confirm = useConfirm();
const fileInput = ref<HTMLInputElement | null>(null);

// State
const loading = ref(true);
const error = ref<string | null>(null);
const documents = ref<Document[]>([]);
const documentTypes = ref<DocumentType[]>([]);
const uploadDialog = ref(false);
const editDialog = ref(false);
const uploading = ref(false);
const saving = ref(false);

// Document being edited
const selectedDocument = ref<Document | null>(null);

// Status dialog configuration
const statusDialog = reactive({
  visible: false,
  title: '',
  message: '',
  icon: '',
  confirmLabel: '',
  confirmIcon: '',
  cancelLabel: 'Cancel',
  severity: 'primary',
  processing: false,
  comment: '',
  action: '' as 'approve' | 'reject',
  document: null as Document | null
});

// New document form
const newDocument = reactive({
  title: '',
  documentType: '',
  description: '',
  file: null as File | null,
});

// Edited document form
const editedDocument = reactive({
  title: '',
  documentType: '',
  description: '',
});

// Table filters
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
  status: null as string | null,
  documentType: null as string | null
});

// Validation rules
const rules = computed(() => ({
  title: { required, maxLength: maxLength(255) },
  documentType: { required },
  file: { required, maxSize: maxSize(10 * 1024 * 1024) } // 10MB max
}));
const v$ = useVuelidate(rules, newDocument);

// Filter options
const statusOptions = [
  { label: 'All Statuses', value: null },
  { label: 'Pending', value: 'Pending' },
  { label: 'Approved', value: 'Approved' },
  { label: 'Declined', value: 'Declined' }
];

// Computed document type options for filter dropdown
const documentTypeOptions = computed(() => {
  const options = [{ label: 'All Types', value: null }];

  if (documentTypes.value.length > 0) {
    documentTypes.value.forEach(type => {
      options.push({
        label: formatDocumentType(type.id),
        value: type.id
      });
    });
  }

  return options;
});

// Computed property to check if any filter is active
const isFilterActive = computed(() => {
  return (
      filters.value.global.value !== null ||
      filters.value.status !== null ||
      filters.value.documentType !== null
  );
});

// Filtered documents based on status and type filters
const filteredDocuments = computed(() => {
  let result = [...documents.value];

  if (filters.value.status) {
    result = result.filter(doc => doc.status === filters.value.status);
  }

  if (filters.value.documentType) {
    result = result.filter(doc => doc.documentType === filters.value.documentType);
  }

  return result;
});

// Fetch documents and document types on component mount
onMounted(async () => {
  await Promise.all([
    fetchDocuments(),
    fetchDocumentTypes()
  ]);
});

// Methods
async function fetchDocuments() {
  loading.value = true;
  error.value = null;

  try {
    // Replace with your actual API call
    const response = await fetch(`/api/projects/${props.projectId}/documents`);
    if (!response.ok) {
      throw new Error('Failed to fetch documents');
    }

    documents.value = await response.json();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error occurred';
    console.error('Error fetching documents:', err);
  } finally {
    loading.value = false;
  }
}

async function fetchDocumentTypes() {
  try {
    // Replace with your actual API call
    const response = await fetch('/api/document-types');
    if (!response.ok) {
      throw new Error('Failed to fetch document types');
    }

    documentTypes.value = await response.json();
  } catch (err) {
    console.error('Error fetching document types:', err);
    // Not setting global error here as it would override document error
  }
}

function openUploadDialog() {
  newDocument.title = '';
  newDocument.documentType = '';
  newDocument.description = '';
  newDocument.file = null;
  v$.value.$reset();
  uploadDialog.value = true;
}

function triggerFileSelect() {
  fileInput.value?.click();
}

function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement;
  const files = target.files;

  if (files && files.length > 0) {
    newDocument.file = files[0];
  }
}

async function uploadDocument() {
  const isValid = await v$.value.$validate();
  if (!isValid) return;

  uploading.value = true;

  try {
    // Create form data to send file
    const formData = new FormData();
    formData.append('title', newDocument.title);
    formData.append('documentType', newDocument.documentType);
    formData.append('description', newDocument.description || '');
    if (newDocument.file) {
      formData.append('file', newDocument.file);
    }

    // Replace with your actual API call
    const response = await fetch(`/api/projects/${props.projectId}/documents`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload document');
    }

    const createdDocument = await response.json();
    documents.value.push(createdDocument);

    uploadDialog.value = false;
    emit('documentCreated', createdDocument);

    toast.add({
      severity: 'success',
      summary: 'Document Uploaded',
      detail: `Document "${createdDocument.title}" has been uploaded successfully.`,
      life: 3000
    });
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err instanceof Error ? err.message : 'Failed to upload document',
      life: 5000
    });
  } finally {
    uploading.value = false;
  }
}

function viewDocument(document: Document) {
  router.push({
    name: 'document-view',
    params: {
      projectId: props.projectId,
      documentId: document.id
    }
  });
}

function editDocument(document: Document) {
  selectedDocument.value = document;
  editedDocument.title = document.title;
  editedDocument.documentType = document.documentType || '';
  editedDocument.description = document.description || '';
  v$.value.$reset();
  editDialog.value = true;
}

async function saveDocumentChanges() {
  if (!selectedDocument.value) return;

  saving.value = true;

  try {
    // Replace with your actual API call
    const response = await fetch(`/api/documents/${selectedDocument.value.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(editedDocument)
    });

    if (!response.ok) {
      throw new Error('Failed to update document');
    }

    const updatedDocument = await response.json();

    // Update the document in the list
    const index = documents.value.findIndex(doc => doc.id === updatedDocument.id);
    if (index !== -1) {
      documents.value[index] = updatedDocument;
    }

    editDialog.value = false;
    toast.add({
      severity: 'success',
      summary: 'Document Updated',
      detail: `Document "${updatedDocument.title}" has been updated successfully.`,
      life: 3000
    });
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err instanceof Error ? err.message : 'Failed to update document',
      life: 5000
    });
  } finally {
    saving.value = false;
  }
}

function confirmDeleteDocument(document: Document) {
  confirm.require({
    message: `Are you sure you want to delete "${document.title}"?`,
    header: 'Delete Document',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => deleteDocument(document),
    reject: () => {
      // Do nothing
    }
  });
}

async function deleteDocument(document: Document) {
  try {
    // Replace with your actual API call
    const response = await fetch(`/api/documents/${document.id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete document');
    }

    // Remove document from list
    documents.value = documents.value.filter(doc => doc.id !== document.id);
    emit('documentDeleted', document.id);

    toast.add({
      severity: 'success',
      summary: 'Document Deleted',
      detail: `Document "${document.title}" has been deleted.`,
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

function approveDocument(document: Document) {
  statusDialog.title = 'Approve Document';
  statusDialog.message = `Are you sure you want to approve "${document.title}"?`;
  statusDialog.icon = 'pi pi-check-circle text-green-500';
  statusDialog.confirmLabel = 'Approve';
  statusDialog.confirmIcon = 'pi pi-check';
  statusDialog.severity = 'success';
  statusDialog.action = 'approve';
  statusDialog.document = document;
  statusDialog.comment = '';
  statusDialog.visible = true;
}

function rejectDocument(document: Document) {
  statusDialog.title = 'Reject Document';
  statusDialog.message = `Are you sure you want to reject "${document.title}"?`;
  statusDialog.icon = 'pi pi-times-circle text-red-500';
  statusDialog.confirmLabel = 'Reject';
  statusDialog.confirmIcon = 'pi pi-times';
  statusDialog.severity = 'danger';
  statusDialog.action = 'reject';
  statusDialog.document = document;
  statusDialog.comment = '';
  statusDialog.visible = true;
}

async function confirmStatusChange() {
  if (!statusDialog.document) return;

  statusDialog.processing = true;

  const newStatus = statusDialog.action === 'approve'
      ? DocumentStatus.APPROVED
      : DocumentStatus.DECLINED;

  try {
    // Replace with your actual API call
    const response = await fetch(`/api/documents/${statusDialog.document.id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        status: newStatus,
        comment: statusDialog.comment
      })
    });

    if (!response.ok) {
      throw new Error('Failed to update document status');
    }

    const updatedDocument = await response.json();

    // Update the document in the list
    const index = documents.value.findIndex(doc => doc.id === updatedDocument.id);
    if (index !== -1) {
      documents.value[index] = updatedDocument;
    }

    statusDialog.visible = false;
    toast.add({
      severity: 'success',
      summary: 'Status Updated',
      detail: `Document has been ${statusDialog.action === 'approve' ? 'approved' : 'rejected'}.`,
      life: 3000
    });
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err instanceof Error ? err.message : 'Failed to update document status',
      life: 5000
    });
  } finally {
    statusDialog.processing = false;
  }
}

function clearFilters() {
  filters.value = {
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    status: null,
    documentType: null
  };
}

// Helper methods
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('default', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDocumentType(type: string | null): string {
  if (!type) return 'Unknown';

  // Convert from snake_case to Title Case
  return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
}

function getDocumentTypeSeverity(type: string | null): string {
  if (!type) return 'secondary';

  const typeMap: Record<string, string> = {
    'project_information': 'info',
    'damage_report': 'warning',
    'inventory_report': 'success',
    'quote': 'primary',
    'confirmation': 'info',
    'hours_confirmation': 'primary',
    'invoice': 'danger'
  };

  return typeMap[type] || 'secondary';
}

function getStatusSeverity(status: DocumentStatus): string {
  const statusMap: Record<DocumentStatus, string> = {
    [DocumentStatus.PENDING]: 'warning',
    [DocumentStatus.APPROVED]: 'success',
    [DocumentStatus.DECLINED]: 'danger'
  };

  return statusMap[status] || 'secondary';
}

function getFileType(filename: string | null): string {
  if (!filename) return 'file';

  const extension = filename.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'pdf': return 'pdf';
    case 'doc':
    case 'docx': return 'word';
    case 'xls':
    case 'xlsx': return 'excel';
    case 'ppt':
    case 'pptx': return 'powerpoint';
    default: return 'file';
  }
}

// Permission checks
function canApproveDocument(document: Document): boolean {
  // In a real app, you would check user permissions here
  // For now, we'll use a simple check: document is pending and requires approval
  if (document.status !== DocumentStatus.PENDING) return false;

  const docType = documentTypes.value.find(dt => dt.id === document.documentType);
  return docType?.requiresApproval || false;
}

function canRejectDocument(document: Document): boolean {
  // Similar to approve check
  return canApproveDocument(document);
}
</script>