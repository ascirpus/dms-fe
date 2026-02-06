<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { useDocumentTypes } from '@/composables/useDocumentTypes';
import { sanitizeIcon } from '@/utils/documentTypeIcons';
import type { DocumentTypeDTO, CreateDocumentTypeRequest, UpdateDocumentTypeRequest } from '@/types/DocumentType';

// PrimeVue Components
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import ToggleSwitch from 'primevue/toggleswitch';
import Select from 'primevue/select';
import Popover from 'primevue/popover';
import TabMenu from 'primevue/tabmenu';
import ProgressSpinner from 'primevue/progressspinner';
import IconPicker from '@/components/base/IconPicker.vue';

const permissionInfoPopover = ref();

const toast = useToast();
const confirm = useConfirm();

const {
  documentTypes,
  loading,
  error,
  refetch,
  createDocumentType,
  updateDocumentType,
  deleteDocumentType,
} = useDocumentTypes();

// Tab navigation
const activeTab = ref(0);
const tabItems = [
  { label: 'Document Types', icon: 'pi pi-file' },
];

// Permission helpers
const permissionOptions = [
  { label: 'View', value: 1 },
  { label: 'Comment', value: 3 },
  { label: 'Decide', value: 7 },
];

function getPermissionLabel(value: number): string {
  return permissionOptions.find(o => o.value === value)?.label ?? `Custom (${value})`;
}

// Add/Edit dialog
const showDialog = ref(false);
const editing = ref<DocumentTypeDTO | null>(null);
const dialogForm = reactive({
  icon: 'pi-file',
  name: '',
  requiresApproval: false,
  defaultApprovalThreshold: 1,
  requiresSignature: false,
  defaultPermissions: 1,
});

const dialogTitle = computed(() => editing.value ? 'Edit Document Type' : 'Add Document Type');

watch(() => dialogForm.requiresApproval, (enabled) => {
  if (enabled && dialogForm.defaultApprovalThreshold < 1) {
    dialogForm.defaultApprovalThreshold = 1;
  }
});

function openAddDialog() {
  editing.value = null;
  dialogForm.icon = 'pi-file';
  dialogForm.name = '';
  dialogForm.requiresApproval = false;
  dialogForm.defaultApprovalThreshold = 1;
  dialogForm.requiresSignature = false;
  dialogForm.defaultPermissions = 1;
  showDialog.value = true;
}

function openEditDialog(dt: DocumentTypeDTO) {
  editing.value = dt;
  dialogForm.icon = sanitizeIcon(dt.meta?.icon);
  dialogForm.name = dt.name;
  dialogForm.requiresApproval = dt.requiresApproval;
  dialogForm.defaultApprovalThreshold = dt.defaultApprovalThreshold;
  dialogForm.requiresSignature = dt.requiresSignature;
  dialogForm.defaultPermissions = dt.defaultPermissions;
  showDialog.value = true;
}

async function saveDocumentType() {
  if (!dialogForm.name.trim()) {
    toast.add({
      severity: 'warn',
      summary: 'Validation',
      detail: 'Name is required',
      life: 3000,
    });
    return;
  }

  try {
    if (editing.value) {
      const data: UpdateDocumentTypeRequest = {
        name: dialogForm.name,
        requiresApproval: dialogForm.requiresApproval,
        defaultApprovalThreshold: dialogForm.defaultApprovalThreshold,
        requiresSignature: dialogForm.requiresSignature,
        defaultPermissions: dialogForm.defaultPermissions,
        meta: { icon: dialogForm.icon },
      };
      await updateDocumentType(editing.value.id, data);
      toast.add({
        severity: 'success',
        summary: 'Updated',
        detail: `Document type "${dialogForm.name}" has been updated`,
        life: 3000,
      });
    } else {
      const data: CreateDocumentTypeRequest = {
        name: dialogForm.name,
        requiresApproval: dialogForm.requiresApproval,
        defaultApprovalThreshold: dialogForm.defaultApprovalThreshold,
        requiresSignature: dialogForm.requiresSignature,
        defaultPermissions: dialogForm.defaultPermissions,
        meta: { icon: dialogForm.icon },
      };
      await createDocumentType(data);
      toast.add({
        severity: 'success',
        summary: 'Created',
        detail: `Document type "${dialogForm.name}" has been created`,
        life: 3000,
      });
    }
    showDialog.value = false;
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err instanceof Error ? err.message : 'Failed to save document type',
      life: 5000,
    });
  }
}

