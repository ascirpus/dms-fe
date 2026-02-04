<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, maxLength, email } from '@vuelidate/validators';
import { useAuth } from '@/composables/useAuth';
import { ProjectsService } from '@/services/ProjectsService';
import type { Project } from '@/types/Project';

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
const api = new ProjectsService(auth.apiClient);

// Form state
const saving = ref(false);
const form = reactive({
  name: '',
  selectedUser: null as { id: string; name: string; email: string } | null,
  selectedUsers: [] as { id: string; name: string; email: string }[],
  currentEmail: '',
  inviteEmails: [] as string[]
});

// Mock users for selection (replace with actual API call)
const availableUsers = ref([
  { id: '1', name: 'John Doe', email: 'john@company.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@company.com' },
  { id: '3', name: 'Bob Wilson', email: 'bob@company.com' },
  { id: '4', name: 'Alice Brown', email: 'alice@company.com' }
]);

// Filter out already selected users from dropdown
const filteredUsers = computed(() => {
  const selectedIds = form.selectedUsers.map(u => u.id);
  return availableUsers.value.filter(u => !selectedIds.includes(u.id));
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

// Reset form when dialog opens
watch(() => props.visible, (newVal) => {
  if (newVal) {
    resetForm();
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
  if (form.selectedUser && !form.selectedUsers.find(u => u.id === form.selectedUser!.id)) {
    form.selectedUsers.push(form.selectedUser);
    form.selectedUser = null;
  }
}

function removeUser(userId: string) {
  form.selectedUsers = form.selectedUsers.filter(u => u.id !== userId);
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
    const createdProject = await api.createProject({
      name: form.name,
      description: '' // Add description field if needed
    });

    // TODO: Send user invites via API
    // await api.inviteUsers(createdProject.id, form.selectedUsers.map(u => u.id));
    // await api.inviteByEmail(createdProject.id, form.inviteEmails);

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

        <!-- Users Select -->
        <div class="form-field">
          <label for="users">Users</label>
          <Select
            id="users"
            v-model="form.selectedUser"
            :options="filteredUsers"
            optionLabel="name"
            placeholder="Select One or Many"
            class="w-full"
            @change="onUserSelect"
          />
        </div>

        <!-- Selected Users List -->
        <div v-if="form.selectedUsers.length > 0" class="selected-users">
          <div
            v-for="user in form.selectedUsers"
            :key="user.id"
            class="selected-user-item"
          >
            <span class="user-name">{{ user.name }}</span>
            <Button
              icon="pi pi-trash"
              text
              rounded
              size="small"
              severity="secondary"
              aria-label="Remove user"
              @click="removeUser(user.id)"
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
