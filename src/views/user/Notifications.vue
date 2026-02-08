<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import ToggleSwitch from 'primevue/toggleswitch';
import Button from 'primevue/button';
import { useNotifications } from '@/composables/useNotifications';
import type { Notification } from '@/types/Notification';
import { formatNotificationMessage } from '@/utils/notificationFormatter';

const {
  notifications,
  preferences,
  fetchNotifications,
  fetchPreferences,
  markAsRead,
  markAllAsRead,
  updatePreferences,
} = useNotifications();

const isLoading = ref(true);

onMounted(async () => {
  try {
    await Promise.all([
      fetchNotifications(),
      fetchPreferences(),
    ]);
  } finally {
    isLoading.value = false;
  }
});

const receiveEmailNotifications = computed({
  get: () => preferences.value?.['document.updated.comment_added']?.email ?? false,
  set: (value: boolean) => {
    if (preferences.value) {
      const updated = {
        ...preferences.value,
        'document.updated.comment_added': {
          web: preferences.value['document.updated.comment_added']?.web ?? true,
          email: value,
        },
      };
      updatePreferences(updated);
    }
  },
});

const hasUnread = computed(() => notifications.value?.some((n) => !n.read) ?? false);

function handleMarkAsRead(notification: Notification) {
  markAsRead(notification.id);
}

function handleMarkAllAsRead() {
  markAllAsRead();
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year}, ${hours}:${minutes}`;
}

function getNotificationMessage(notification: Notification): string {
  return formatNotificationMessage(notification);
}
</script>

<template>
  <div class="flex flex-col h-full p-4 bg-[var(--surface-ground)]">
    <div class="max-w-[980px] mx-auto w-full flex flex-col bg-[var(--surface-card)] rounded-[10px]">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 gap-2 min-h-[65px] max-md:flex-col max-md:items-start max-md:gap-4">
        <h1 class="font-semibold text-[32px] leading-[1.25] text-[var(--text-color)] m-0">Notifications</h1>
        <div class="flex items-center gap-4">
          <Button
            v-if="hasUnread"
            label="Mark all as read"
            text
            size="small"
            @click="handleMarkAllAsRead"
          />
          <div class="flex items-center gap-2">
            <span class="font-medium text-sm leading-5 text-[var(--ui-input-label)]">Receive email notifications</span>
            <ToggleSwitch v-model="receiveEmailNotifications" />
          </div>
        </div>
      </div>

      <!-- Notifications List -->
      <div class="flex flex-col">
        <div v-if="isLoading" class="flex items-center justify-center gap-2 p-8 text-[var(--text-secondary)] text-sm">
          <i class="pi pi-spinner pi-spin"></i>
          <span>Loading notifications...</span>
        </div>
        <div v-else-if="!notifications || notifications.length === 0" class="flex items-center justify-center gap-2 p-8 text-[var(--text-secondary)] text-sm">
          <span>No notifications</span>
        </div>
        <template v-else>
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="flex items-center border-t border-[var(--ui-button-outlined-stroke)] min-h-14 max-md:flex-col max-md:items-start"
            :class="{ 'bg-[#eff6ff]': !notification.read }"
          >
            <div class="w-[180px] shrink-0 p-4 font-normal text-sm leading-5 text-[var(--ui-input-label)] max-md:w-full max-md:pb-0">
              {{ formatDate(notification.createdAt) }}
            </div>
            <div class="flex-1 p-4 font-normal text-sm leading-5 text-[var(--ui-input-label)] max-md:w-full max-md:pt-2">
              {{ getNotificationMessage(notification) }}
            </div>
            <div class="p-4 flex items-center min-w-12">
              <Button
                v-if="!notification.read"
                icon="pi pi-check"
                text
                rounded
                size="small"
                aria-label="Mark as read"
                @click="handleMarkAsRead(notification)"
              />
            </div>
          </div>
        </template>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-center p-4 min-h-[65px]">
        <p class="font-semibold text-[21px] leading-[1.25] text-[var(--text-color)] text-center m-0 max-md:text-base">That's all your notifications for the last 30 days</p>
      </div>
    </div>
  </div>
</template>
