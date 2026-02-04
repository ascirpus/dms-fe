<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { FilterMatchMode } from '@primevue/core/api';

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
import { useProjects } from "@/composables/useProjects";
import type { ProjectListItem } from "@/services/ProjectsService";
import NewProjectDialog from "@/components/project/NewProjectDialog.vue";
import type { Project } from "@/types/Project";

const router = useRouter();
const toast = useToast();
const confirm = useConfirm();

const {
  projects,
  loading,
  error,
  refetchProjects,
  getProjectUrl,
  createProject,
  deleteProject,
} = useProjects();

const showNewProjectDialog = ref(false);

// Settings popover
const settingsPopover = ref();
const columnSettings = reactive({
  project: true,
  description: true,
  documents: true,
  modifiedDate: false,
  status: false,
  version: false,
  createdBy: false,
  updatedBy: false
});

// Search and filters
const globalFilter = ref('');
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});

// Pagination
const first = ref(0);
const rows = ref(10);
const totalRecords = computed(() => projects.value?.length ?? 0);

// Helper to truncate description for preview
function truncateDescription(description: string | null, maxLength = 80): string {
  if (!description) return '—';
  if (description.length <= maxLength) return description;
  return description.substring(0, maxLength) + '...';
}

// Settings popover methods
function toggleSettings(event: Event) {
  settingsPopover.value.toggle(event);
}

// Handle project created from dialog
function onProjectCreated(project: Project) {
  showNewProjectDialog.value = false;
  toast.add({
    severity: 'success',
    summary: 'Project Created',
    detail: `Project "${project.name}" has been created successfully.`,
    life: 3000
  });
}

function navigateToProject(item: ProjectListItem) {
  router.push({ name: 'project-details', params: { id: getProjectUrl(item.project) } });
}

function editRow(item: ProjectListItem) {
  router.push({ name: 'project-details', params: { id: getProjectUrl(item.project) } });
}

function confirmDeleteRow(item: ProjectListItem) {
  confirm.require({
    message: `Are you sure you want to delete "${item.project.name}"?`,
    header: 'Delete Project',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => handleDeleteProject(item.project.id),
    reject: () => {}
  });
}

async function handleDeleteProject(projectId: string) {
  try {
    await deleteProject(projectId);

    toast.add({
      severity: 'success',
      summary: 'Project Deleted',
      detail: 'Project has been deleted successfully.',
      life: 3000
    });
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err instanceof Error ? err.message : 'Failed to delete project',
      life: 5000
    });
  }
}

function clearFilters() {
  globalFilter.value = '';
  filters.value.global.value = null;
}

function onPageChange(event: { first: number; rows: number }) {
  first.value = event.first;
  rows.value = event.rows;
}
</script>

