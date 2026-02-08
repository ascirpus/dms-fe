<script setup lang="ts">
import { computed, reactive, ref, watch, onMounted } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, maxLength, email } from '@vuelidate/validators';
import { useAuth } from '@/composables/useAuth';
import { useProjects } from '@/composables/useProjects';
import { UsersService } from '@/services/UsersService';
import type { Project } from '@/types/Project';
import type { TenantUser } from '@/services/UsersService';

// PrimeVue Components
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';

const props = defineProps<{
  visible: boolean;
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
  'created': [project: Project];
}>();

const auth = useAuth();
const { createProject } = useProjects();
const usersApi = new UsersService(auth.apiClient);

// Form state
const saving = ref(false);
const loadingUsers = ref(false);
const form = reactive({
  name: '',
  selectedUser: null as TenantUser | null,
  selectedUsers: [] as TenantUser[],
  currentEmail: '',
  inviteEmails: [] as string[]
});

// Fetch available users from API
const availableUsers = ref<TenantUser[]>([]);

onMounted(async () => {
  if (props.visible) {
    await fetchAvailableUsers();
  }
});

async function fetchAvailableUsers() {
  loadingUsers.value = true;
  try {
    availableUsers.value = await usersApi.fetchTenantUsers();
  } catch (err) {
    console.error('Failed to fetch tenant users:', err);
    availableUsers.value = [];
  } finally {
    loadingUsers.value = false;
  }
}

// Helper to get display name for a user (firstName lastName or email fallback)
function getUserDisplayName(user: TenantUser): string {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return fullName || user.email || user.userId;
}

// Get current user ID for comparison
const currentUserId = computed(() => {
  return (auth.decodedToken.value as Record<string, unknown> | null)?.sub as string | undefined;
});

// Check if a user is the current user
const isCurrentUser = (userId: string) => {
  return userId === currentUserId.value;
};

// Filter out already selected users, add display names and current user flag
const filteredUsers = computed(() => {
  const selectedIds = form.selectedUsers.map(u => u.userId);

  return availableUsers.value
    .filter(u => !selectedIds.includes(u.userId))
    .map(u => ({
      ...u,
      displayName: getUserDisplayName(u),
      isCurrent: isCurrentUser(u.userId)
    }));
});

// Check if we have any users to show (excluding current user who can't be added)
const hasUsersToInvite = computed(() => {
  return filteredUsers.value.some(u => !u.isCurrent);
});

// Validation rules
const rules = computed(() => ({
  name: { required, maxLength: maxLength(255) }
}));
const v$ = useVuelidate(rules, form);

// Email validation for invite field
const emailRules = computed(() => ({
  currentEmail: { email }
}));
const emailV$ = useVuelidate(emailRules, form);

// Check if form has meaningful data for submit button styling
const hasFormData = computed(() => {
  return form.name.trim() !== '' ||
         form.selectedUsers.length > 0 ||
         form.inviteEmails.length > 0;
});

// Reset form and fetch users when dialog opens
watch(() => props.visible, (newVal) => {
  if (newVal) {
    resetForm();
    fetchAvailableUsers();
  }
});

function resetForm() {
  form.name = '';
  form.selectedUser = null;
  form.selectedUsers = [];
  form.currentEmail = '';
  form.inviteEmails = [];
  v$.value.$reset();
}

function closeDialog() {
  emit('update:visible', false);
}

// User selection
function onUserSelect() {
  if (!form.selectedUser) return;

  // Don't allow selecting current user
  if (form.selectedUser.isCurrent) {
    form.selectedUser = null;
    return;
  }

  // Add user to selected list (strip the extra properties we added)
  const { displayName, isCurrent, ...userData } = form.selectedUser;
  form.selectedUsers.push(userData as TenantUser);
  form.selectedUser = null;
}

function removeUser(userId: string) {
  form.selectedUsers = form.selectedUsers.filter(u => u.userId !== userId);
}

// Email invites
function addEmail() {
  const emailValue = form.currentEmail.trim();
  if (emailValue && !emailV$.value.currentEmail.$invalid && !form.inviteEmails.includes(emailValue)) {
    form.inviteEmails.push(emailValue);
    form.currentEmail = '';
  }
}

function removeEmail(emailToRemove: string) {
  form.inviteEmails = form.inviteEmails.filter(e => e !== emailToRemove);
}

