import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import Notifications from '../Notifications.vue';
import { useNotifications } from '@/composables/useNotifications';
import type { Notification, NotificationPreferences } from '@/types/Notification';
import { ref } from 'vue';

vi.mock('@/composables/useNotifications');

describe('Notifications.vue', () => {
  let mockNotifications: Notification[];
  let mockPreferences: NotificationPreferences;
  let mockFetchNotifications: any;
  let mockFetchPreferences: any;
  let mockMarkAsRead: any;
  let mockMarkAllAsRead: any;
  let mockUpdatePreferences: any;

  beforeEach(() => {
    mockNotifications = [
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
        read: true,
      },
    ];

    mockPreferences = {
      'document.updated.comment_added': { web: true, email: false },
    };

    mockFetchNotifications = vi.fn().mockResolvedValue(mockNotifications);
    mockFetchPreferences = vi.fn().mockResolvedValue(mockPreferences);
    mockMarkAsRead = vi.fn().mockResolvedValue(undefined);
    mockMarkAllAsRead = vi.fn().mockResolvedValue(undefined);
    mockUpdatePreferences = vi.fn().mockResolvedValue(undefined);

    vi.mocked(useNotifications).mockReturnValue({
      notifications: ref(mockNotifications),
      preferences: ref(mockPreferences),
      unreadCount: ref(1),
      fetchNotifications: mockFetchNotifications,
      fetchPreferences: mockFetchPreferences,
      fetchUnreadCount: vi.fn(),
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
      updatePreferences: mockUpdatePreferences,
    });
  });

  it('should render notifications list', async () => {
    const wrapper = mount(Notifications);
    await flushPromises();

    const notifications = wrapper.findAll('.notification-row');
    expect(notifications).toHaveLength(2);
  });

  it('should display unread notification with different styling', async () => {
    const wrapper = mount(Notifications);
    await flushPromises();

    const unreadNotification = wrapper.find('.notification-unread');
    expect(unreadNotification.exists()).toBe(true);
  });

  it('should show "Mark all as read" button when there are unread notifications', async () => {
    const wrapper = mount(Notifications);
    await flushPromises();

    const buttons = wrapper.findAll('button');
    const markAllButton = buttons.find(b => b.text().includes('Mark all as read'));
    expect(markAllButton).toBeDefined();
  });

  it('should not show "Mark all as read" button when all notifications are read', async () => {
    const allReadNotifications = mockNotifications.map(n => ({ ...n, read: true }));
    vi.mocked(useNotifications).mockReturnValue({
      notifications: ref(allReadNotifications),
      preferences: ref(mockPreferences),
      unreadCount: ref(0),
      fetchNotifications: mockFetchNotifications,
      fetchPreferences: mockFetchPreferences,
      fetchUnreadCount: vi.fn(),
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
      updatePreferences: mockUpdatePreferences,
    });

    const wrapper = mount(Notifications);
    await flushPromises();

    const buttons = wrapper.findAll('button');
    const markAllButton = buttons.find(b => b.text().includes('Mark all as read'));
    expect(markAllButton).toBeUndefined();
  });

  it('should call markAsRead when mark as read button is clicked', async () => {
    const wrapper = mount(Notifications);
    await flushPromises();

    const markReadButton = wrapper.find('.notification-row .notification-actions button');
    await markReadButton.trigger('click');

    expect(mockMarkAsRead).toHaveBeenCalledWith('1');
  });

  it('should update UI when notification is marked as read', async () => {
    const notificationsRef = ref(mockNotifications);
    const mockMarkAsReadFn = vi.fn().mockImplementation(async (id: string) => {
      const notification = notificationsRef.value.find((n) => n.id === id);
      if (notification) {
        notification.read = true;
      }
    });

    vi.mocked(useNotifications).mockReturnValue({
      notifications: notificationsRef,
      preferences: ref(mockPreferences),
      unreadCount: ref(1),
      fetchNotifications: mockFetchNotifications,
      fetchPreferences: mockFetchPreferences,
      fetchUnreadCount: vi.fn(),
      markAsRead: mockMarkAsReadFn,
      markAllAsRead: mockMarkAllAsRead,
      updatePreferences: mockUpdatePreferences,
    });

    const wrapper = mount(Notifications);
    await flushPromises();

    expect(wrapper.find('.notification-unread').exists()).toBe(true);

    const markReadButton = wrapper.find('.notification-row .notification-actions button');
    await markReadButton.trigger('click');
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.notification-unread').exists()).toBe(false);
  });

  it('should call markAllAsRead when "Mark all as read" button is clicked', async () => {
    const wrapper = mount(Notifications);
    await flushPromises();

    const buttons = wrapper.findAll('button');
    const markAllButton = buttons.find(b => b.text().includes('Mark all as read'));
    await markAllButton?.trigger('click');

    expect(mockMarkAllAsRead).toHaveBeenCalled();
  });

  it('should update UI when all notifications are marked as read', async () => {
    const notificationsRef = ref(mockNotifications);
    const mockMarkAllAsReadFn = vi.fn().mockImplementation(async () => {
      notificationsRef.value.forEach((n) => {
        n.read = true;
      });
    });

    vi.mocked(useNotifications).mockReturnValue({
      notifications: notificationsRef,
      preferences: ref(mockPreferences),
      unreadCount: ref(1),
      fetchNotifications: mockFetchNotifications,
      fetchPreferences: mockFetchPreferences,
      fetchUnreadCount: vi.fn(),
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsReadFn,
      updatePreferences: mockUpdatePreferences,
    });

    const wrapper = mount(Notifications);
    await flushPromises();

    expect(wrapper.find('.notification-unread').exists()).toBe(true);

    const buttons = wrapper.findAll('button');
    const markAllButton = buttons.find(b => b.text().includes('Mark all as read'));
    await markAllButton?.trigger('click');
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.notification-unread').exists()).toBe(false);
  });

  it('should show loading state initially', () => {
    const wrapper = mount(Notifications);

    const loadingDiv = wrapper.find('.notification-loading');
    expect(loadingDiv.exists()).toBe(true);
  });

  it('should show empty state when there are no notifications', async () => {
    vi.mocked(useNotifications).mockReturnValue({
      notifications: ref([]),
      preferences: ref(mockPreferences),
      unreadCount: ref(0),
      fetchNotifications: vi.fn().mockResolvedValue([]),
      fetchPreferences: mockFetchPreferences,
      fetchUnreadCount: vi.fn(),
      markAsRead: mockMarkAsRead,
      markAllAsRead: mockMarkAllAsRead,
      updatePreferences: mockUpdatePreferences,
    });

    const wrapper = mount(Notifications);
    await flushPromises();

    const emptyDiv = wrapper.find('.notification-empty');
    expect(emptyDiv.exists()).toBe(true);
  });

  it('should format notification dates correctly', async () => {
    const wrapper = mount(Notifications);
    await flushPromises();

    const dateElement = wrapper.find('.notification-date');
    expect(dateElement.text()).toMatch(/\d{2}\.\d{2}\.\d{2}, \d{2}:\d{2}/);
  });

  it('should display notification messages using formatter', async () => {
    const wrapper = mount(Notifications);
    await flushPromises();

    const messages = wrapper.findAll('.notification-message');
    expect(messages[0].text()).toBe('Document added');
    expect(messages[1].text()).toBe('Comment added to document');
  });
});
