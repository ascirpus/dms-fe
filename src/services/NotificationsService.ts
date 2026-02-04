import type { AxiosInstance } from 'axios';
import { ApiService } from './ApiService';
import type { Notification, NotificationPreferences, UnreadCount } from '@/types/Notification';

export class NotificationsService extends ApiService<Notification> {
  async list(limit: number = 20, offset: number = 0): Promise<Notification[]> {
    const response = await this.apiClient.get<{ status: string; data: Notification[] }>(
      '/api/notifications',
      { params: { limit, offset } }
    );
    return response.data.data;
  }

  async getUnreadCount(): Promise<number> {
    const response = await this.apiClient.get<{ status: string; data: UnreadCount }>(
      '/api/notifications/unread-count'
    );
    return response.data.data.count;
  }

  async markRead(notificationId: string): Promise<void> {
    await this.apiClient.post(`/api/notifications/${notificationId}/read`);
  }

  async markAllRead(): Promise<void> {
    await this.apiClient.post('/api/notifications/read-all');
  }

  async getPreferences(): Promise<NotificationPreferences> {
    const response = await this.apiClient.get<{ status: string; data: NotificationPreferences }>(
      '/api/profile/notifications'
    );
    return response.data.data;
  }

  async updatePreferences(preferences: NotificationPreferences): Promise<void> {
    await this.apiClient.post('/api/profile/notifications', preferences);
  }
}
