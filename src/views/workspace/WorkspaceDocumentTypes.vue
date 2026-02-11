<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import { useDocumentTypes } from '@/composables/useDocumentTypes';
import { sanitizeIcon, buildDocumentTypeColorMap } from '@/utils/documentTypeIcons';
import type { DocumentTypeDTO, CreateDocumentTypeRequest, UpdateDocumentTypeRequest } from '@/types/DocumentType';

import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import ToggleSwitch from 'primevue/toggleswitch';
import Select from 'primevue/select';
import Popover from 'primevue/popover';
import ProgressSpinner from 'primevue/progressspinner';
import IconPicker from '@/components/base/IconPicker.vue';

const permissionInfoPopover = ref();

const { t } = useI18n();
const toast = useToast();
const confirm = useConfirm();

const {
  documentTypes,
  loading,
  error,
  refetch,
  createDocumentType,
  updateDocumentType,
  deleteDocumentType,
} = useDocumentTypes();

const docTypeColorMap = computed(() =>
  buildDocumentTypeColorMap((documentTypes.value ?? []).map(dt => dt.id))
);

const permissionOptions = computed(() => [
  { label: t('workspaceDocTypes.permView'), value: 1 },
  { label: t('workspaceDocTypes.permComment'), value: 3 },
  { label: t('workspaceDocTypes.permDecide'), value: 7 },
]);

function getPermissionLabel(value: number): string {
  return permissionOptions.value.find(o => o.value === value)?.label ?? `Custom (${value})`;
}

const showDialog = ref(false);
const editing = ref<DocumentTypeDTO | null>(null);
const dialogForm = reactive({
  icon: 'pi-file',
  name: '',
  requiresApproval: false,
  defaultApprovalThreshold: 1,
  requiresSignature: false,
  defaultPermissions: 1,
});

const dialogTitle = computed(() => t(editing.value ? 'workspaceDocTypes.editDialog' : 'workspaceDocTypes.addDialog'));

watch(() => dialogForm.requiresApproval, (enabled) => {
  if (enabled && dialogForm.defaultApprovalThreshold < 1) {
    dialogForm.defaultApprovalThreshold = 1;
  }
});

function openAddDialog() {
  editing.value = null;
  dialogForm.icon = 'pi-file';
  dialogForm.name = '';
  dialogForm.requiresApproval = false;
  dialogForm.defaultApprovalThreshold = 1;
  dialogForm.requiresSignature = false;
  dialogForm.defaultPermissions = 1;
  showDialog.value = true;
}

function openEditDialog(dt: DocumentTypeDTO) {
  editing.value = dt;
  dialogForm.icon = sanitizeIcon(dt.meta?.icon);
  dialogForm.name = dt.name;
  dialogForm.requiresApproval = dt.requiresApproval;
  dialogForm.defaultApprovalThreshold = dt.defaultApprovalThreshold;
  dialogForm.requiresSignature = dt.requiresSignature;
  dialogForm.defaultPermissions = dt.defaultPermissions;
  showDialog.value = true;
}

async function saveDocumentType() {
  if (!dialogForm.name.trim()) {
    toast.add({
      severity: 'warn',
      summary: t('workspaceDocTypes.validation'),
      detail: t('workspaceDocTypes.nameRequired'),
      life: 3000,
    });
    return;
  }

  try {
    if (editing.value) {
      const data: UpdateDocumentTypeRequest = {
        name: dialogForm.name,
        requiresApproval: dialogForm.requiresApproval,
        defaultApprovalThreshold: dialogForm.defaultApprovalThreshold,
        requiresSignature: dialogForm.requiresSignature,
        defaultPermissions: dialogForm.defaultPermissions,
        meta: { icon: dialogForm.icon },
      };
      await updateDocumentType(editing.value.id, data);
      toast.add({
        severity: 'success',
        summary: t('workspaceDocTypes.updated'),
        detail: t('workspaceDocTypes.updatedDetail', { name: dialogForm.name }),
        life: 3000,
      });
    } else {
      const data: CreateDocumentTypeRequest = {
        name: dialogForm.name,
        requiresApproval: dialogForm.requiresApproval,
        defaultApprovalThreshold: dialogForm.defaultApprovalThreshold,
        requiresSignature: dialogForm.requiresSignature,
        defaultPermissions: dialogForm.defaultPermissions,
        meta: { icon: dialogForm.icon },
      };
      await createDocumentType(data);
      toast.add({
        severity: 'success',
        summary: t('workspaceDocTypes.created'),
        detail: t('workspaceDocTypes.createdDetail', { name: dialogForm.name }),
        life: 3000,
      });
    }
    showDialog.value = false;
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail: err instanceof Error ? err.message : t('workspaceDocTypes.failedToSave'),
      life: 5000,
    });
  }
}

