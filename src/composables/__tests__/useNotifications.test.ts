import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useNotifications } from '../useNotifications';
import { useAuth } from '../useAuth';
import { useQueryClient } from 'vue-query';
import type { Notification, NotificationPreferences } from '@/types/Notification';

vi.mock('../useAuth');
vi.mock('vue-query', () => ({
  useQueryClient: vi.fn(),
  useMutation: vi.fn((config: any) => ({
    mutateAsync: vi.fn(async (params: any) => {
      const result = await config.mutationFn(params);
      if (config.onSuccess) {
        config.onSuccess(result, params);
      }
      return result;
    }),
  })),
}));

describe('useNotifications', () => {
  let mockApiClient: any;
  let mockQueryClient: any;

  beforeEach(() => {
    mockApiClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
    };

    mockQueryClient = {
      fetchQuery: vi.fn(),
      invalidateQueries: vi.fn(),
    };

    vi.mocked(useAuth).mockReturnValue({
      apiClient: mockApiClient,
    } as any);

    vi.mocked(useQueryClient).mockReturnValue(mockQueryClient);
  });

  describe('fetchNotifications', () => {
    it('should fetch and store notifications', async () => {
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'document.added',
          createdAt: '2024-01-15T10:30:00',
          read: false,
        },
      ];

      mockApiClient.get.mockResolvedValue({
        data: { status: 'SUCCESS', data: mockNotifications },
      });

      mockQueryClient.fetchQuery.mockResolvedValue(mockNotifications);

      const { fetchNotifications, notifications } = useNotifications();
      const result = await fetchNotifications();

      expect(result).toEqual(mockNotifications);
      expect(notifications.value).toEqual(mockNotifications);
    });

    it('should use custom pagination parameters', async () => {
      mockApiClient.get.mockResolvedValue({
        data: { status: 'SUCCESS', data: [] },
      });

      mockQueryClient.fetchQuery.mockResolvedValue([]);

      const { fetchNotifications } = useNotifications();
      await fetchNotifications(50, 10);

      expect(mockQueryClient.fetchQuery).toHaveBeenCalledWith({
        queryKey: ['notifications', 50, 10],
        queryFn: expect.any(Function),
      });
    });
  });

  describe('fetchUnreadCount', () => {
    it('should fetch and store unread count', async () => {
      mockApiClient.get.mockResolvedValue({
        data: { status: 'SUCCESS', data: { count: 3 } },
      });

      mockQueryClient.fetchQuery.mockResolvedValue(3);

      const { fetchUnreadCount, unreadCount } = useNotifications();
      const result = await fetchUnreadCount();

      expect(result).toBe(3);
      expect(unreadCount.value).toBe(3);
    });
  });

  describe('fetchPreferences', () => {
    it('should fetch and store preferences', async () => {
      const mockPreferences: NotificationPreferences = {
        'document.added': { web: true, email: false },
      };

      mockApiClient.get.mockResolvedValue({
        data: { status: 'SUCCESS', data: mockPreferences },
      });

      mockQueryClient.fetchQuery.mockResolvedValue(mockPreferences);

      const { fetchPreferences, preferences } = useNotifications();
      const result = await fetchPreferences();

      expect(result).toEqual(mockPreferences);
      expect(preferences.value).toEqual(mockPreferences);
    });
  });

  describe('markAsRead', () => {
    it('should mark a notification as read and invalidate queries', async () => {
      mockApiClient.post.mockResolvedValue({});

      const { markAsRead } = useNotifications();
      await markAsRead('notification-123');

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/notifications/notification-123/read');
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith(['notifications']);
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith(['notifications-unread-count']);
    });

    it('should update local notification state immediately', async () => {
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'document.added',
          createdAt: '2024-01-15T10:30:00',
          read: false,
        },
      ];

      mockApiClient.get.mockResolvedValue({
        data: { status: 'SUCCESS', data: mockNotifications },
      });
      mockApiClient.post.mockResolvedValue({});
      mockQueryClient.fetchQuery.mockResolvedValue(mockNotifications);

      const { fetchNotifications, markAsRead, notifications } = useNotifications();
      await fetchNotifications();

      expect(notifications.value[0].read).toBe(false);

      await markAsRead('1');

      expect(notifications.value[0].read).toBe(true);
    });
  });

  describe('markAllAsRead', () => {
    it('should mark all notifications as read and invalidate queries', async () => {
      mockApiClient.post.mockResolvedValue({});

      const { markAllAsRead } = useNotifications();
      await markAllAsRead();

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/notifications/read-all');
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith(['notifications']);
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith(['notifications-unread-count']);
    });

    it('should update all local notifications state immediately', async () => {
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'document.added',
          createdAt: '2024-01-15T10:30:00',
          read: false,
        },
        {
          id: '2',
          type: 'document.updated.comment_added',
          createdAt: '2024-01-14T14:22:00',
          read: false,
        },
      ];

      mockApiClient.get.mockResolvedValue({
        data: { status: 'SUCCESS', data: mockNotifications },
      });
      mockApiClient.post.mockResolvedValue({});
      mockQueryClient.fetchQuery.mockResolvedValue(mockNotifications);

      const { fetchNotifications, markAllAsRead, notifications } = useNotifications();
      await fetchNotifications();

      expect(notifications.value.every((n) => !n.read)).toBe(true);

      await markAllAsRead();

      expect(notifications.value.every((n) => n.read)).toBe(true);
    });
  });

  describe('updatePreferences', () => {
    it('should update preferences and invalidate queries', async () => {
      const preferences: NotificationPreferences = {
        'document.added': { web: true, email: true },
      };

      mockApiClient.put.mockResolvedValue({});

      const { updatePreferences } = useNotifications();
      await updatePreferences(preferences);

      expect(mockApiClient.put).toHaveBeenCalledWith('/api/me', { notificationOverrides: preferences });
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith(['notification-preferences']);
    });
  });
});
