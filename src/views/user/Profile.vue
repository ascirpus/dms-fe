<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuth } from "@/composables/useAuth";
import { getDisplayName } from '@/utils/avatar';

// PrimeVue Components
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Paginator from 'primevue/paginator';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import ToggleSwitch from 'primevue/toggleswitch';
import FloatLabel from 'primevue/floatlabel';

const auth = useAuth();

// Dev mode check
const isDev = import.meta.env.DEV;

// User profile data
const user = auth.getCurrentUser();
const decodedToken = auth.decodedToken;

// Profile form data (editable)
const profileData = ref({
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  profileCreated: '',
  lastActivity: '',
});

// Notifications
const receiveEmailNotifications = ref(false);

// Edit dialog
const showEditDialog = ref(false);
const editForm = ref({
  firstName: '',
  lastName: '',
  phoneNumber: '',
});

// Access table data (mock data for now)
interface AccessItem {
  id: string;
  project: string;
  documentName: string;
  access: string;
}

const accessData = ref<AccessItem[]>([
  { id: '1', project: 'Project Alpha', documentName: 'Requirements.pdf', access: 'View, Comment, Approve' },
  { id: '2', project: 'Project Beta', documentName: 'Design Specs.pdf', access: 'View, Comment' },
  { id: '3', project: 'Project Gamma', documentName: 'Technical Review.pdf', access: 'View' },
  { id: '4', project: 'Project Delta', documentName: 'Budget Report.pdf', access: 'View' },
  { id: '5', project: 'Project Epsilon', documentName: 'Meeting Notes.pdf', access: 'View' },
  { id: '6', project: 'Project Zeta', documentName: 'Contract Draft.pdf', access: 'View' },
  { id: '7', project: 'Project Eta', documentName: 'Proposal.pdf', access: 'View' },
  { id: '8', project: 'Project Theta', documentName: 'Analysis.pdf', access: 'View' },
]);

// Pagination
const first = ref(0);
const rows = ref(10);
const totalRecords = computed(() => accessData.value.length);

// Computed full name
const fullName = computed(() => {
  if (profileData.value.firstName || profileData.value.lastName) {
    return `${profileData.value.firstName} ${profileData.value.lastName}`.trim();
  }
  return getDisplayName(user ?? { email: '' });
});

