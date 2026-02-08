<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useAuth } from "@/composables/useAuth";
import { useMainStore } from '@/stores/mainStore';
import { getDisplayName } from '@/utils/avatar';
import type { ThemeMode } from '@/types';

// PrimeVue Components
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Paginator from 'primevue/paginator';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import ToggleSwitch from 'primevue/toggleswitch';
import FloatLabel from 'primevue/floatlabel';
import SelectButton from 'primevue/selectbutton';

const auth = useAuth();
const store = useMainStore();

// Dev mode check
const isDev = import.meta.env.DEV;

const decodedToken = auth.decodedToken;

// Profile form data (editable)
const profileData = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
});

const saving = ref(false);

// Notifications
const receiveEmailNotifications = ref(false);

// Appearance
const themeOptions = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'System', value: 'auto' },
];
const selectedTheme = computed(() => store.theme);

function onThemeChange(value: ThemeMode) {
  if (!value) return;
  store.setTheme(value);
  auth.updateProfile({ themePreference: value });
}

// Edit dialog
const showEditDialog = ref(false);
const editForm = ref({
  firstName: '',
  lastName: '',
  phone: '',
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
  const user = auth.getCurrentUser();
  return getDisplayName(user ?? { email: '' });
});

function populateFromUser() {
  const user = auth.getCurrentUser();
  if (user) {
    profileData.value = {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
    };
  }
}

// Populate profile data from currentUser ref
watch(auth.currentUser, () => {
  populateFromUser();
}, { immediate: true });

onMounted(async () => {
  if (!auth.currentUser.value) {
    await auth.fetchCurrentUser();
  }
  populateFromUser();
});

function openEditDialog() {
  editForm.value = {
    firstName: profileData.value.firstName,
    lastName: profileData.value.lastName,
    phone: profileData.value.phone,
  };
  showEditDialog.value = true;
}

function closeEditDialog() {
  showEditDialog.value = false;
}

async function saveProfile() {
  saving.value = true;

  // Optimistic update
  profileData.value.firstName = editForm.value.firstName;
  profileData.value.lastName = editForm.value.lastName;
  profileData.value.phone = editForm.value.phone;
  showEditDialog.value = false;

  try {
    await auth.updateProfile({
      firstName: editForm.value.firstName,
      lastName: editForm.value.lastName,
      phone: editForm.value.phone,
    });
  } catch {
    populateFromUser();
  } finally {
    saving.value = false;
  }
}

function onPageChange(event: { first: number; rows: number }) {
  first.value = event.first;
  rows.value = event.rows;
}
</script>

