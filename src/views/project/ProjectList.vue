<script setup lang="ts">
import { computed, ref } from 'vue';
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

// Table filter
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
  router.push({ name: 'project-settings', params: { id: getProjectUrl(item.project) } });
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

function onPageChange(event: { first: number; rows: number }) {
  first.value = event.first;
  rows.value = event.rows;
}
</script>

<template>
  <div class="flex flex-col gap-4 h-full">
    <!-- Error State -->
    <div v-if="error" class="flex flex-col items-center justify-center p-12 text-center bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-[10px]">
      <i class="pi pi-exclamation-triangle text-5xl mb-4 text-[var(--color-danger,#e74c3c)]"></i>
      <h3 class="text-lg font-semibold text-[var(--text-color)] m-0 mb-2">Error loading projects</h3>
      <p class="m-0 mb-6 text-[var(--text-secondary)]">{{ error instanceof Error ? error.message : 'An unexpected error occurred' }}</p>
      <Button icon="pi pi-refresh" label="Try Again" @click="refetchProjects" />
    </div>

    <!-- Table Container -->
    <div v-else class="bg-[var(--ui-input-fill-default)] border border-[var(--ui-input-fill-disabled)] rounded-[10px] overflow-hidden flex flex-col flex-1">
      <!-- Toolbar -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-[var(--ui-button-outlined-stroke)] gap-4 max-md:flex-col max-md:items-stretch">
        <div class="flex items-center gap-3">
          <Button
            icon="pi pi-plus"
            label="New Project"
            outlined
            size="small"
            @click="showNewProjectDialog = true"
          />
        </div>

        <div class="flex items-center gap-3 max-md:flex-wrap">
          <IconField>
            <InputIcon class="pi pi-filter" />
            <InputText
              v-model="globalFilter"
              placeholder="Filter projects..."
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
        class="projects-table flex-1"
        :pt="{
          table: { class: 'w-full' },
          bodyRow: { class: 'cursor-pointer hover:bg-gray-50' }
        }"
      >
        <template #empty>
          <div class="flex flex-col items-center justify-center p-12 text-center text-[var(--text-secondary)]">
            <i class="pi pi-folder-open text-5xl mb-4 text-[var(--text-muted)]"></i>
            <h3 class="text-lg font-semibold text-[var(--text-color)] m-0 mb-2">No projects found</h3>
            <p class="m-0 mb-6">Get started by creating a new project.</p>
            <Button
              icon="pi pi-plus"
              label="Create Project"
              @click="showNewProjectDialog = true"
            />
          </div>
        </template>

        <template #loading>
          <div class="flex items-center justify-center gap-3 p-12 text-[var(--text-secondary)]">
            <i class="pi pi-spin pi-spinner text-2xl"></i>
            <span>Loading projects...</span>
          </div>
        </template>

        <Column field="project.name" header="Project" sortable style="min-width: 200px">
          <template #body="{ data }">
            <span class="text-[var(--primary-color)] font-medium">{{ data.project.name }}</span>
          </template>
        </Column>

        <Column field="project.description" header="Description" sortable style="min-width: 300px">
          <template #body="{ data }">
            <span class="text-[var(--text-secondary)] text-[13px]">{{ truncateDescription(data.project.description) }}</span>
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
            <span class="font-medium">{{ data.document_count }}</span>
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
      <div class="flex justify-center px-4 py-2 border-t border-[var(--ui-button-outlined-stroke)]">
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

.projects-table :deep(.p-paginator) {
  background: transparent;
  border: none;
  padding: 0;
}
</style>
