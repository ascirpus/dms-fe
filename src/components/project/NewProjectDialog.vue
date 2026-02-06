<script setup lang="ts">
import { computed, reactive, ref, watch, onMounted } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, maxLength, email } from '@vuelidate/validators';
import { useAuth } from '@/composables/useAuth';
import { ProjectsService } from '@/services/ProjectsService';
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
const projectsApi = new ProjectsService(auth.apiClient);
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
  const currentUser = auth.getCurrentUser();
  return currentUser?.sub;
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
    const createdProject = await projectsApi.createProject({
      name: form.name,
      description: '' // Add description field if needed
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
    <div class="dialog-container">
      <!-- Header -->
      <div class="dialog-header">
        <h2 class="dialog-title">New Project</h2>
        <Button
          icon="pi pi-times"
          text
          rounded
          aria-label="Close"
          @click="closeDialog"
          class="close-button"
        />
      </div>

      <!-- Content -->
      <div class="dialog-content">
        <!-- Project Title -->
        <div class="form-field">
          <label for="projectTitle">Project Title</label>
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
        <div v-if="hasUsersToInvite" class="form-field">
          <label for="users">Users</label>
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
        <div v-if="form.selectedUsers.length > 0" class="selected-users">
          <div
            v-for="user in form.selectedUsers"
            :key="user.userId"
            class="selected-user-item"
          >
            <span class="user-name">{{ getUserDisplayName(user) }}</span>
            <span class="user-role">{{ user.role }}</span>
            <Button
              icon="pi pi-trash"
              text
              rounded
              size="small"
              severity="secondary"
              aria-label="Remove user"
              @click="removeUser(user.userId)"
              class="remove-button"
            />
          </div>
        </div>

        <!-- Invite by Email -->
        <div class="form-field">
          <label for="inviteEmail">Invite by Email</label>
          <InputText
            id="inviteEmail"
            v-model="form.currentEmail"
            placeholder="user@company.com"
            @keyup.enter="addEmail"
          />
        </div>

        <!-- Email Invites List (shown when emails are added) -->
        <div v-if="form.inviteEmails.length > 0" class="invite-emails">
          <div
            v-for="emailAddr in form.inviteEmails"
            :key="emailAddr"
            class="email-item"
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
              class="remove-button"
            />
          </div>
        </div>

        <!-- Add Another Email Button -->
        <Button
          v-if="form.currentEmail || form.inviteEmails.length > 0"
          label="Specify Another Email"
          text
          size="small"
          class="add-email-button"
          @click="addEmail"
        />
      </div>

      <!-- Footer -->
      <div class="dialog-footer">
        <Button
          label="Cancel"
          class="cancel-button"
          @click="closeDialog"
        />
        <Button
          label="Submit"
          :class="['submit-button', { 'submit-button-active': hasFormData }]"
          :loading="saving"
          :disabled="v$.$invalid"
          @click="submit"
        />
      </div>
    </div>
  </Dialog>
</template>

<style scoped>
.dialog-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dialog-title {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 21px;
  line-height: 20px;
  color: var(--ui-input-label);
  margin: 0;
}

.close-button {
  color: var(--text-secondary);
}

.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-field label {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: var(--ui-input-label);
}

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

/* Selected Users */
.selected-users {
  display: flex;
  flex-direction: column;
}

.selected-user-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
}

.user-name {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: var(--ui-button-primary);
  flex: 1;
}

.user-role {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: var(--text-secondary);
  background-color: var(--surface-ground);
  padding: 2px 8px;
  border-radius: 4px;
  margin-left: 8px;
}

.remove-button {
  color: var(--text-secondary);
}

.remove-button:hover {
  color: var(--color-danger);
}

/* Email Invites */
.invite-emails {
  display: flex;
  flex-direction: column;
}

.email-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
  color: var(--ui-button-primary);
}

.add-email-button {
  align-self: flex-start;
  color: var(--ui-button-secondary);
  background-color: var(--ui-button-subtle);
  padding: 6px 10px;
  font-size: 14px;
}

/* Footer */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}

.cancel-button {
  background-color: var(--ui-button-subtle);
  color: var(--ui-button-secondary);
  border: none;
  height: 39px;
  padding: 6px 10px;
  font-weight: 500;
  font-size: 16px;
}

.cancel-button:hover {
  background-color: #e8ecf1;
}

.submit-button {
  background-color: var(--ui-button-tertiary);
  color: white;
  border: none;
  height: 39px;
  padding: 6px 10px;
  font-weight: 500;
  font-size: 16px;
}

.submit-button-active {
  background-color: var(--ui-button-primary);
}

.submit-button:hover:not(:disabled) {
  background-color: var(--ui-button-primary);
}

/* Dialog wrapper styles */
:deep(.new-project-dialog) {
  border: 1px solid var(--ui-button-subtle);
  border-radius: 12px;
  overflow: hidden;
}

:deep(.dialog-content-wrapper) {
  padding: 21px 22px;
}
</style>