<template>
  <div class="flex flex-col h-full p-0">
    <div class="max-w-[980px] mx-auto w-full flex flex-col md:px-0 px-3">
      <!-- User Name Heading -->
      <div class="p-4">
        <h1 class="font-semibold text-[32px] leading-[1.25] text-[var(--text-color)] m-0">{{ fullName }}</h1>
      </div>

      <!-- General Information Section -->
      <div class="flex items-center justify-between p-4 gap-2">
        <h2 class="font-semibold text-2xl leading-[1.25] text-[var(--text-color)] m-0">General Information</h2>
        <Button
          icon="pi pi-pencil"
          label="Edit"
          size="small"
          @click="openEditDialog"
        />
      </div>

      <!-- Profile Fields (Read-only) -->
      <div class="flex flex-col">
        <div class="flex md:flex-row flex-col md:gap-6 gap-0 p-4">
          <div class="flex-1 flex flex-col gap-1.5">
            <label class="font-semibold text-sm leading-5 text-[var(--ui-input-label)]">Email</label>
            <p class="font-normal text-sm leading-5 text-[var(--ui-button-primary)] m-0 py-2 px-0">{{ profileData.email || 'Placeholder' }}</p>
          </div>
          <div class="flex-1 flex flex-col gap-1.5">
            <label class="font-semibold text-sm leading-5 text-[var(--ui-input-label)]">Phone Number</label>
            <p class="font-normal text-sm leading-5 text-[var(--ui-button-primary)] m-0 py-2 px-0">{{ profileData.phone || 'Placeholder' }}</p>
          </div>
        </div>

        <div class="flex md:flex-row flex-col md:gap-6 gap-0 p-4">
          <div class="flex-1 flex flex-col gap-1.5">
            <label class="font-semibold text-sm leading-5 text-[var(--ui-input-label)]">First Name</label>
            <p class="font-normal text-sm leading-5 text-[var(--ui-button-primary)] m-0 py-2 px-0">{{ profileData.firstName || 'Placeholder' }}</p>
          </div>
          <div class="flex-1 flex flex-col gap-1.5">
            <label class="font-semibold text-sm leading-5 text-[var(--ui-input-label)]">Last Name</label>
            <p class="font-normal text-sm leading-5 text-[var(--ui-button-primary)] m-0 py-2 px-0">{{ profileData.lastName || 'Placeholder' }}</p>
          </div>
        </div>
      </div>

      <!-- Appearance Section -->
      <div class="flex flex-col p-4 gap-4">
        <h2 class="font-semibold text-2xl leading-[1.25] text-[var(--text-color)] m-0">Appearance</h2>
        <div class="flex flex-col gap-2">
          <SelectButton
            :modelValue="selectedTheme"
            :options="themeOptions"
            optionLabel="label"
            optionValue="value"
            @update:modelValue="onThemeChange"
          />
          <p v-if="selectedTheme === 'auto'" class="text-sm text-[var(--text-secondary)] m-0">
            Follows your operating system preference
          </p>
        </div>
      </div>

      <!-- Notifications Section -->
      <div class="flex md:flex-row md:items-center flex-col items-start justify-between p-4 gap-2 md:gap-2 max-md:gap-4">
        <h2 class="font-semibold text-2xl leading-[1.25] text-[var(--text-color)] m-0">Notifications</h2>
        <div class="flex items-center gap-2">
          <span class="font-medium text-sm leading-5 text-[var(--ui-input-label)]">Receive email notifications</span>
          <ToggleSwitch v-model="receiveEmailNotifications" />
        </div>
      </div>

      <!-- Access Section -->
      <div class="flex items-center justify-between p-4 gap-2">
        <h2 class="font-semibold text-2xl leading-[1.25] text-[var(--text-color)] m-0">Access</h2>
      </div>

      <!-- Dev: JWT Debug (collapsible) -->
      <details v-if="isDev" class="mx-4 mb-4 p-3 bg-[var(--surface-ground)] border border-dashed border-[var(--ui-input-border)] rounded-lg">
        <summary class="cursor-pointer font-semibold text-sm text-[var(--text-secondary)]">Decoded JWT (Dev Only)</summary>
        <pre class="mt-3 p-3 bg-[var(--surface-card)] rounded text-xs overflow-x-auto max-h-[400px] overflow-y-auto">{{ JSON.stringify(decodedToken, null, 2) }}</pre>
      </details>

      <!-- Access Table -->
      <div class="access-table-container bg-[var(--ui-input-fill-default)] border border-[var(--ui-input-fill-disabled)] rounded-[10px] overflow-hidden mx-4 mb-4 md:mx-4 md:mb-4 max-md:mx-3 max-md:mb-3">
        <DataTable
          :value="accessData"
          :first="first"
          :rows="rows"
          dataKey="id"
          class="access-table w-full"
          :pt="{
            table: { class: 'w-full' },
            bodyRow: { class: 'access-row' }
          }"
        >
          <Column field="project" header="Project" sortable>
            <template #body="{ data }">
              <span class="text-[var(--primary-color)] font-normal">{{ data.project }}</span>
            </template>
          </Column>
          <Column field="documentName" header="Document Name" sortable>
            <template #body="{ data }">
              <span class="text-[var(--primary-color)] font-normal">{{ data.documentName }}</span>
            </template>
          </Column>
          <Column field="access" header="Access" sortable>
            <template #body="{ data }">
              <span class="text-[var(--ui-input-label)] font-normal">{{ data.access }}</span>
            </template>
          </Column>
        </DataTable>

        <!-- Pagination -->
        <div class="table-pagination flex justify-center py-2 px-4 border-t border-[var(--ui-button-outlined-stroke)]">
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
      <div class="flex flex-col gap-4 py-2 px-0">
        <div class="w-full">
          <FloatLabel variant="on">
            <InputText
              id="firstName"
              v-model="editForm.firstName"
              class="w-full"
            />
            <label for="firstName">First Name</label>
          </FloatLabel>
        </div>

        <div class="w-full">
          <FloatLabel variant="on">
            <InputText
              id="lastName"
              v-model="editForm.lastName"
              class="w-full"
            />
            <label for="lastName">Lastname</label>
          </FloatLabel>
        </div>

        <div class="w-full">
          <FloatLabel variant="on">
            <InputText
              id="phone"
              v-model="editForm.phone"
              class="w-full"
            />
            <label for="phone">Phone Number</label>
          </FloatLabel>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-4">
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
.access-table :deep(.p-datatable-thead > tr > th) {
  background-color: var(--surface-ground);
  color: var(--ui-input-label);
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
  font-size: 14px;
  line-height: 20px;
}

.table-pagination :deep(.p-paginator) {
  background: transparent;
  border: none;
  padding: 0;
}
</style>