function confirmDelete(dt: DocumentTypeDTO) {
  confirm.require({
    message: `Are you sure you want to delete "${dt.name}"?`,
    header: 'Delete Document Type',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => handleDelete(dt),
  });
}

async function handleDelete(dt: DocumentTypeDTO) {
  try {
    await deleteDocumentType(dt.id);
    toast.add({
      severity: 'success',
      summary: 'Deleted',
      detail: `Document type "${dt.name}" has been deleted`,
      life: 3000,
    });
  } catch (err: any) {
    const detail = err?.response?.status === 400
      ? 'Cannot delete: documents are using this type'
      : err instanceof Error ? err.message : 'Failed to delete document type';
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail,
      life: 5000,
    });
  }
}
</script>

<template>
  <div class="tenant-settings-page">
    <!-- Tabs -->
    <div class="tabs-container">
      <TabMenu v-model:activeIndex="activeTab" :model="tabItems" />
    </div>

    <!-- Document Types Tab -->
    <div v-if="activeTab === 0" class="tab-content">
      <!-- Loading -->
      <div v-if="loading" class="loading-container">
        <ProgressSpinner style="width: 50px; height: 50px" />
        <span>Loading document types...</span>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="error-container">
        <i class="pi pi-exclamation-triangle"></i>
        <h3>Error loading document types</h3>
        <p>{{ error instanceof Error ? error.message : 'An unexpected error occurred' }}</p>
        <Button icon="pi pi-refresh" label="Try Again" @click="refetch" />
      </div>

      <!-- Content -->
      <template v-else>
        <!-- Toolbar -->
        <div class="table-toolbar">
          <div class="toolbar-left"></div>
          <div class="toolbar-right">
            <Button
              icon="pi pi-plus"
              label="Add Document Type"
              size="small"
              @click="openAddDialog"
            />
          </div>
        </div>

        <!-- Table -->
        <div class="table-container">
          <DataTable
            :value="documentTypes ?? []"
            dataKey="id"
            stripedRows
            class="dt-table"
          >
            <template #empty>
              <div class="empty-state">
                <i class="pi pi-file"></i>
                <h3>No document types</h3>
                <p>Create a document type to get started.</p>
                <Button
                  icon="pi pi-plus"
                  label="Add Document Type"
                  @click="openAddDialog"
                />
              </div>
            </template>

            <Column field="name" header="Name" sortable style="min-width: 200px">
              <template #body="{ data }">
                <span class="dt-name">
                  <i :class="'pi ' + sanitizeIcon(data.meta?.icon)" class="dt-icon"></i>
                  {{ data.name }}
                </span>
              </template>
            </Column>

            <Column field="requiresApproval" header="Requires Approval" style="min-width: 140px">
              <template #body="{ data }">
                <i :class="data.requiresApproval ? 'pi pi-check text-green-600' : 'pi pi-minus text-gray-400'"></i>
              </template>
            </Column>

            <Column field="defaultApprovalThreshold" header="Threshold" style="min-width: 100px">
              <template #body="{ data }">
                <span v-if="data.requiresApproval">{{ data.defaultApprovalThreshold }}</span>
                <span v-else class="text-gray-400">—</span>
              </template>
            </Column>

            <Column field="requiresSignature" header="Requires Signature" style="min-width: 140px">
              <template #body="{ data }">
                <i :class="data.requiresSignature ? 'pi pi-check text-green-600' : 'pi pi-minus text-gray-400'"></i>
              </template>
            </Column>

            <Column field="defaultPermissions" style="min-width: 160px">
              <template #header>
                <span class="column-header-with-info">
                  Required Permission
                  <i
                    class="pi pi-info-circle info-icon"
                    @click.stop="permissionInfoPopover.toggle($event)"
                  ></i>
                </span>
                <Popover ref="permissionInfoPopover">
                  <div class="info-popover-content">
                    The minimum party permission level required to access documents of this type.
                  </div>
                </Popover>
              </template>
              <template #body="{ data }">
                {{ getPermissionLabel(data.defaultPermissions) }}
              </template>
            </Column>

            <Column header="" style="width: 100px" :exportable="false">
              <template #body="{ data }">
                <div class="row-actions">
                  <Button
                    icon="pi pi-pencil"
                    text
                    rounded
                    size="small"
                    @click="openEditDialog(data)"
                    aria-label="Edit"
                  />
                  <Button
                    icon="pi pi-trash"
                    text
                    rounded
                    size="small"
                    severity="danger"
                    @click="confirmDelete(data)"
                    aria-label="Delete"
                  />
                </div>
              </template>
            </Column>
          </DataTable>
        </div>
      </template>
    </div>

    <!-- Add/Edit Dialog -->
    <Dialog
      v-model:visible="showDialog"
      :header="dialogTitle"
      modal
      :style="{ width: '480px' }"
    >
      <div class="dialog-form">
        <div class="form-field">
          <label>Icon</label>
          <IconPicker v-model="dialogForm.icon" />
        </div>

        <div class="form-field">
          <label for="dtName">Name</label>
          <InputText
            id="dtName"
            v-model="dialogForm.name"
            class="w-full"
            placeholder="e.g., Invoice, Contract"
          />
        </div>

        <div class="form-field-row">
          <label>Requires Approval</label>
          <ToggleSwitch v-model="dialogForm.requiresApproval" />
        </div>

        <div v-if="dialogForm.requiresApproval" class="form-field">
          <label for="dtThreshold">Approval Threshold</label>
          <InputNumber
            id="dtThreshold"
            v-model="dialogForm.defaultApprovalThreshold"
            class="w-full"
            :min="1"
            showButtons
          />
        </div>

        <div class="form-field-row">
          <label>Requires Signature</label>
          <ToggleSwitch v-model="dialogForm.requiresSignature" />
        </div>

        <div class="form-field">
          <label for="dtPermissions">Required Permission</label>
          <Select
            id="dtPermissions"
            v-model="dialogForm.defaultPermissions"
            :options="permissionOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
          />
          <small class="field-help">Minimum party permission level required to access documents of this type.</small>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <Button
            label="Cancel"
            text
            severity="secondary"
            @click="showDialog = false"
          />
          <Button
            :label="editing ? 'Save' : 'Create'"
            icon="pi pi-check"
            @click="saveDocumentType"
            :disabled="!dialogForm.name.trim()"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.tenant-settings-page {
  min-height: 100vh;
  background: var(--surface-ground);
}

