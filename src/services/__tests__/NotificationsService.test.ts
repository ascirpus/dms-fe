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
    it('should fetch notification preferences', async () => {
      const mockPreferences: NotificationPreferences = {
        'document.added': { web: true, email: false },
      };

      vi.mocked(mockApiClient.get).mockResolvedValue({
        data: { status: 'SUCCESS', data: mockPreferences },
      });

      const result = await service.getPreferences();

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/profile/notifications');
      expect(result).toEqual(mockPreferences);
    });
  });

  describe('updatePreferences', () => {
    it('should update notification preferences', async () => {
      const preferences: NotificationPreferences = {
        'document.added': { web: true, email: true },
      };

      vi.mocked(mockApiClient.post).mockResolvedValue({});

      await service.updatePreferences(preferences);

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/profile/notifications', preferences);
    });
  });
});
