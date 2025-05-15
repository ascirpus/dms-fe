<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { useVuelidate } from '@vuelidate/core';
import { required, maxLength } from '@vuelidate/validators';
import type { Project } from '@/types/Project';

// PrimeVue Components
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Menu from 'primevue/menu';
import ConfirmDialog from 'primevue/confirmdialog';
import { useAuth } from "@/composables/useAuth.ts";
import { ProjectsService } from "@/services/ProjectsService.ts";

const router = useRouter();
const toast = useToast();
const confirm = useConfirm();
const projectMenu = ref();
const auth = useAuth();

const api = new ProjectsService(auth.apiClient);

// State
const loading = ref(true);
const error = ref<string | null>(null);
const projects = ref<Project[]>([]);
const createProjectDialog = ref(false);
const saving = ref(false);
const newProject = reactive({
  name: '',
  description: ''
});

// Validation rules
const rules = computed(() => ({
  name: { required, maxLength: maxLength(255) }
}));
const v$ = useVuelidate(rules, newProject);

// Menu items for project context menu
const menuItems = ref([
  {
    label: 'Edit',
    icon: 'pi pi-pencil',
    command: () => { editSelectedProject(); }
  },
  {
    label: 'Delete',
    icon: 'pi pi-trash',
    command: () => { confirmDeleteProject(); }
  }
]);

// Selected project for menu actions
const selectedProject = ref<Project | null>(null);

// Fetch projects on component mount
onMounted(() => {
  fetchProjects();
});

// Methods
async function fetchProjects() {
  loading.value = true;
  error.value = null;

  try {
    await api.fetchProjects().then((response) => {
      projects.value = response;
    });
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error occurred';
    console.error('Error fetching projects:', err);
  } finally {
    loading.value = false;
  }
}

function openCreateProjectDialog() {
  newProject.name = '';
  newProject.description = '';
  v$.value.$reset();
  createProjectDialog.value = true;
}

async function createProject() {
  const isValid = await v$.value.$validate();
  if (!isValid) return;

  saving.value = true;

  try {
    // Replace with your actual API call
    const response = await fetch('/api/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newProject)
    });

    if (!response.ok) {
      throw new Error('Failed to create project');
    }

    const createdProject = await response.json();
    projects.value.push(createdProject);

    createProjectDialog.value = false;
    toast.add({
      severity: 'success',
      summary: 'Project Created',
      detail: `Project "${createdProject.name}" has been created successfully.`,
      life: 3000
    });
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err instanceof Error ? err.message : 'Failed to create project',
      life: 5000
    });
  } finally {
    saving.value = false;
  }
}

function navigateToProject(id: string) {
  router.push({ name: 'project-details', params: { id } });
}

function openProjectMenu(event: Event, project: Project) {
  event.stopPropagation();
  selectedProject.value = project;
  projectMenu.value.toggle(event);
}

function editSelectedProject() {
  if (selectedProject.value) {
    router.push({
      name: 'project-details',
      params: { id: selectedProject.value.id }
    });
  }
}

function confirmDeleteProject() {
  if (!selectedProject.value) return;

  confirm.require({
    message: `Are you sure you want to delete "${selectedProject.value.name}"?`,
    header: 'Delete Project',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => deleteProject(),
    reject: () => {
      // Do nothing
    }
  });
}