// Initialize profile data from user/token
onMounted(() => {
  const nameParts = getDisplayName(user ?? { email: '' }).split(' ');
  profileData.value = {
    firstName: decodedToken.value?.given_name || nameParts[0] || '',
    lastName: decodedToken.value?.family_name || nameParts.slice(1).join(' ') || '',
    email: user?.email || decodedToken.value?.email || '',
    phoneNumber: decodedToken.value?.phone_number || '',
    profileCreated: formatDate(decodedToken.value?.created_at) || 'DD.MM.YY, HH:MM',
    lastActivity: formatDate(decodedToken.value?.last_login) || 'DD.MM.YY, HH:MM',
  };
});

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year}, ${hours}:${minutes}`;
}

function openEditDialog() {
  editForm.value = {
    firstName: profileData.value.firstName,
    lastName: profileData.value.lastName,
    phoneNumber: profileData.value.phoneNumber,
  };
  showEditDialog.value = true;
}

function closeEditDialog() {
  showEditDialog.value = false;
}

function saveProfile() {
  profileData.value.firstName = editForm.value.firstName;
  profileData.value.lastName = editForm.value.lastName;
  profileData.value.phoneNumber = editForm.value.phoneNumber;
  showEditDialog.value = false;
  // TODO: Save to backend
}

function onPageChange(event: { first: number; rows: number }) {
  first.value = event.first;
  rows.value = event.rows;
}
</script>

<template>
  <div class="profile-view">
    <div class="profile-content">
      <!-- User Name Heading -->
      <div class="profile-heading">
        <h1 class="user-name">{{ fullName }}</h1>
      </div>

      <!-- General Information Section -->
      <div class="section-header">
        <h2 class="section-title">General Information</h2>
        <Button
          icon="pi pi-pencil"
          label="Edit"
          size="small"
          @click="openEditDialog"
        />
      </div>

      <!-- Profile Fields (Read-only) -->
      <div class="profile-fields">
        <div class="field-row">
          <div class="field-group">
            <label class="field-label">Email</label>
            <p class="field-value">{{ profileData.email || 'Placeholder' }}</p>
          </div>
          <div class="field-group">
            <label class="field-label">Phone Number</label>
            <p class="field-value">{{ profileData.phoneNumber || 'Placeholder' }}</p>
          </div>
        </div>

        <div class="field-row">
          <div class="field-group">
            <label class="field-label">First Name</label>
            <p class="field-value">{{ profileData.firstName || 'Placeholder' }}</p>
          </div>
          <div class="field-group">
            <label class="field-label">Last Name</label>
            <p class="field-value">{{ profileData.lastName || 'Placeholder' }}</p>
          </div>
        </div>

        <div class="field-row">
          <div class="field-group">
            <label class="field-label">Profile Created</label>
            <p class="field-value">{{ profileData.profileCreated }}</p>
          </div>
          <div class="field-group">
            <label class="field-label">Last Activity</label>
            <p class="field-value">{{ profileData.lastActivity }}</p>
          </div>
        </div>
      </div>

      <!-- Notifications Section -->
      <div class="section-header section-header-inline">
        <h2 class="section-title">Notifications</h2>
        <div class="notification-toggle">
          <span class="toggle-label">Receive email notifications</span>
          <ToggleSwitch v-model="receiveEmailNotifications" />
        </div>
      </div>

      <!-- Access Section -->
      <div class="section-header">
        <h2 class="section-title">Access</h2>
      </div>

      <!-- Dev: JWT Debug (collapsible) -->
      <details v-if="isDev" class="jwt-debug">
        <summary>Decoded JWT (Dev Only)</summary>
        <pre>{{ JSON.stringify(decodedToken, null, 2) }}</pre>
      </details>

      <!-- Access Table -->
      <div class="access-table-container">
        <DataTable
          :value="accessData"
          :first="first"
          :rows="rows"
          dataKey="id"
          class="access-table"
          :pt="{
            table: { class: 'w-full' },
            bodyRow: { class: 'access-row' }
          }"
        >
          <Column field="project" header="Project" sortable>
            <template #body="{ data }">
              <span class="project-link">{{ data.project }}</span>
            </template>
          </Column>
          <Column field="documentName" header="Document Name" sortable>
            <template #body="{ data }">
              <span class="document-link">{{ data.documentName }}</span>
            </template>
          </Column>
          <Column field="access" header="Access" sortable>
            <template #body="{ data }">
              <span class="access-level">{{ data.access }}</span>
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
    </div>

    <!-- Edit General Information Dialog -->
    <Dialog
      v-model:visible="showEditDialog"
      header="General Information"
      modal
      :style="{ width: '450px' }"
      :pt="{
        root: { class: 'edit-dialog' },
        header: { class: 'edit-dialog-header' },
        content: { class: 'edit-dialog-content' }
      }"
    >
      <div class="dialog-form">
        <div class="form-field">
          <FloatLabel variant="on">
            <InputText
              id="firstName"
              v-model="editForm.firstName"
              class="w-full"
            />
            <label for="firstName">First Name</label>
          </FloatLabel>
        </div>

        <div class="form-field">
          <FloatLabel variant="on">
            <InputText
              id="lastName"
              v-model="editForm.lastName"
              class="w-full"
            />
            <label for="lastName">Lastname</label>
          </FloatLabel>
        </div>

        <div class="form-field">
          <FloatLabel variant="on">
            <InputText
              id="phoneNumber"
              v-model="editForm.phoneNumber"
              class="w-full"
            />
            <label for="phoneNumber">Phone Number</label>
          </FloatLabel>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <Button
            label="Cancel"
            text
            severity="secondary"
            @click="closeEditDialog"
          />
          <Button
            label="Submit"
            @click="saveProfile"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.profile-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0;
}

.profile-content {
  max-width: 980px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
}

/* User Name Heading */
.profile-heading {
  padding: 16px;
}

.user-name {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 32px;
  line-height: 1.25;
  color: var(--text-color);
  margin: 0;
}

/* Section Headers */
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  gap: 8px;
}

.section-header-inline {
  justify-content: space-between;
}

.section-title {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 24px;
  line-height: 1.25;
  color: var(--text-color);
  margin: 0;
}

/* Notification Toggle */
.notification-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggle-label {
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: var(--ui-input-label);
}

/* Profile Fields */
.profile-fields {
  display: flex;
  flex-direction: column;
}

.field-row {
  display: flex;
  gap: 24px;
  padding: 16px;
}

.field-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  color: var(--ui-input-label);
}

.field-value {
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: var(--ui-button-primary);
  margin: 0;
  padding: 8px 0;
}

/* Access Table */
.access-table-container {
  background-color: var(--ui-input-fill-default);
  border: 1px solid var(--ui-input-fill-disabled);
  border-radius: 10px;
  overflow: hidden;
  margin: 0 16px 16px;
}

.access-table {
  width: 100%;
}

.access-table :deep(.p-datatable-thead > tr > th) {
  background-color: var(--surface-ground);
  color: var(--ui-input-label);
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 14px;
  line-height: 20px;
  padding: 16px;
  border-color: var(--ui-button-outlined-stroke);
  border-top: 1px solid var(--ui-button-outlined-stroke);
}

.access-table :deep(.p-datatable-tbody > tr > td) {
  padding: 16px;
  border-color: var(--ui-button-outlined-stroke);
  border-top: 1px solid var(--ui-button-outlined-stroke);
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  line-height: 20px;
}

.project-link,
.document-link {
  color: var(--primary-color);
  font-weight: 400;
}

.access-level {
  color: var(--ui-input-label);
  font-weight: 400;
}

/* Pagination */
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

/* Edit Dialog */
.dialog-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 8px 0;
}

.form-field {
  width: 100%;
}

.form-field :deep(.p-inputtext) {
  width: 100%;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}

/* JWT Debug */
.jwt-debug {
  margin: 0 16px 16px;
  padding: 12px;
  background: var(--surface-ground);
  border: 1px dashed var(--ui-input-border);
  border-radius: 8px;
}

.jwt-debug summary {
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  color: var(--text-secondary);
}

.jwt-debug pre {
  margin-top: 12px;
  padding: 12px;
  background: var(--surface-card);
  border-radius: 4px;
  font-size: 12px;
  overflow-x: auto;
  max-height: 400px;
  overflow-y: auto;
}

/* Responsive */
@media (max-width: 768px) {
  .profile-content {
    padding: 0 12px;
  }

  .field-row {
    flex-direction: column;
    gap: 0;
  }

  .section-header-inline {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .access-table-container {
    margin: 0 12px 12px;
  }
}
</style>
