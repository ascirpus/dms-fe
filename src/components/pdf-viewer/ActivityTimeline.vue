<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { DocumentApproval, SignatureStatus } from '@/types/Document';
import { getAvatarColor, getInitialsFromUser, getDisplayName } from '@/utils/avatar';

const { t } = useI18n();

interface Props {
  approvals: DocumentApproval[];
  signatureStatus: SignatureStatus | null;
  loading: boolean;
}

const props = defineProps<Props>();

interface TimelineEntry {
  id: string;
  userInitials: string;
  userName: string;
  avatarColor: string;
  action: 'APPROVE' | 'DECLINE' | 'SIGN';
  comment: string | null;
  timestamp: string;
}

const timelineEntries = computed<TimelineEntry[]>(() => {
  const entries: TimelineEntry[] = [];

  for (const approval of props.approvals) {
    entries.push({
      id: approval.id,
      userInitials: getInitialsFromUser(approval.user),
      userName: getDisplayName(approval.user),
      avatarColor: getAvatarColor(approval.user.id),
      action: approval.action,
      comment: approval.comment,
      timestamp: approval.createdAt,
    });
  }

  if (props.signatureStatus) {
    for (const sig of props.signatureStatus.signatures) {
      entries.push({
        id: `sig-${sig.user.id}`,
        userInitials: getInitialsFromUser(sig.user),
        userName: getDisplayName(sig.user),
        avatarColor: getAvatarColor(sig.user.id),
        action: 'SIGN',
        comment: null,
        timestamp: sig.signedAt,
      });
    }
  }

  entries.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return entries;
});

const hasContent = computed(() =>
  props.approvals.length > 0 || (props.signatureStatus?.signatures.length ?? 0) > 0
);

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return t('documentViewer.justNow');
  if (diffMinutes < 60) return t('documentViewer.minutesAgo', { count: diffMinutes });
  if (diffHours < 24) return t('documentViewer.hoursAgo', { count: diffHours });
  if (diffDays < 7) return t('documentViewer.daysAgo', { count: diffDays });
  return date.toLocaleDateString();
}

function getActionText(entry: TimelineEntry): string {
  switch (entry.action) {
    case 'APPROVE': return t('documentViewer.approvedAction');
    case 'DECLINE': return t('documentViewer.declinedAction');
    case 'SIGN': return t('documentViewer.signedAction');
  }
}
</script>

<template>
  <div class="flex flex-col">
    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-8">
      <i class="pi pi-spinner pi-spin text-[var(--text-secondary)]"></i>
    </div>

    <!-- Empty state -->
    <div v-else-if="!hasContent" class="flex flex-col items-center justify-center py-8 gap-2">
      <i class="pi pi-clock text-2xl text-[var(--text-secondary)] opacity-40"></i>
      <p class="text-sm text-[var(--text-secondary)] m-0">{{ t('documentViewer.noActivity') }}</p>
    </div>

    <template v-else>
      <!-- Timeline -->
      <div v-if="timelineEntries.length > 0" class="flex flex-col">
        <div
          v-for="entry in timelineEntries"
          :key="entry.id"
          class="flex gap-3 px-4 py-3 border-b border-[var(--surface-border)] last:border-b-0"
        >
          <span
            class="flex items-center justify-center w-8 h-8 min-w-8 rounded-full text-white text-[11px] font-semibold select-none mt-0.5"
            :style="{ backgroundColor: entry.avatarColor }"
          >
            {{ entry.userInitials }}
          </span>
          <div class="flex-1 min-w-0">
            <div class="text-sm text-[var(--text-color)]">
              <span class="font-medium">{{ entry.userName }}</span>
              {{ getActionText(entry) }}
            </div>
            <div v-if="entry.action === 'DECLINE' && entry.comment" class="mt-1 text-sm text-[var(--text-secondary)] italic">
              "{{ entry.comment }}"
            </div>
            <div class="text-xs text-[var(--text-secondary)] mt-0.5">
              {{ formatRelativeTime(entry.timestamp) }}
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
