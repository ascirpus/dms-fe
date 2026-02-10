<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import InputIcon from 'primevue/inputicon';
import IconField from 'primevue/iconfield';
import { useProjects } from "@/composables/useProjects";
import { useWorkspace } from "@/composables/useWorkspace";
import type { ProjectListItem } from "@/services/ProjectsService";
import NewProjectDialog from "@/components/project/NewProjectDialog.vue";
import type { Project } from "@/types/Project";

const { t } = useI18n();
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

const { currentWorkspaceRole, currentWorkspaceName } = useWorkspace();
const canManageProjects = computed(() =>
  currentWorkspaceRole.value === 'OWNER' || currentWorkspaceRole.value === 'ADMIN'
);

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

const showGettingStarted = computed(() =>
  projects.value && projects.value.length > 0 && projects.value.length <= 5
);

function onProjectCreated(project: Project) {
  showNewProjectDialog.value = false;
  toast.add({
    severity: 'success',
    summary: t('projects.projectCreated'),
    detail: t('projects.projectCreatedDetail', { name: project.name }),
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
    message: t('projects.deleteProjectConfirm', { name: item.project.name }),
    header: t('projects.deleteProject'),
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
      summary: t('projects.projectDeleted'),
      detail: t('projects.projectDeletedDetail'),
      life: 3000
    });
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: err instanceof Error ? err.message : t('projects.failedToDelete'),
      life: 5000
    });
  }
}
</script>

<template>
  <div class="flex flex-col gap-4 h-full max-w-5xl mx-auto w-full">
    <!-- Error State -->
    <div v-if="error" class="flex flex-col items-center justify-center p-12 text-center bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-[10px]">
      <i class="pi pi-exclamation-triangle text-5xl mb-4 text-[var(--color-danger,#e74c3c)]"></i>
      <h3 class="text-lg font-semibold text-[var(--text-color)] m-0 mb-2">{{ $t('projects.errorLoading') }}</h3>
      <p class="m-0 mb-6 text-[var(--text-secondary)]">{{ error instanceof Error ? error.message : $t('projects.unexpectedError') }}</p>
      <Button icon="pi pi-refresh" :label="$t('common.tryAgain')" @click="refetchProjects" />
    </div>

    <template v-else>
      <!-- Toolbar -->
      <div class="flex items-center justify-between gap-4 max-md:flex-col max-md:items-stretch">
        <div class="flex items-center gap-3">
          <Button
            v-if="canManageProjects"
            icon="pi pi-plus"
            :label="$t('projects.newProject')"
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
              :placeholder="$t('projects.filterProjects')"
              size="small"
            />
          </IconField>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex items-center justify-center gap-3 p-12 text-[var(--text-secondary)]">
        <i class="pi pi-spin pi-spinner text-2xl"></i>
        <span>{{ $t('projects.loadingProjects') }}</span>
      </div>

      <!-- Empty State (Admin/Owner) -->
      <div v-else-if="!filteredProjects.length && !filterText && canManageProjects" class="flex flex-col items-center justify-center p-12 text-center text-[var(--text-secondary)]">
        <i class="pi pi-folder-open text-5xl mb-4 text-[var(--text-muted)]"></i>
        <h3 class="text-lg font-semibold text-[var(--text-color)] m-0 mb-2">{{ $t('projects.noProjects') }}</h3>
        <p class="m-0 mb-6">{{ $t('projects.getStartedCreate') }}</p>
        <Button
          icon="pi pi-plus"
          :label="$t('projects.createProject')"
          @click="showNewProjectDialog = true"
        />
      </div>

      <!-- Empty State (Member) -->
      <div v-else-if="!filteredProjects.length && !filterText && !canManageProjects" class="flex flex-col items-center justify-center p-12 text-center text-[var(--text-secondary)]">
        <i class="pi pi-users text-5xl mb-4 text-[var(--primary-color)]"></i>
        <h3 class="text-lg font-semibold text-[var(--text-color)] m-0 mb-2">
          {{ $t('projects.welcomeWorkspace', { workspace: currentWorkspaceName }) }}
        </h3>
        <p class="m-0">{{ $t('projects.waitForAccess') }}</p>
      </div>

      <!-- No filter results -->
      <div v-else-if="!filteredProjects.length && filterText" class="flex flex-col items-center justify-center p-12 text-center text-[var(--text-secondary)]">
        <i class="pi pi-search text-5xl mb-4 text-[var(--text-muted)]"></i>
        <h3 class="text-lg font-semibold text-[var(--text-color)] m-0 mb-2">{{ $t('projects.noMatchingProjects') }}</h3>
        <p class="m-0">{{ $t('projects.noProjectsMatch', { filter: filterText }) }}</p>
      </div>

      <!-- Card Grid -->
      <div v-else>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <div v-if="canManageProjects" class="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <Button
                  icon="pi pi-pencil"
                  text
                  rounded
                  size="small"
                  :aria-label="$t('common.edit')"
                  @click.stop="editRow(item)"
                />
                <Button
                  icon="pi pi-trash"
                  text
                  rounded
                  size="small"
                  severity="danger"
                  :aria-label="$t('common.delete')"
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
              <span>{{ t('projects.documentCount', { count: item.document_count }, item.document_count) }}</span>
            </div>
          </div>
        </div>

        <!-- Getting Started Tips -->
        <div v-if="showGettingStarted" class="mt-8 border border-dashed border-[var(--surface-border)] rounded-[10px] p-6">
          <h4 class="text-sm font-semibold text-[var(--text-color)] m-0 mb-4">{{ $t('projects.gettingStarted') }}</h4>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="flex items-start gap-3">
              <i class="pi pi-upload text-lg text-[var(--primary-color)] mt-0.5"></i>
              <div>
                <p class="text-sm font-medium text-[var(--text-color)] m-0">{{ $t('projects.tipUploadDocs') }}</p>
                <p class="text-xs text-[var(--text-secondary)] m-0 mt-1">{{ $t('projects.tipUploadDocsDetail') }}</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <i class="pi pi-users text-lg text-[var(--primary-color)] mt-0.5"></i>
              <div>
                <p class="text-sm font-medium text-[var(--text-color)] m-0">{{ $t('projects.tipInviteTeam') }}</p>
                <p class="text-xs text-[var(--text-secondary)] m-0 mt-1">{{ $t('projects.tipInviteTeamDetail') }}</p>
              </div>
            </div>
            <div class="flex items-start gap-3">
              <i class="pi pi-comments text-lg text-[var(--primary-color)] mt-0.5"></i>
              <div>
                <p class="text-sm font-medium text-[var(--text-color)] m-0">{{ $t('projects.tipLeaveComments') }}</p>
                <p class="text-xs text-[var(--text-secondary)] m-0 mt-1">{{ $t('projects.tipLeaveCommentsDetail') }}</p>
              </div>
            </div>
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