// Submit form
async function submit() {
  const isValid = await v$.value.$validate();
  if (!isValid) return;

  saving.value = true;

  try {
    const createdProject = await createProject({
      name: form.name,
      description: '',
    });

    // TODO: Send user invites via API when backend endpoint is ready
    // await projectsApi.inviteUsers(createdProject.id, form.selectedUsers.map(u => u.userId));
    // await projectsApi.inviteByEmail(createdProject.id, form.inviteEmails);

    emit('created', createdProject);
    closeDialog();
  } catch (err) {
    console.error('Failed to create project:', err);
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <Dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    :modal="true"
    :closable="false"
    :style="{ width: '450px' }"
    :pt="{
      root: { class: 'new-project-dialog' },
      header: { class: 'hidden' },
      content: { class: 'dialog-content-wrapper' }
    }"
  >
    <div class="flex flex-col gap-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h2 class="font-semibold text-[21px] leading-5 text-[var(--ui-input-label)] m-0">New Project</h2>
        <Button
          icon="pi pi-times"
          text
          rounded
          aria-label="Close"
          @click="closeDialog"
          class="text-[var(--text-secondary)]"
        />
      </div>

      <!-- Content -->
      <div class="flex flex-col gap-4">
        <!-- Project Title -->
        <div class="form-field flex flex-col gap-1.5">
          <label for="projectTitle" class="font-semibold text-sm leading-5 text-[var(--ui-input-label)]">Project Title</label>
          <InputText
            id="projectTitle"
            v-model="form.name"
            placeholder="Label"
            :class="{ 'p-invalid': v$.name.$invalid && v$.name.$dirty }"
          />
          <small class="p-error" v-if="v$.name.$invalid && v$.name.$dirty">
            {{ v$.name.$errors[0]?.$message }}
          </small>
        </div>

        <!-- Users Select (only show if there are users to invite) -->
        <div v-if="hasUsersToInvite" class="form-field flex flex-col gap-1.5">
          <label for="users" class="font-semibold text-sm leading-5 text-[var(--ui-input-label)]">Users</label>
          <Select
            id="users"
            v-model="form.selectedUser"
            :options="filteredUsers"
            optionLabel="displayName"
            placeholder="Select One or Many"
            class="w-full"
            :loading="loadingUsers"
            @change="onUserSelect"
          >
            <template #option="slotProps">
              <div class="flex items-center gap-2">
                <i v-if="slotProps.option.isCurrent" class="pi pi-heart-fill text-red-400"></i>
                <i v-else class="pi pi-user text-gray-400"></i>
                <span :class="{ 'opacity-50': slotProps.option.isCurrent }">
                  {{ slotProps.option.displayName }}
                </span>
                <span v-if="slotProps.option.isCurrent" class="text-xs text-gray-500">(You)</span>
              </div>
            </template>
          </Select>
        </div>

        <!-- Selected Users List -->
        <div v-if="form.selectedUsers.length > 0" class="flex flex-col">
          <div
            v-for="user in form.selectedUsers"
            :key="user.userId"
            class="flex items-center justify-between py-2"
          >
            <span class="text-sm text-[var(--ui-button-primary)] flex-1">{{ getUserDisplayName(user) }}</span>
            <span class="text-xs text-[var(--text-secondary)] bg-[var(--surface-ground)] px-2 py-0.5 rounded ml-2">{{ user.role }}</span>
            <Button
              icon="pi pi-trash"
              text
              rounded
              size="small"
              severity="secondary"
              aria-label="Remove user"
              @click="removeUser(user.userId)"
              class="text-[var(--text-secondary)] hover:text-[var(--color-danger)]"
            />
          </div>
        </div>

        <!-- Invite by Email -->
        <div class="form-field flex flex-col gap-1.5">
          <label for="inviteEmail" class="font-semibold text-sm leading-5 text-[var(--ui-input-label)]">Invite by Email</label>
          <InputText
            id="inviteEmail"
            v-model="form.currentEmail"
            placeholder="user@company.com"
            @keyup.enter="addEmail"
          />
        </div>

        <!-- Email Invites List (shown when emails are added) -->
        <div v-if="form.inviteEmails.length > 0" class="flex flex-col">
          <div
            v-for="emailAddr in form.inviteEmails"
            :key="emailAddr"
            class="flex items-center justify-between py-2 text-sm text-[var(--ui-button-primary)]"
          >
            <span>{{ emailAddr }}</span>
            <Button
              icon="pi pi-trash"
              text
              rounded
              size="small"
              severity="secondary"
              aria-label="Remove email"
              @click="removeEmail(emailAddr)"
              class="text-[var(--text-secondary)] hover:text-[var(--color-danger)]"
            />
          </div>
        </div>

        <!-- Add Another Email Button -->
        <Button
          v-if="form.currentEmail || form.inviteEmails.length > 0"
          label="Specify Another Email"
          text
          size="small"
          class="self-start text-[var(--ui-button-secondary)] bg-[var(--ui-button-subtle)] px-2.5 py-1.5 text-sm"
          @click="addEmail"
        />
      </div>

      <!-- Footer -->
      <div class="flex justify-end gap-4">
        <Button
          label="Cancel"
          class="bg-[var(--ui-button-subtle)] text-[var(--ui-button-secondary)] border-none h-[39px] px-2.5 py-1.5 font-medium text-base hover:bg-[#e8ecf1]"
          @click="closeDialog"
        />
        <Button
          label="Submit"
          :class="[
            'bg-[var(--ui-button-tertiary)] text-white border-none h-[39px] px-2.5 py-1.5 font-medium text-base hover:enabled:bg-[var(--ui-button-primary)]',
            { '!bg-[var(--ui-button-primary)]': hasFormData }
          ]"
          :loading="saving"
          :disabled="v$.$invalid"
          @click="submit"
        />
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
.form-field :deep(.p-inputtext),
.form-field :deep(.p-select) {
  width: 100%;
  height: 33px;
  border: 1px solid var(--ui-input-border);
  border-radius: 6px;
}

.form-field :deep(.p-inputtext::placeholder) {
  color: var(--ui-button-primary);
}

:deep(.new-project-dialog) {
  border: 1px solid var(--ui-button-subtle);
  border-radius: 12px;
  overflow: hidden;
}

:deep(.dialog-content-wrapper) {
  padding: 21px 22px;
}
</style>
