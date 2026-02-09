<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useAuth } from "@/composables/useAuth";
import { useUserPermissions } from "@/composables/useUserPermissions";
import type { PermissionLevel } from "@/types/UserPermission";

import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Paginator from 'primevue/paginator';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import FloatLabel from 'primevue/floatlabel';

const auth = useAuth();
const { overrides, loading: overridesLoading, fetchOverrides } = useUserPermissions();

const permissionLabels: Record<PermissionLevel, string> = {
  NONE: 'Blocked',
  VIEW: 'View',
  COMMENT: 'Comment',
  DECIDE: 'Decide',
};

const isDev = import.meta.env.DEV;
const decodedToken = auth.decodedToken;

const profileData = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
});

const saving = ref(false);

const showEditDialog = ref(false);
const editForm = ref({
  firstName: '',
  lastName: '',
  phone: '',
});

const first = ref(0);
const rows = ref(10);
const totalRecords = computed(() => overrides.value.length);

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

watch(auth.currentUser, () => {
  populateFromUser();
}, { immediate: true });

onMounted(async () => {
  if (!auth.currentUser.value) {
    await auth.fetchCurrentUser();
  }
  populateFromUser();
  fetchOverrides();
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
  <div class="flex flex-col gap-0">
    <!-- General Information Section -->
    <div class="flex items-center justify-between gap-2">
      <h2 class="font-semibold text-2xl leading-[1.25] text-[var(--text-color)] m-0">General Information</h2>
      <Button
        icon="pi pi-pencil"
        label="Edit"
        size="small"
        @click="openEditDialog"
      />
    </div>

    <!-- Profile Fields (Read-only) -->
    <div class="flex flex-col mt-4">
      <div class="flex md:flex-row flex-col md:gap-6 gap-0 py-2">
        <div class="flex-1 flex flex-col gap-1.5">
          <label class="font-semibold text-sm leading-5 text-[var(--ui-input-label)]">Email</label>
          <p class="font-normal text-sm leading-5 text-[var(--ui-button-primary)] m-0 py-2 px-0">{{ profileData.email || 'Placeholder' }}</p>
        </div>
        <div class="flex-1 flex flex-col gap-1.5">
          <label class="font-semibold text-sm leading-5 text-[var(--ui-input-label)]">Phone Number</label>
          <p class="font-normal text-sm leading-5 text-[var(--ui-button-primary)] m-0 py-2 px-0">{{ profileData.phone || 'Placeholder' }}</p>
        </div>
      </div>

      <div class="flex md:flex-row flex-col md:gap-6 gap-0 py-2">
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

    <!-- Dev: JWT Debug (collapsible) -->
    <details v-if="isDev" class="mt-6 p-3 bg-[var(--surface-ground)] border border-dashed border-[var(--ui-input-border)] rounded-lg">
      <summary class="cursor-pointer font-semibold text-sm text-[var(--text-secondary)]">Decoded JWT (Dev Only)</summary>
      <pre class="mt-3 p-3 bg-[var(--surface-card)] rounded text-xs overflow-x-auto max-h-[400px] overflow-y-auto">{{ JSON.stringify(decodedToken, null, 2) }}</pre>
    </details>

    <!-- Access Section (only shown when overrides exist) -->
    <template v-if="overrides.length > 0">
    <div class="flex items-center justify-between mt-6 gap-2">
      <h2 class="font-semibold text-2xl leading-[1.25] text-[var(--text-color)] m-0">Access</h2>
    </div>

    <div class="access-table-container bg-[var(--ui-input-fill-default)] border border-[var(--ui-input-fill-disabled)] rounded-[10px] overflow-hidden mt-4">
      <DataTable
        :value="overrides"
        :first="first"
        :rows="rows"
        dataKey="documentId"
        class="access-table w-full"
        :pt="{
          table: { class: 'w-full' },
          bodyRow: { class: 'access-row' }
        }"
      >
        <Column field="projectName" header="Project" sortable>
          <template #body="{ data }">
            <span class="text-[var(--primary-color)] font-normal">{{ data.projectName }}</span>
          </template>
        </Column>
        <Column field="documentTitle" header="Document Name" sortable>
          <template #body="{ data }">
            <span class="text-[var(--primary-color)] font-normal">{{ data.documentTitle }}</span>
          </template>
        </Column>
        <Column field="permission" header="Access" sortable>
          <template #body="{ data }">
            <span class="text-[var(--ui-input-label)] font-normal">{{ permissionLabels[data.permission as PermissionLevel] }}</span>
          </template>
        </Column>
      </DataTable>

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
    </template>

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
