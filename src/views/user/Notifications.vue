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
  <div class="notifications-view">
    <div class="notifications-content">
      <!-- Header -->
      <div class="notifications-header">
        <h1 class="notifications-title">Notifications</h1>
        <div class="header-actions">
          <Button
            v-if="hasUnread"
            label="Mark all as read"
            text
            size="small"
            @click="handleMarkAllAsRead"
          />
          <div class="notification-toggle">
            <span class="toggle-label">Receive email notifications</span>
            <ToggleSwitch v-model="receiveEmailNotifications" />
          </div>
        </div>
      </div>

      <!-- Notifications List -->
      <div class="notifications-table-container">
        <div v-if="isLoading" class="notification-loading">
          <i class="pi pi-spinner pi-spin"></i>
          <span>Loading notifications...</span>
        </div>
        <div v-else-if="!notifications || notifications.length === 0" class="notification-empty">
          <span>No notifications</span>
        </div>
        <template v-else>
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="notification-row"
            :class="{ 'notification-unread': !notification.read }"
          >
            <div class="notification-date">
              {{ formatDate(notification.createdAt) }}
            </div>
            <div class="notification-message">
              {{ getNotificationMessage(notification) }}
            </div>
            <div class="notification-actions">
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
      <div class="notifications-footer">
        <p class="footer-text">That's all your notifications for the last 30 days</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notifications-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 16px;
  background-color: var(--surface-ground);
}

.notifications-content {
  max-width: 980px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--surface-card);
  border-radius: 10px;
}

/* Header */
.notifications-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  gap: 8px;
  min-height: 65px;
}

.notifications-title {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 32px;
  line-height: 1.25;
  color: var(--text-color);
  margin: 0;
}

.notification-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
}

.toggle-label {
  font-family: 'Inter', sans-serif;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: var(--ui-input-label);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Notifications List */
.notifications-table-container {
  display: flex;
  flex-direction: column;
}

.notification-row {
  display: flex;
  align-items: center;
  border-top: 1px solid var(--ui-button-outlined-stroke);
  min-height: 56px;
}

.notification-row:first-child {
  border-top: 1px solid var(--ui-button-outlined-stroke);
}

.notification-unread {
  background-color: #eff6ff;
}

.notification-date {
  width: 180px;
  flex-shrink: 0;
  padding: 16px;
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: var(--ui-input-label);
}

.notification-message {
  flex: 1;
  padding: 16px;
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  font-size: 14px;
  line-height: 20px;
  color: var(--ui-input-label);
}

.notification-actions {
  padding: 16px;
  display: flex;
  align-items: center;
  min-width: 48px;
}

/* Loading and empty states */
.notification-loading,
.notification-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 32px;
  color: var(--text-secondary);
  font-size: 14px;
}

/* Footer */
.notifications-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  min-height: 65px;
}

.footer-text {
  font-family: 'Inter', sans-serif;
  font-weight: 600;
  font-size: 21px;
  line-height: 1.25;
  color: var(--text-color);
  text-align: center;
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .notifications-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .notification-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .notification-date {
    width: 100%;
    padding-bottom: 0;
  }

  .notification-message {
    width: 100%;
    padding-top: 8px;
  }

  .footer-text {
    font-size: 16px;
  }
}
</style>
