import { ref } from 'vue';
import { useMutation, useQueryClient } from 'vue-query';
import { NotificationsService } from '@/services/NotificationsService';
import { useAuth } from './useAuth';
import type { Notification, NotificationPreferences } from '@/types/Notification';

export function useNotifications() {
  const { apiClient } = useAuth();
  const queryClient = useQueryClient();
  const notificationsService = new NotificationsService(apiClient);

  const notifications = ref<Notification[]>([]);
  const unreadCount = ref<number>(0);
  const preferences = ref<NotificationPreferences | null>(null);

  async function fetchNotifications(limit: number = 20, offset: number = 0): Promise<Notification[]> {
    const response = await queryClient.fetchQuery<Notification[]>({
      queryKey: ['notifications', limit, offset],
      queryFn: async () => await notificationsService.list(limit, offset),
    });
    notifications.value = response;
    return response;
  }

  async function fetchUnreadCount(): Promise<number> {
    const count = await queryClient.fetchQuery<number>({
      queryKey: ['notifications-unread-count'],
      queryFn: async () => await notificationsService.getUnreadCount(),
    });
    unreadCount.value = count;
    return count;
  }

  async function fetchPreferences(): Promise<NotificationPreferences> {
    const prefs = await queryClient.fetchQuery<NotificationPreferences>({
      queryKey: ['notification-preferences'],
      queryFn: async () => await notificationsService.getPreferences(),
    });
    preferences.value = prefs;
    return prefs;
  }

  const markReadMutation = useMutation({
    mutationFn: async (notificationId: string) => await notificationsService.markRead(notificationId),
    onSuccess: async (_, notificationId: string) => {
      const notification = notifications.value.find((n) => n.id === notificationId);
      if (notification) {
        notification.read = true;
      }
      // Optimistically update unread count
      if (unreadCount.value > 0) {
        unreadCount.value--;
      }
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['notifications-unread-count']);
      // Refetch to ensure accuracy
      await fetchUnreadCount();
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => await notificationsService.markAllRead(),
    onSuccess: async () => {
      notifications.value.forEach((n) => {
        n.read = true;
      });
      // Set unread count to 0
      unreadCount.value = 0;
      queryClient.invalidateQueries(['notifications']);
      queryClient.invalidateQueries(['notifications-unread-count']);
      // Refetch to ensure accuracy
      await fetchUnreadCount();
    },
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (prefs: NotificationPreferences) =>
      await notificationsService.updatePreferences(prefs),
    onSuccess: () => {
      queryClient.invalidateQueries(['notification-preferences']);
    },
  });

  function markAsRead(notificationId: string) {
    return markReadMutation.mutateAsync(notificationId);
  }

  function markAllAsRead() {
    return markAllReadMutation.mutateAsync();
  }

  function updatePreferences(prefs: NotificationPreferences) {
    return updatePreferencesMutation.mutateAsync(prefs);
  }

  return {
    notifications,
    unreadCount,
    preferences,
    fetchNotifications,
    fetchUnreadCount,
    fetchPreferences,
    markAsRead,
    markAllAsRead,
    updatePreferences,
  };
}
