import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NotificationsService } from '../NotificationsService';
import type { AxiosInstance } from 'axios';
import type { Notification, NotificationPreferences } from '@/types/Notification';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let mockApiClient: AxiosInstance;

  beforeEach(() => {
    mockApiClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
    } as any;
    service = new NotificationsService(mockApiClient);
  });

  describe('list', () => {
    it('should fetch notifications with default pagination', async () => {
      const mockNotifications: Notification[] = [
        {
          id: '1',
          type: 'document.added',
          createdAt: '2024-01-15T10:30:00',
          read: false,
        },
      ];

      vi.mocked(mockApiClient.get).mockResolvedValue({
        data: { status: 'SUCCESS', data: mockNotifications },
      });

      const result = await service.list();

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/notifications', {
        params: { limit: 20, offset: 0 },
      });
      expect(result).toEqual(mockNotifications);
    });

    it('should fetch notifications with custom pagination', async () => {
      const mockNotifications: Notification[] = [];

      vi.mocked(mockApiClient.get).mockResolvedValue({
        data: { status: 'SUCCESS', data: mockNotifications },
      });

      await service.list(50, 10);

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/notifications', {
        params: { limit: 50, offset: 10 },
      });
    });
  });

  describe('getUnreadCount', () => {
    it('should fetch unread count', async () => {
      vi.mocked(mockApiClient.get).mockResolvedValue({
        data: { status: 'SUCCESS', data: { count: 5 } },
      });

      const result = await service.getUnreadCount();

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/notifications/unread-count');
      expect(result).toBe(5);
    });
  });

  describe('markRead', () => {
    it('should mark a notification as read', async () => {
      vi.mocked(mockApiClient.post).mockResolvedValue({});

      await service.markRead('notification-123');

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/notifications/notification-123/read');
    });
  });

  describe('markAllRead', () => {
    it('should mark all notifications as read', async () => {
      vi.mocked(mockApiClient.post).mockResolvedValue({});

      await service.markAllRead();

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/notifications/read-all');
    });
  });

  describe('getPreferences', () => {
    it('should fetch notification preferences from /api/me', async () => {
      const mockOverrides: NotificationPreferences = {
        'document.added': { web: true, email: false },
      };

      vi.mocked(mockApiClient.get).mockResolvedValue({
        data: { status: 'SUCCESS', data: { email: 'user@test.com', notificationOverrides: mockOverrides } },
      });

      const result = await service.getPreferences();

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/me');
      expect(result).toEqual(mockOverrides);
    });

    it('should return empty object when notificationOverrides is not set', async () => {
      vi.mocked(mockApiClient.get).mockResolvedValue({
        data: { status: 'SUCCESS', data: { email: 'user@test.com' } },
      });

      const result = await service.getPreferences();

      expect(result).toEqual({});
    });
  });

  describe('updatePreferences', () => {
    it('should update notification preferences via PUT /api/me', async () => {
      const preferences: NotificationPreferences = {
        'document.added': { web: true, email: true },
      };

      vi.mocked(mockApiClient.put).mockResolvedValue({});

      await service.updatePreferences(preferences);

      expect(mockApiClient.put).toHaveBeenCalledWith('/api/me', { notificationOverrides: preferences });
    });
  });
});
