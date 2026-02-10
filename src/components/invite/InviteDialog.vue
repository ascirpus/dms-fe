<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from 'primevue/usetoast';
import { useInvites } from '@/composables/useInvites';
import { useProjects } from '@/composables/useProjects';
import { useParties } from '@/composables/useParties';
import type { TenantInvite, TenantRole, ProjectPartyAssignment } from '@/types';

import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import Select from 'primevue/select';
import Button from 'primevue/button';
import Tag from 'primevue/tag';

const props = defineProps<{
  visible: boolean;
  context?: {
    projectId?: string;
    projectName?: string;
    partyId?: string;
    partyName?: string;
  };
}>();

const emit = defineEmits<{
  'update:visible': [value: boolean];
  created: [invite: TenantInvite];
}>();

const { t } = useI18n();
const toast = useToast();
const { createInvite } = useInvites();
const { projects } = useProjects();
const { fetchParties, parties: partiesList } = useParties();

const form = reactive({
  email: '',
  role: 'MEMBER' as TenantRole,
});
const isSubmitting = ref(false);

const roleOptions = computed(() => [
  { label: t('inviteDialog.roleMember'), value: 'MEMBER' },
  { label: t('inviteDialog.roleAdmin'), value: 'ADMIN' },
]);

// Project assignment state
const showProjectAccess = ref(false);
const selectedProjectId = ref<string | null>(null);
const selectedPartyId = ref<string | null>(null);
const loadingParties = ref(false);

const projectOptions = computed(() => {
  if (!projects.value) return [];
  return projects.value.map(p => ({
    label: p.project.name,
    value: p.project.id,
  }));
});

const partyOptions = computed(() => {
  return partiesList.value.map(pw => ({
    label: pw.party.name,
    value: pw.party.id,
  }));
});

const hasContext = computed(() => !!props.context?.projectId);

watch(() => props.visible, (visible) => {
  if (visible) {
    form.email = '';
    form.role = 'MEMBER';
    isSubmitting.value = false;
    showProjectAccess.value = !!props.context?.projectId;
    selectedProjectId.value = props.context?.projectId ?? null;
    selectedPartyId.value = props.context?.partyId ?? null;

    if (selectedProjectId.value) {
      loadPartiesForProject(selectedProjectId.value);
    }
  }
});

watch(selectedProjectId, async (projectId) => {
  if (projectId && projectId !== props.context?.projectId) {
    selectedPartyId.value = null;
    await loadPartiesForProject(projectId);
  }
});

async function loadPartiesForProject(projectId: string) {
  loadingParties.value = true;
  try {
    await fetchParties(projectId);
  } catch {
    // parties will be empty
  } finally {
    loadingParties.value = false;
  }
}

async function submit() {
  if (!form.email.trim()) return;

  isSubmitting.value = true;
  try {
    const assignments: ProjectPartyAssignment[] = [];
    if (showProjectAccess.value && selectedProjectId.value && selectedPartyId.value) {
      const projectName = projectOptions.value.find(p => p.value === selectedProjectId.value)?.label;
      const partyName = partyOptions.value.find(p => p.value === selectedPartyId.value)?.label;
      assignments.push({
        projectId: selectedProjectId.value,
        partyId: selectedPartyId.value,
        projectName,
        partyName,
      });
    }

    const invite = await createInvite({
      email: form.email.trim(),
      role: form.role,
      projectAssignments: assignments.length > 0 ? assignments : undefined,
    });

    emit('update:visible', false);
    emit('created', invite);
    toast.add({ severity: 'success', summary: t('inviteDialog.inviteSent'), detail: t('inviteDialog.inviteSentDetail', { email: form.email }), life: 3000 });
  } catch (err: any) {
    const detail = err?.response?.status === 409
      ? t('inviteDialog.alreadyInvited')
      : err instanceof Error ? err.message : t('inviteDialog.failedToCreate');
    toast.add({ severity: 'error', summary: t('common.error'), detail, life: 5000 });
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <Dialog :visible="visible" @update:visible="emit('update:visible', $event)" :header="$t('inviteDialog.header')" modal :style="{ width: '480px' }">
    <div class="flex flex-col gap-4">
      <div class="flex flex-col gap-2">
        <label for="inviteEmail" class="font-semibold text-sm text-[var(--text-color)]">{{ $t('inviteDialog.emailAddress') }}</label>
        <InputText
          id="inviteEmail"
          v-model="form.email"
          type="email"
          :placeholder="$t('inviteDialog.emailPlaceholder')"
          class="w-full"
          @keypress.enter="submit"
        />
      </div>

      <div class="flex flex-col gap-2">
        <label for="inviteRole" class="font-semibold text-sm text-[var(--text-color)]">{{ $t('inviteDialog.role') }}</label>
        <Select
          id="inviteRole"
          v-model="form.role"
          :options="roleOptions"
          optionLabel="label"
          optionValue="value"
          class="w-full"
        />
      </div>

      <!-- Project Access Section -->
      <div v-if="projectOptions.length > 0" class="flex flex-col gap-3 border-t border-[var(--surface-border)] pt-4">
        <div class="flex items-center justify-between">
          <span class="font-semibold text-sm text-[var(--text-color)]">{{ $t('inviteDialog.grantProjectAccess') }}</span>
          <Button
            v-if="!hasContext"
            :label="showProjectAccess ? $t('common.remove') : $t('common.add')"
            :icon="showProjectAccess ? 'pi pi-minus' : 'pi pi-plus'"
            text
            size="small"
            severity="secondary"
            @click="showProjectAccess = !showProjectAccess"
          />
        </div>

        <template v-if="showProjectAccess">
          <!-- Project selection -->
          <div class="flex flex-col gap-2">
            <label class="text-sm text-[var(--text-secondary)]">{{ $t('inviteDialog.project') }}</label>
            <Tag v-if="hasContext && context?.projectName" :value="context.projectName" severity="info" />
            <Select
              v-else
              v-model="selectedProjectId"
              :options="projectOptions"
              optionLabel="label"
              optionValue="value"
              :placeholder="$t('inviteDialog.selectProject')"
              class="w-full"
            />
          </div>

          <!-- Party selection -->
          <div v-if="selectedProjectId" class="flex flex-col gap-2">
            <label class="text-sm text-[var(--text-secondary)]">{{ $t('inviteDialog.party') }}</label>
            <Tag v-if="hasContext && context?.partyName" :value="context.partyName" severity="info" />
            <Select
              v-else
              v-model="selectedPartyId"
              :options="partyOptions"
              optionLabel="label"
              optionValue="value"
              :placeholder="$t('inviteDialog.selectParty')"
              class="w-full"
              :loading="loadingParties"
              :disabled="loadingParties"
            />
            <p v-if="!loadingParties && partyOptions.length === 0 && selectedProjectId" class="text-xs text-[var(--text-secondary)] m-0">
              {{ $t('inviteDialog.noParties') }}
            </p>
          </div>
        </template>
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end gap-4">
        <Button :label="$t('common.cancel')" text severity="secondary" @click="emit('update:visible', false)" />
        <Button
          :label="$t('inviteDialog.sendInvite')"
          icon="pi pi-send"
          @click="submit"
          :disabled="!form.email.trim()"
          :loading="isSubmitting"
        />
      </div>
    </template>
  </Dialog>
</template>