async function deleteProject() {
  if (!selectedProject.value) return;

  try {
    // Replace with your actual API call
    const response = await fetch(`/api/projects/${selectedProject.value.id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete project');
    }

    // Remove project from list
    projects.value = projects.value.filter(p => p.id !== selectedProject.value?.id);

    toast.add({
      severity: 'success',
      summary: 'Project Deleted',
      detail: `Project "${selectedProject.value.name}" has been deleted.`,
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

function formatDate(dateString: Date): string {
  return new Intl.DateTimeFormat('default', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(dateString);
}
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold text-gray-900">Projects</h1>
      </div>
    </header>

    <main class="flex-grow">
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
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
                Error loading projects
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
                    @click="fetchProjects"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Project List -->
        <div v-else>
          <!-- Create Project Button -->
          <div class="mb-6 flex justify-between items-center">
            <div class="flex-1"></div>
            <Button
                icon="pi pi-plus"
                label="New Project"
                @click="openCreateProjectDialog"
                severity="primary"
            />
          </div>

          <!-- No Projects State -->
          <div v-if="!projects.length" class="text-center py-12 bg-gray-50 rounded-lg">
            <i class="pi pi-folder-open text-5xl text-gray-400 mb-4"></i>
            <h3 class="text-lg font-medium text-gray-900">No projects found</h3>
            <p class="mt-1 text-sm text-gray-500">Get started by creating a new project.</p>
            <div class="mt-6">
              <Button
                  icon="pi pi-plus"
                  label="Create Project"
                  @click="openCreateProjectDialog"
                  severity="primary"
              />
            </div>
          </div>

          <!-- Projects Grid -->
          <div v-else class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div
                v-for="project in projects"
                :key="project.id"
                class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200 cursor-pointer"
                @click="navigateToProject(project.id)"
            >
              <div class="px-4 py-5 sm:p-6">
                <div class="flex items-center">
                  <div class="flex-shrink-0 bg-blue-100 rounded-md p-3">
                    <i class="pi pi-folder text-blue-600 text-xl"></i>
                  </div>
                  <div class="ml-5 w-0 flex-1">
                    <h3 class="text-lg font-medium text-gray-900 truncate">
                      {{ project.name }}
                    </h3>
                    <p class="mt-1 text-sm text-gray-500">
                      {{ formatDate(project.createdAt) }}
                    </p>
                  </div>
                </div>
                <div class="mt-4">
                  <p class="text-sm text-gray-500 line-clamp-2">
                    {{ project.description || 'No description provided' }}
                  </p>
                </div>
                <div class="mt-6 flex items-center justify-between">
                  <div class="flex">
                    <!-- Display users or document count -->
                    <div class="text-sm text-gray-500 flex items-center">
                      <i class="pi pi-file mr-1"></i>
                      {{ project.documents?.length || 0 }} documents
                    </div>
                  </div>
                  <Button
                      icon="pi pi-ellipsis-v"
                      text
                      rounded
                      aria-label="Options"
                      @click.stop="openProjectMenu($event, project)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Project Context Menu -->
    <Menu ref="projectMenu" :model="menuItems" :popup="true" />

    <!-- Create Project Dialog -->
    <Dialog
        v-model:visible="createProjectDialog"
        header="Create Project"
        :modal="true"
        :style="{ width: '450px' }"
        :closable="true"
    >
      <div class="flex flex-col gap-4">
        <div class="field">
          <label for="name" class="block text-sm font-medium text-gray-700">Project Name</label>
          <InputText
              id="name"
              v-model="newProject.name"
              class="w-full mt-1"
              :class="{ 'p-invalid': v$.name.$invalid && v$.name.$dirty }"
              aria-describedby="name-error"
          />
          <small id="name-error" class="p-error" v-if="v$.name.$invalid && v$.name.$dirty">
            {{ v$.name.$errors[0].$message }}
          </small>
        </div>

        <div class="field">
          <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
          <Textarea
              id="description"
              v-model="newProject.description"
              rows="3"
              class="w-full mt-1"
          />
        </div>
      </div>

      <template #footer>
        <Button
            label="Cancel"
            icon="pi pi-times"
            @click="createProjectDialog = false"
            text
        />
        <Button
            label="Save"
            icon="pi pi-check"
            @click="createProject"
            :loading="saving"
            :disabled="v$.$invalid"
        />
      </template>
    </Dialog>

    <!-- Delete Confirmation Dialog -->
    <ConfirmDialog></ConfirmDialog>
  </div>
</template>