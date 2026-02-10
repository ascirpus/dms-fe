<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import Button from 'primevue/button';
import { useNotifications } from '@/composables/useNotifications';
import type { Notification } from '@/types/Notification';
import { formatNotificationMessage } from '@/utils/notificationFormatter';

const { t } = useI18n();
const {
  notifications,
  fetchNotifications,
  markAsRead,
  markAllAsRead,
} = useNotifications();

const isLoading = ref(true);

onMounted(async () => {
  try {
    await fetchNotifications();
  } finally {
    isLoading.value = false;
  }
});

const hasUnread = computed(() => notifications.value?.some((n) => !n.read) ?? false);

interface NotificationGroup {
  label: string;
  notifications: Notification[];
}

const groupedNotifications = computed<NotificationGroup[]>(() => {
  if (!notifications.value || notifications.value.length === 0) return [];

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart.getTime() - 86400000);
  const weekStart = new Date(todayStart.getTime() - 7 * 86400000);

  const todayLabel = t('notifications.today');
  const yesterdayLabel = t('notifications.yesterday');
  const thisWeekLabel = t('notifications.thisWeek');
  const earlierLabel = t('notifications.earlier');

  const groups: Record<string, Notification[]> = {
    [todayLabel]: [],
    [yesterdayLabel]: [],
    [thisWeekLabel]: [],
    [earlierLabel]: [],
  };

  for (const notification of notifications.value) {
    const date = new Date(notification.createdAt);
    if (date >= todayStart) {
      groups[todayLabel].push(notification);
    } else if (date >= yesterdayStart) {
      groups[yesterdayLabel].push(notification);
    } else if (date >= weekStart) {
      groups[thisWeekLabel].push(notification);
    } else {
      groups[earlierLabel].push(notification);
    }
  }

  return Object.entries(groups)
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, notifications: items }));
});

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
        <h1 class="font-semibold text-[32px] leading-[1.25] text-[var(--text-color)] m-0">{{ $t('notifications.title') }}</h1>
        <div class="flex items-center gap-4">
          <Button
            v-if="hasUnread"
            :label="$t('notifications.markAllRead')"
            text
            size="small"
            @click="handleMarkAllAsRead"
          />
        </div>
      </div>

      <!-- Notifications List -->
      <div class="flex flex-col">
        <div v-if="isLoading" class="notification-loading flex items-center justify-center gap-2 p-8 text-[var(--text-secondary)] text-sm">
          <i class="pi pi-spinner pi-spin"></i>
          <span>{{ $t('notifications.loadingNotifications') }}</span>
        </div>
        <div v-else-if="!notifications || notifications.length === 0" class="notification-empty flex items-center justify-center gap-2 p-8 text-[var(--text-secondary)] text-sm">
          <span>{{ $t('notifications.noNotifications') }}</span>
        </div>
        <template v-else>
          <div v-for="group in groupedNotifications" :key="group.label" class="notification-group">
            <div class="px-4 py-2 border-t border-[var(--surface-border)]">
              <span class="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide">{{ group.label }}</span>
            </div>
            <div
              v-for="notification in group.notifications"
              :key="notification.id"
              class="notification-row flex items-center border-t border-[var(--surface-border)] min-h-14 max-md:flex-col max-md:items-start"
              :class="{ 'notification-unread': !notification.read }"
            >
              <div class="notification-date w-[180px] shrink-0 p-4 font-normal text-sm leading-5 text-[var(--text-secondary)] max-md:w-full max-md:pb-0">
                {{ formatDate(notification.createdAt) }}
              </div>
              <div class="notification-message flex-1 p-4 font-normal text-sm leading-5 text-[var(--text-color)] max-md:w-full max-md:pt-2">
                {{ getNotificationMessage(notification) }}
              </div>
              <div class="notification-actions p-4 flex items-center min-w-12">
                <Button
                  v-if="!notification.read"
                  icon="pi pi-check"
                  text
                  rounded
                  size="small"
                  :aria-label="$t('notifications.markAsRead')"
                  @click="handleMarkAsRead(notification)"
                />
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-center p-4 min-h-[65px]">
        <p class="font-semibold text-[21px] leading-[1.25] text-[var(--text-color)] text-center m-0 max-md:text-base">{{ $t('notifications.allNotifications') }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notification-unread {
  background-color: color-mix(in srgb, var(--primary-color) 8%, transparent);
}
</style>
