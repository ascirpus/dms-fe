<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useNotifications } from '@/composables/useNotifications';
import type { NotificationPreferences } from '@/types/Notification';

import ToggleSwitch from 'primevue/toggleswitch';
import ProgressSpinner from 'primevue/progressspinner';

const { t } = useI18n();
const { fetchPreferences, updatePreferences } = useNotifications();

const loading = ref(true);
const preferences = ref<NotificationPreferences>({});

interface EventDef {
  type: string;
  label: string;
  description: string;
}

interface EventGroup {
  label: string;
  events: EventDef[];
}

const eventGroups = computed<EventGroup[]>(() => [
  {
    label: t('profileNotifications.groupProject'),
    events: [
      { type: 'project.user_added', label: t('profileNotifications.projectUserAdded'), description: t('profileNotifications.projectUserAddedDesc') },
      { type: 'project.user_removed', label: t('profileNotifications.projectUserRemoved'), description: t('profileNotifications.projectUserRemovedDesc') },
    ],
  },
  {
    label: t('profileNotifications.groupDocuments'),
    events: [
      { type: 'document.added', label: t('profileNotifications.documentAdded'), description: t('profileNotifications.documentAddedDesc') },
      { type: 'document.removed', label: t('profileNotifications.documentRemoved'), description: t('profileNotifications.documentRemovedDesc') },
      { type: 'document.approved', label: t('profileNotifications.documentApproved'), description: t('profileNotifications.documentApprovedDesc') },
      { type: 'document.rejected', label: t('profileNotifications.documentRejected'), description: t('profileNotifications.documentRejectedDesc') },
    ],
  },
  {
    label: t('profileNotifications.groupUpdates'),
    events: [
      { type: 'document.updated.version', label: t('profileNotifications.versionUpdated'), description: t('profileNotifications.versionUpdatedDesc') },
      { type: 'document.updated.comment_added', label: t('profileNotifications.commentAdded'), description: t('profileNotifications.commentAddedDesc') },
      { type: 'document.updated.comment_resolved', label: t('profileNotifications.commentResolved'), description: t('profileNotifications.commentResolvedDesc') },
    ],
  },
  {
    label: t('profileNotifications.groupDeadlines'),
    events: [
      { type: 'document.action_date_approaching', label: t('profileNotifications.actionDateApproaching'), description: t('profileNotifications.actionDateApproachingDesc') },
      { type: 'document.approval_deadline_approaching', label: t('profileNotifications.approvalDeadlineApproaching'), description: t('profileNotifications.approvalDeadlineApproachingDesc') },
      { type: 'document.signature_deadline_approaching', label: t('profileNotifications.signatureDeadlineApproaching'), description: t('profileNotifications.signatureDeadlineApproachingDesc') },
    ],
  },
]);

const allEventTypes = computed(() => eventGroups.value.flatMap(g => g.events.map(e => e.type)));

function getChannel(eventType: string, channel: 'web' | 'email'): boolean {
  return preferences.value[eventType]?.[channel] ?? true;
}

const allWebEnabled = computed(() => allEventTypes.value.every(et => getChannel(et, 'web')));
const allEmailEnabled = computed(() => allEventTypes.value.every(et => getChannel(et, 'email')));

async function toggleChannel(eventType: string, channel: 'web' | 'email') {
  const currentValue = getChannel(eventType, channel);
  const newValue = !currentValue;

  if (!preferences.value[eventType]) {
    preferences.value[eventType] = { web: true, email: true };
  }
  preferences.value[eventType][channel] = newValue;

  try {
    await updatePreferences({ ...preferences.value });
  } catch {
    preferences.value[eventType][channel] = currentValue;
  }
}

async function setAllChannel(channel: 'web' | 'email', value: boolean) {
  const previousValues: Record<string, boolean> = {};

  for (const eventType of allEventTypes.value) {
    previousValues[eventType] = getChannel(eventType, channel);
    if (!preferences.value[eventType]) {
      preferences.value[eventType] = { web: true, email: true };
    }
    preferences.value[eventType][channel] = value;
  }

  try {
    await updatePreferences({ ...preferences.value });
  } catch {
    for (const eventType of allEventTypes.value) {
      preferences.value[eventType][channel] = previousValues[eventType];
    }
  }
}

onMounted(async () => {
  try {
    const prefs = await fetchPreferences();
    preferences.value = prefs;
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="flex flex-col gap-6">
    <h2 class="font-semibold text-2xl leading-[1.25] text-[var(--text-color)] m-0">{{ $t('profileNotifications.title') }}</h2>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <ProgressSpinner style="width: 40px; height: 40px" />
    </div>

    <template v-else>
      <div class="flex items-center gap-4 px-1">
        <span class="flex-1"></span>
        <div class="w-14 flex flex-col items-center gap-1">
          <span class="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">{{ $t('profileNotifications.web') }}</span>
          <ToggleSwitch
            data-testid="toggle-all-web"
            :modelValue="allWebEnabled"
            @update:modelValue="(val: boolean) => setAllChannel('web', val)"
          />
        </div>
        <div class="w-14 flex flex-col items-center gap-1">
          <span class="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">{{ $t('profileNotifications.email') }}</span>
          <ToggleSwitch
            data-testid="toggle-all-email"
            :modelValue="allEmailEnabled"
            @update:modelValue="(val: boolean) => setAllChannel('email', val)"
          />
        </div>
      </div>

      <div v-for="group in eventGroups" :key="group.label" class="flex flex-col">
        <div class="border-b border-[var(--surface-border)] pb-1 mb-1">
          <span class="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">{{ group.label }}</span>
        </div>
        <div
          v-for="event in group.events"
          :key="event.type"
          class="flex items-center gap-4 px-1 py-2.5 rounded-md hover:bg-[var(--surface-ground)] transition-colors"
        >
          <div class="flex-1 flex flex-col gap-0.5">
            <span class="text-sm font-medium text-[var(--text-color)]">{{ event.label }}</span>
            <span class="text-xs text-[var(--text-secondary)]">{{ event.description }}</span>
          </div>
          <div class="w-14 flex justify-center">
            <ToggleSwitch
              :modelValue="getChannel(event.type, 'web')"
              @update:modelValue="toggleChannel(event.type, 'web')"
            />
          </div>
          <div class="w-14 flex justify-center">
            <ToggleSwitch
              :modelValue="getChannel(event.type, 'email')"
              @update:modelValue="toggleChannel(event.type, 'email')"
            />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
