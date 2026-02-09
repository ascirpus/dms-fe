<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useNotifications } from '@/composables/useNotifications';
import type { NotificationPreferences } from '@/types/Notification';

import ToggleSwitch from 'primevue/toggleswitch';
import ProgressSpinner from 'primevue/progressspinner';

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

const eventGroups: EventGroup[] = [
  {
    label: 'Project',
    events: [
      { type: 'project.user_added', label: 'Added to project', description: 'When you are added as a member to a project' },
      { type: 'project.user_removed', label: 'Removed from project', description: 'When you are removed from a project you were part of' },
    ],
  },
  {
    label: 'Documents',
    events: [
      { type: 'document.added', label: 'Document added', description: 'When a new document is uploaded to a project you belong to' },
      { type: 'document.removed', label: 'Document removed', description: 'When a document is deleted from a project you belong to' },
      { type: 'document.approved', label: 'Document approved', description: 'When a document you submitted or are assigned to is approved' },
      { type: 'document.rejected', label: 'Document rejected', description: 'When a document you submitted or are assigned to is rejected' },
    ],
  },
  {
    label: 'Document Updates',
    events: [
      { type: 'document.updated.version', label: 'Version updated', description: 'When a new version of a document is uploaded' },
      { type: 'document.updated.comment_added', label: 'Comment added', description: 'When someone adds a comment to a document you are involved with' },
      { type: 'document.updated.comment_resolved', label: 'Comment resolved', description: 'When a comment thread on a document is marked as resolved' },
    ],
  },
  {
    label: 'Deadline Reminders',
    events: [
      { type: 'document.action_date_approaching', label: 'Action date approaching', description: 'Reminder before a document\'s required action date' },
      { type: 'document.approval_deadline_approaching', label: 'Approval deadline approaching', description: 'Reminder before a document\'s approval deadline expires' },
      { type: 'document.signature_deadline_approaching', label: 'Signature deadline approaching', description: 'Reminder before a document\'s signature deadline expires' },
    ],
  },
];

const allEventTypes = eventGroups.flatMap(g => g.events.map(e => e.type));

function getChannel(eventType: string, channel: 'web' | 'email'): boolean {
  return preferences.value[eventType]?.[channel] ?? true;
}

const allWebEnabled = computed(() => allEventTypes.every(t => getChannel(t, 'web')));
const allEmailEnabled = computed(() => allEventTypes.every(t => getChannel(t, 'email')));

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

  for (const eventType of allEventTypes) {
    previousValues[eventType] = getChannel(eventType, channel);
    if (!preferences.value[eventType]) {
      preferences.value[eventType] = { web: true, email: true };
    }
    preferences.value[eventType][channel] = value;
  }

  try {
    await updatePreferences({ ...preferences.value });
  } catch {
    for (const eventType of allEventTypes) {
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
    <h2 class="font-semibold text-2xl leading-[1.25] text-[var(--text-color)] m-0">Notifications</h2>

    <div v-if="loading" class="flex items-center justify-center py-12">
      <ProgressSpinner style="width: 40px; height: 40px" />
    </div>

    <template v-else>
      <div class="flex items-center gap-4 px-1">
        <span class="flex-1"></span>
        <div class="w-14 flex flex-col items-center gap-1">
          <span class="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Web</span>
          <ToggleSwitch
            data-testid="toggle-all-web"
            :modelValue="allWebEnabled"
            @update:modelValue="(val: boolean) => setAllChannel('web', val)"
          />
        </div>
        <div class="w-14 flex flex-col items-center gap-1">
          <span class="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Email</span>
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
