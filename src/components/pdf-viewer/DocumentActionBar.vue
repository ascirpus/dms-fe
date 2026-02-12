<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { DocumentStatus, type Document, type SignatureStatus } from '@/types/Document';
import Button from 'primevue/button';

const { t } = useI18n();

interface Props {
  document: Document;
  signatureStatus: SignatureStatus | null;
  loading: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  approve: [];
  decline: [];
  sign: [];
}>();

const canDecide = computed(() => props.document.effectivePermission === 'DECIDE');

const requiresApproval = computed(() => props.document.documentType?.requiresApproval ?? false);

const isApproved = computed(() => props.document.status === DocumentStatus.APPROVED);
const isDeclined = computed(() => props.document.status === DocumentStatus.DECLINED);
const isPending = computed(() => !isApproved.value && !isDeclined.value);

const approvalCount = computed(() => props.document.approvals?.filter(a => a.action === 'APPROVE').length ?? 0);
const requiredApprovals = computed(() => props.document.requiredApprovals ?? props.document.documentType?.defaultApprovalThreshold ?? 0);

const hasSignatures = computed(() => (props.signatureStatus?.signatures.length ?? 0) > 0);
const requiresSignature = computed(() => props.document.requiresSignature ?? props.document.documentType?.requiresSignature ?? false);
const canSign = computed(() => isApproved.value && requiresSignature.value);

const showApprovalRow = computed(() => requiresApproval.value);
const showSignatureRow = computed(() => hasSignatures.value || canSign.value);
const showBar = computed(() => showApprovalRow.value || showSignatureRow.value);

function formatDeadline(deadline: string | null | undefined): string | null {
  if (!deadline) return null;
  const date = new Date(deadline);
  if (date < new Date()) return t('documentViewer.deadlineExpired');
  return t('documentViewer.deadline', { date: date.toLocaleDateString() });
}
</script>

<template>
  <div v-if="showBar" class="mx-4 mb-0 bg-[var(--surface-card)] border border-[var(--surface-border)] rounded-[10px] p-4 shrink-0">
    <!-- Approval Row -->
    <div v-if="showApprovalRow" class="flex items-center justify-between gap-3 flex-wrap">
      <div class="flex items-center gap-3">
        <!-- Pending -->
        <template v-if="isPending">
          <span class="text-sm font-medium text-[var(--text-color)]">
            {{ t('documentViewer.approvalsProgress', { count: approvalCount, required: requiredApprovals }) }}
          </span>
          <span v-if="document.approvalDeadline" class="text-xs text-[var(--text-secondary)]">
            {{ formatDeadline(document.approvalDeadline) }}
          </span>
        </template>
        <!-- Approved -->
        <template v-else-if="isApproved">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium dark:bg-green-900/30 dark:text-green-400">
            <i class="pi pi-check-circle text-xs"></i>
            {{ t('documentViewer.documentApproved') }}
          </span>
        </template>
        <!-- Declined -->
        <template v-else-if="isDeclined">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium dark:bg-red-900/30 dark:text-red-400">
            <i class="pi pi-times-circle text-xs"></i>
            {{ t('documentViewer.documentDeclined') }}
          </span>
        </template>
      </div>

      <div v-if="isPending && canDecide" class="flex items-center gap-2">
        <Button
          :label="t('documentViewer.approve')"
          icon="pi pi-check"
          size="small"
          :loading="loading"
          @click="emit('approve')"
        />
        <Button
          :label="t('documentViewer.decline')"
          icon="pi pi-times"
          size="small"
          severity="danger"
          outlined
          :loading="loading"
          @click="emit('decline')"
        />
      </div>
    </div>

    <!-- Divider between rows -->
    <div v-if="showApprovalRow && showSignatureRow" class="border-t border-[var(--surface-border)] my-3"></div>

    <!-- Signature Row -->
    <div v-if="showSignatureRow" class="flex items-center justify-between gap-3 flex-wrap">
      <div class="flex items-center gap-3">
        <span class="text-sm font-medium text-[var(--text-color)]">
          {{ t('documentViewer.signaturesCount', { count: signatureStatus?.signedCount ?? 0 }) }}
        </span>
        <span v-if="document.signatureDeadline" class="text-xs text-[var(--text-secondary)]">
          {{ formatDeadline(document.signatureDeadline) }}
        </span>
      </div>

      <Button
        v-if="canSign && canDecide"
        :label="t('documentViewer.signDocument')"
        icon="pi pi-pencil"
        size="small"
        severity="secondary"
        outlined
        :loading="loading"
        @click="emit('sign')"
      />
    </div>
  </div>
</template>
