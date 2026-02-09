<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import InputIcon from 'primevue/inputicon';
import IconField from 'primevue/iconfield';
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
const filterText = ref('');

const filteredProjects = computed(() => {
  if (!projects.value) return [];
  const q = filterText.value.toLowerCase();
  if (!q) return projects.value;
  return projects.value.filter(item =>
    item.project.name.toLowerCase().includes(q) ||
    (item.project.description?.toLowerCase().includes(q) ?? false)
  );
});

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

    <template v-else>
      <!-- Toolbar -->
      <div class="flex items-center justify-between gap-4 max-md:flex-col max-md:items-stretch">
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
              v-model="filterText"
              placeholder="Filter projects..."
              size="small"
            />
          </IconField>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center gap-3 p-12 text-[var(--text-secondary)]">
        <i class="pi pi-spin pi-spinner text-2xl"></i>
        <span>Loading projects...</span>
      </div>

      <!-- Empty State -->
      <div v-else-if="!filteredProjects.length && !filterText" class="flex flex-col items-center justify-center p-12 text-center text-[var(--text-secondary)]">
        <i class="pi pi-folder-open text-5xl mb-4 text-[var(--text-muted)]"></i>
        <h3 class="text-lg font-semibold text-[var(--text-color)] m-0 mb-2">No projects found</h3>
        <p class="m-0 mb-6">Get started by creating a new project.</p>
        <Button
          icon="pi pi-plus"
          label="Create Project"
          @click="showNewProjectDialog = true"
        />
      </div>

      <!-- No filter results -->
      <div v-else-if="!filteredProjects.length && filterText" class="flex flex-col items-center justify-center p-12 text-center text-[var(--text-secondary)]">
        <i class="pi pi-search text-5xl mb-4 text-[var(--text-muted)]"></i>
        <h3 class="text-lg font-semibold text-[var(--text-color)] m-0 mb-2">No matching projects</h3>
        <p class="m-0">No projects match "{{ filterText }}"</p>
      </div>

      <!-- Card Grid -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="item in filteredProjects"
          :key="item.project.id"
          class="group bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-[10px] p-5 cursor-pointer transition-colors hover:border-[var(--primary-color)]"
          @click="navigateToProject(item)"
        >
          <!-- Card Header -->
          <div class="flex items-start justify-between gap-2 mb-3">
            <h3 class="text-[15px] font-semibold text-[var(--text-color)] m-0 group-hover:text-[var(--primary-color)] transition-colors truncate">
              {{ item.project.name }}
            </h3>
            <div class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              <Button
                icon="pi pi-pencil"
                text
                rounded
                size="small"
                aria-label="Edit"
                @click.stop="editRow(item)"
              />
              <Button
                icon="pi pi-trash"
                text
                rounded
                size="small"
                severity="danger"
                aria-label="Delete"
                @click.stop="confirmDeleteRow(item)"
              />
            </div>
          </div>

          <!-- Description -->
          <p class="text-[13px] text-[var(--text-secondary)] m-0 mb-4 line-clamp-2 min-h-[2.6em]">
            {{ item.project.description || '—' }}
          </p>

          <!-- Footer -->
          <div class="flex items-center gap-1.5 text-[var(--text-secondary)] text-xs">
            <i class="pi pi-file text-xs"></i>
            <span>{{ item.document_count }} {{ item.document_count === 1 ? 'document' : 'documents' }}</span>
          </div>
        </div>
      </div>
    </template>

    <!-- New Project Dialog -->
    <NewProjectDialog
      v-model:visible="showNewProjectDialog"
      @created="onProjectCreated"
    />
  </div>
</template>