function confirmDelete(dt: DocumentTypeDTO) {
  confirm.require({
    message: t('workspaceDocTypes.deleteConfirm', { name: dt.name }),
    header: t('workspaceDocTypes.deleteHeader'),
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: () => handleDelete(dt),
  });
}

async function handleDelete(dt: DocumentTypeDTO) {
  try {
    await deleteDocumentType(dt.id);
    toast.add({
      severity: 'success',
      summary: t('common.deleted'),
      detail: t('workspaceDocTypes.deletedDetail', { name: dt.name }),
      life: 3000,
    });
  } catch (err: any) {
    const detail = err?.response?.status === 400
      ? t('workspaceDocTypes.cannotDelete')
      : err instanceof Error ? err.message : t('workspaceDocTypes.failedToDelete');
    toast.add({
      severity: 'error',
      summary: t('common.error'),
      detail,
      life: 5000,
    });
  }
}
</script>

<template>
  <div class="flex flex-col">
    <div class="flex items-center justify-end mb-4">
      <Button
        icon="pi pi-plus"
        :label="$t('workspaceDocTypes.addDocumentType')"
        size="small"
        @click="openAddDialog"
      />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center gap-4 p-16 text-[var(--text-secondary)]">
      <ProgressSpinner style="width: 50px; height: 50px" />
      <span>{{ $t('workspaceDocTypes.loadingDocTypes') }}</span>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="flex flex-col items-center justify-center gap-4 p-16 text-[var(--text-secondary)]">
      <i class="pi pi-exclamation-triangle text-5xl !text-[var(--color-danger,#e74c3c)]"></i>
      <h3 class="text-lg font-semibold text-[var(--text-color)] m-0">{{ $t('workspaceDocTypes.errorLoading') }}</h3>
      <p class="m-0">{{ error instanceof Error ? error.message : $t('workspaceDocTypes.unexpectedError') }}</p>
      <Button icon="pi pi-refresh" :label="$t('common.tryAgain')" @click="refetch" />
    </div>

    <!-- Table -->
    <div v-else class="bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-[10px] overflow-hidden">
      <DataTable
        :value="documentTypes ?? []"
        dataKey="id"
        stripedRows
        class="dt-table"
      >
        <template #empty>
          <div class="flex flex-col items-center justify-center p-12 text-center text-[var(--text-secondary)]">
            <i class="pi pi-file text-5xl mb-4 text-[var(--text-muted)]"></i>
            <h3 class="text-lg font-semibold text-[var(--text-color)] m-0 mb-2">{{ $t('workspaceDocTypes.noDocTypes') }}</h3>
            <p class="m-0 mb-6">{{ $t('workspaceDocTypes.createToStart') }}</p>
            <Button
              icon="pi pi-plus"
              :label="$t('workspaceDocTypes.addDocumentType')"
              @click="openAddDialog"
            />
          </div>
        </template>

        <Column field="name" :header="$t('workspaceDocTypes.columnName')" sortable style="min-width: 200px">
          <template #body="{ data }">
            <span class="inline-flex items-center gap-2 font-medium text-[var(--primary-color)]">
              <i :class="'pi ' + sanitizeIcon(data.meta?.icon)" class="text-base" :style="{ color: docTypeColorMap.get(data.id) }"></i>
              {{ data.name }}
            </span>
          </template>
        </Column>

        <Column field="requiresApproval" :header="$t('workspaceDocTypes.columnRequiresApproval')" style="min-width: 140px">
          <template #body="{ data }">
            <i :class="data.requiresApproval ? 'pi pi-check text-green-600' : 'pi pi-minus text-gray-400'"></i>
          </template>
        </Column>

        <Column field="defaultApprovalThreshold" :header="$t('workspaceDocTypes.columnThreshold')" style="min-width: 100px">
          <template #body="{ data }">
            <span v-if="data.requiresApproval">{{ data.defaultApprovalThreshold }}</span>
            <span v-else class="text-gray-400">&mdash;</span>
          </template>
        </Column>

        <Column field="requiresSignature" :header="$t('workspaceDocTypes.columnRequiresSignature')" style="min-width: 140px">
          <template #body="{ data }">
            <i :class="data.requiresSignature ? 'pi pi-check text-green-600' : 'pi pi-minus text-gray-400'"></i>
          </template>
        </Column>

        <Column field="defaultPermissions" style="min-width: 160px">
          <template #header>
            <span class="inline-flex items-center gap-1.5">
              {{ $t('workspaceDocTypes.columnRequiredPermission') }}
              <i
                class="pi pi-info-circle text-xs text-[var(--text-secondary)] cursor-pointer hover:text-[var(--primary-color)]"
                @click.stop="permissionInfoPopover.toggle($event)"
              ></i>
            </span>
            <Popover ref="permissionInfoPopover">
              <div class="max-w-[260px] text-[13px] leading-normal text-[var(--text-color)]">
                {{ $t('workspaceDocTypes.permissionInfo') }}
              </div>
            </Popover>
          </template>
          <template #body="{ data }">
            {{ getPermissionLabel(data.defaultPermissions) }}
          </template>
        </Column>

        <Column header="" style="width: 100px" :exportable="false">
          <template #body="{ data }">
            <div class="flex justify-end gap-1">
              <Button
                icon="pi pi-pencil"
                text
                rounded
                size="small"
                @click="openEditDialog(data)"
                :aria-label="$t('common.edit')"
              />
              <Button
                icon="pi pi-trash"
                text
                rounded
                size="small"
                severity="danger"
                @click="confirmDelete(data)"
                :aria-label="$t('common.delete')"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <!-- Add/Edit Dialog -->
    <Dialog
      v-model:visible="showDialog"
      :header="dialogTitle"
      modal
      :style="{ width: '480px' }"
    >
      <div class="flex flex-col gap-4">
        <div class="flex flex-col gap-2">
          <label class="font-semibold text-sm text-[var(--text-color)]">{{ $t('workspaceDocTypes.icon') }}</label>
          <IconPicker v-model="dialogForm.icon" />
        </div>

        <div class="flex flex-col gap-2">
          <label for="dtName" class="font-semibold text-sm text-[var(--text-color)]">{{ $t('workspaceDocTypes.name') }}</label>
          <InputText
            id="dtName"
            v-model="dialogForm.name"
            class="w-full"
            :placeholder="$t('workspaceDocTypes.namePlaceholder')"
          />
        </div>

        <div class="flex items-center justify-between gap-2">
          <label class="font-semibold text-sm text-[var(--text-color)]">{{ $t('workspaceDocTypes.requiresApproval') }}</label>
          <ToggleSwitch v-model="dialogForm.requiresApproval" />
        </div>

        <div v-if="dialogForm.requiresApproval" class="flex flex-col gap-2">
          <label for="dtThreshold" class="font-semibold text-sm text-[var(--text-color)]">{{ $t('workspaceDocTypes.approvalThreshold') }}</label>
          <InputNumber
            id="dtThreshold"
            v-model="dialogForm.defaultApprovalThreshold"
            class="w-full"
            :min="1"
            showButtons
          />
        </div>

        <div class="flex items-center justify-between gap-2">
          <label class="font-semibold text-sm text-[var(--text-color)]">{{ $t('workspaceDocTypes.requiresSignature') }}</label>
          <ToggleSwitch v-model="dialogForm.requiresSignature" />
        </div>

        <div class="flex flex-col gap-2">
          <label for="dtPermissions" class="font-semibold text-sm text-[var(--text-color)]">{{ $t('workspaceDocTypes.requiredPermission') }}</label>
          <Select
            id="dtPermissions"
            v-model="dialogForm.defaultPermissions"
            :options="permissionOptions"
            optionLabel="label"
            optionValue="value"
            class="w-full"
          />
          <small class="text-[var(--text-secondary)] text-xs leading-[1.4]">{{ $t('workspaceDocTypes.permissionHint') }}</small>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-4">
          <Button
            :label="$t('common.cancel')"
            text
            severity="secondary"
            @click="showDialog = false"
          />
          <Button
            :label="editing ? $t('common.save') : $t('common.create')"
            icon="pi pi-check"
            @click="saveDocumentType"
            :disabled="!dialogForm.name.trim()"
          />
        </div>
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.dt-table {
  border: none;
}

:deep(.p-datatable-thead > tr > th) {
  background: var(--surface-card);
  border-color: var(--surface-border);
  padding: 16px;
  font-weight: 600;
  color: var(--text-color);
}

:deep(.p-datatable-tbody > tr > td) {
  border-color: var(--surface-border);
  padding: 16px;
}

:deep(.p-datatable-tbody > tr:hover) {
  background: var(--surface-hover);
}
</style>
