<template>
  <div class="flex flex-col min-h-screen">
    <!-- Header with Project Info -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div v-if="loading" class="h-8 w-48 bg-gray-200 animate-pulse rounded"></div>
        <div v-else class="flex items-center justify-between">
          <div>
            <div class="flex items-center">
              <Button
                  icon="pi pi-arrow-left"
                  text
                  rounded
                  aria-label="Back"
                  class="mr-2"
                  @click="router.push({ name: 'projects' })"
              />
              <h1 class="text-3xl font-bold text-gray-900">{{ project?.name }}</h1>
            </div>
            <p class="mt-1 text-sm text-gray-500">{{ project?.description }}</p>
          </div>
          <div class="flex items-center space-x-2">
            <Button
                icon="pi pi-pencil"
                label="Edit Project"
                outlined
                @click="openEditProjectDialog"
            />
          </div>
        </div>
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
                Error loading project
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
                    @click="fetchProject"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Project Content -->
        <div v-else>
          <!-- Tabs -->
          <Tabs>
            <!--TabPanel header="Documents">
              <div class="mt-6">
                <DocumentManager
                    :projectId="projectId"
                    @documentCreated="handleDocumentCreated"
                    @documentDeleted="handleDocumentDeleted"
                />
              </div>
            </TabPanel-->
            <!--TabPanel header="Users">
              <div class="mt-6">
                <ProjectUsers
                    :projectId="projectId"
                    @userAdded="handleUserAdded"
                    @userRemoved="handleUserRemoved"
                />
              </div>
            </TabPanel-->
            <!--TabPanel header="Permissions">
              <div class="mt-6">
                <ProjectPermissions
                    :projectId="projectId"
                />
              </div>
            </TabPanel-->
          </Tabs>
        </div>
      </div>
    </main>

    <!-- Edit Project Dialog -->
    <Dialog
        v-model:visible="editProjectDialog"
        header="Edit Project"
        :modal="true"
        :style="{ width: '450px' }"
    >
      <div class="flex flex-col gap-4">
        <div class="field">
          <label for="name" class="block text-sm font-medium text-gray-700">Project Name</label>
          <InputText
              id="name"
              v-model="editedProject.name"
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
              v-model="editedProject.description"
              rows="3"
              class="w-full mt-1"
          />
        </div>
      </div>

      <template #footer>
        <Button
            label="Cancel"
            icon="pi pi-times"
            @click="editProjectDialog = false"
            text
        />
        <Button
            label="Save"
            icon="pi pi-check"
            @click="updateProject"
            :loading="saving"
            :disabled="v$.$invalid"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'primevue/usetoast';
import { useVuelidate } from '@vuelidate/core';
import { required, maxLength } from '@vuelidate/validators';
import type { Project } from '@/types/Project';
import type { Document } from '@/types/Document';
import type { User } from '@/types/User';

// Components
//import DocumentManager from '@/components/project/DocumentManager.vue';
// import ProjectUsers from '@/components/ProjectUsers.vue';
// import ProjectPermissions from '@/components/ProjectPermissions.vue';

// PrimeVue Components
import { Button, ProgressSpinner, Dialog, InputText, Textarea, Tabs, TabPanel } from 'primevue';
import { useAuth } from "@/composables/useAuth.ts";
import { ProjectsService } from "@/services/ProjectsService.ts";

const route = useRoute();
const router = useRouter();
const toast = useToast();
const projectId = computed(() => route.params.id as string);

const auth = useAuth();

const api = new ProjectsService(auth.apiClient);

// State
const loading = ref(true);
const error = ref<string | null>(null);
const project = ref<Project | null>(null);
const editProjectDialog = ref(false);
const saving = ref(false);

// Edited project data
const editedProject = reactive({
  name: '',
  description: ''
});

// Validation rules
const rules = computed(() => ({
  name: { required, maxLength: maxLength(255) }
}));
const v$ = useVuelidate(rules, editedProject);

// Fetch project data on component mount
onMounted(() => {
  fetchProject();
});

// Methods
async function fetchProject() {
  loading.value = true;
  error.value = null;

  try {

    await api.fetchProjectById(projectId.value).then((response) => {
      project.value = response;
    })

  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error occurred';
    console.error('Error fetching project:', err);
  } finally {
    loading.value = false;
  }
}

function openEditProjectDialog() {
  if (!project.value) return;

  editedProject.name = project.value.name;
  editedProject.description = project.value.description || '';
  v$.value.$reset();
  editProjectDialog.value = true;
}

async function updateProject() {
  const isValid = await v$.value.$validate();
  if (!isValid || !project.value) return;

  saving.value = true;

  try {
    // Replace with your actual API call
    const response = await fetch(`/api/projects/${projectId.value}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(editedProject)
    });

    if (!response.ok) {
      throw new Error('Failed to update project');
    }

    const updatedProject = await response.json();
    project.value = updatedProject;

    editProjectDialog.value = false;
    toast.add({
      severity: 'success',
      summary: 'Project Updated',
      detail: 'Project details have been updated successfully.',
      life: 3000
    });
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err instanceof Error ? err.message : 'Failed to update project',
      life: 5000
    });
  } finally {
    saving.value = false;
  }
}

// Event handlers for child components
function handleDocumentCreated(document: Document) {
  if (project.value && project.value.documents) {
    project.value.documents.push(document);
  }
}

function handleDocumentDeleted(documentId: string) {
  if (project.value && project.value.documents) {
    project.value.documents = project.value.documents.filter(doc => doc.id !== documentId);
  }
}

function handleUserAdded(user: User) {
  if (project.value && project.value.users) {
    project.value.users.push(user);
  }
}

function handleUserRemoved(userId: string) {
  if (project.value && project.value.users) {
    project.value.users = project.value.users.filter(user => user.id !== userId);
  }
}
</script>