<template>
  <div class="projects-view">
    <!-- Table Container -->
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
        </div>

        <div class="table-toolbar-right">
          <Button
            icon="pi pi-plus"
            label="New Project"
            outlined
            size="small"
            @click="showNewProjectDialog = true"
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
              <div class="settings-item settings-item-disabled">
                <span class="settings-label">Project</span>
                <ToggleSwitch v-model="columnSettings.project" disabled />
              </div>
              <div class="settings-item settings-item-disabled">
                <span class="settings-label">Description</span>
                <ToggleSwitch v-model="columnSettings.description" disabled />
              </div>
              <div class="settings-item">
                <i class="pi pi-ellipsis-v drag-handle"></i>
                <span class="settings-label">Documents</span>
                <ToggleSwitch v-model="columnSettings.documents" />
              </div>
              <div class="settings-item">
                <i class="pi pi-ellipsis-v drag-handle"></i>
                <span class="settings-label">Modified Date</span>
                <ToggleSwitch v-model="columnSettings.modifiedDate" />
              </div>
              <div class="settings-item">
                <i class="pi pi-ellipsis-v drag-handle"></i>
                <span class="settings-label">Status</span>
                <ToggleSwitch v-model="columnSettings.status" />
              </div>
              <div class="settings-item">
                <i class="pi pi-ellipsis-v drag-handle"></i>
                <span class="settings-label">Version</span>
                <ToggleSwitch v-model="columnSettings.version" />
              </div>
              <div class="settings-item">
                <i class="pi pi-ellipsis-v drag-handle"></i>
                <span class="settings-label">Created By</span>
                <ToggleSwitch v-model="columnSettings.createdBy" />
              </div>
              <div class="settings-item">
                <i class="pi pi-ellipsis-v drag-handle"></i>
                <span class="settings-label">Updated By</span>
                <ToggleSwitch v-model="columnSettings.updatedBy" />
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
        :value="projects"
        :loading="loading"
        :filters="filters"
        :globalFilterFields="['project.name', 'project.description']"
        :first="first"
        :rows="rows"
        dataKey="project.id"
        stripedRows
        @row-click="(e) => navigateToProject(e.data)"
        class="projects-table"
        :pt="{
          table: { class: 'w-full' },
          bodyRow: { class: 'cursor-pointer hover:bg-gray-50' }
        }"
      >
        <template #empty>
          <div class="empty-state">
            <i class="pi pi-folder-open"></i>
            <h3>No projects found</h3>
            <p>Get started by creating a new project.</p>
            <Button
              icon="pi pi-plus"
              label="Create Project"
              @click="openCreateProjectDialog"
            />
          </div>
        </template>

        <template #loading>
          <div class="loading-state">
            <i class="pi pi-spin pi-spinner"></i>
            <span>Loading projects...</span>
          </div>
        </template>

        <Column field="project.name" header="Project" sortable style="min-width: 200px">
          <template #body="{ data }">
            <span class="project-link">{{ data.project.name }}</span>
          </template>
        </Column>

        <Column field="project.description" header="Description" sortable style="min-width: 300px">
          <template #body="{ data }">
            <span class="description-preview">{{ truncateDescription(data.project.description) }}</span>
          </template>
        </Column>

        <!-- Document Name column - commented out until API returns document details
        <Column field="documentName" header="Document Name" sortable style="min-width: 200px">
          <template #body="{ data }">
            <span class="document-link">{{ data.documentName }}</span>
          </template>
        </Column>
        -->

        <Column field="document_count" header="Documents" sortable style="min-width: 120px">
          <template #body="{ data }">
            <span class="document-count">{{ data.document_count }}</span>
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
                @click.stop="editRow(data)"
              />
              <Button
                icon="pi pi-trash"
                text
                rounded
                size="small"
                severity="danger"
                aria-label="Delete"
                @click.stop="confirmDeleteRow(data)"
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

    <!-- New Project Dialog -->
    <NewProjectDialog
      v-model:visible="showNewProjectDialog"
      @created="onProjectCreated"
    />
  </div>
</template>

<style scoped>
.projects-view {
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
}

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

.projects-table {
  flex: 1;
}

.projects-table :deep(.p-datatable-thead > tr > th) {
  background-color: var(--surface-ground);
  color: var(--ui-input-label);
  font-weight: 600;
  font-size: 14px;
  padding: 16px;
  border-color: var(--ui-button-outlined-stroke);
}

.projects-table :deep(.p-datatable-tbody > tr > td) {
  padding: 16px;
  border-color: var(--ui-button-outlined-stroke);
  font-size: 14px;
  color: var(--ui-input-label);
}

.projects-table :deep(.p-datatable-tbody > tr:hover) {
  background-color: var(--surface-ground);
}

.project-link {
  color: var(--primary-color);
  font-weight: 500;
}

.description-preview {
  color: var(--text-secondary);
  font-size: 13px;
}

.document-count {
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

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 48px;
  color: var(--text-secondary);
}

.loading-state i {
  font-size: 24px;
}

/* Settings Panel Styles */
.settings-panel {
  min-width: 247px;
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
  gap: 8px;
  padding: 12px 16px;
  font-size: 14px;
  color: var(--ui-button-primary);
}

.settings-item-disabled {
  padding-left: 16px;
}

.settings-item-disabled .settings-label {
  flex: 1;
}

.settings-item .drag-handle {
  color: var(--text-secondary);
  cursor: grab;
}

.settings-item .settings-label {
  flex: 1;
}

.settings-item :deep(.p-toggleswitch) {
  --p-toggleswitch-checked-background: var(--ui-button-primary);
}

.settings-item-disabled :deep(.p-toggleswitch) {
  --p-toggleswitch-checked-background: var(--ui-input-fill-disabled);
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
}
</style>