/* Tabs */
.tabs-container {
  background: var(--surface-card);
  border-bottom: 1px solid var(--surface-border);
  padding: 0 16px;
}

:deep(.p-tabmenu-nav) {
  border: none;
}

/* Tab Content */
.tab-content {
  padding: 0;
}

/* Loading / Error */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 64px;
  color: var(--text-secondary);
}

.error-container i {
  font-size: 48px;
  color: var(--color-danger, #e74c3c);
}

.error-container h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.error-container p {
  margin: 0;
}

/* Toolbar */
.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: var(--surface-card);
  border-bottom: 1px solid var(--surface-border);
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Table */
.table-container {
  background: var(--surface-card);
}

.dt-table {
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

.dt-name {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: var(--primary-color);
}

.dt-icon {
  font-size: 16px;
  color: var(--text-secondary);
}

.row-actions {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
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

/* Dialog */
.dialog-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-field label {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-color);
}

.form-field-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.form-field-row label {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-color);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}

/* Column header with info icon */
.column-header-with-info {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.info-icon {
  font-size: 12px;
  color: var(--text-secondary);
  cursor: pointer;
}

.info-icon:hover {
  color: var(--primary-color);
}

.info-popover-content {
  max-width: 260px;
  font-size: 13px;
  line-height: 1.5;
  color: var(--text-color);
}

.field-help {
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.4;
}
</style>
