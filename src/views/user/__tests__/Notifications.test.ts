import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import Notifications from '../Notifications.vue';
import { useNotifications } from '@/composables/useNotifications';
import type { Notification } from '@/types/Notification';
import { ref } from 'vue';

vi.mock('@/composables/useNotifications');

const globalStubs = {
    Button: {
        template: '<button :disabled="disabled" @click="$emit(\'click\', $event)"><slot>{{ label }}</slot><i v-if="icon" :class="icon"></i></button>',
        props: ['label', 'disabled', 'loading', 'link', 'type', 'text', 'rounded', 'size', 'icon', 'severity'],
    },
};

function todayAt(hours: number, minutes: number): string {
    const d = new Date();
    d.setHours(hours, minutes, 0, 0);
    return d.toISOString();
}

function daysAgo(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() - days);
    d.setHours(10, 0, 0, 0);
    return d.toISOString();
}

describe('Notifications.vue', () => {
    let mockNotifications: Notification[];
    let mockFetchNotifications: any;
    let mockMarkAsRead: any;
    let mockMarkAllAsRead: any;

    beforeEach(() => {
        mockNotifications = [
            {
                id: '1',
                type: 'document.added',
                createdAt: todayAt(10, 30),
                read: false,
            },
            {
                id: '2',
                type: 'document.updated.comment_added',
                createdAt: daysAgo(1),
                read: true,
            },
        ];

        mockFetchNotifications = vi.fn().mockResolvedValue(mockNotifications);
        mockMarkAsRead = vi.fn().mockResolvedValue(undefined);
        mockMarkAllAsRead = vi.fn().mockResolvedValue(undefined);

        vi.mocked(useNotifications).mockReturnValue({
            notifications: ref(mockNotifications),
            preferences: ref(null),
            unreadCount: ref(1),
            fetchNotifications: mockFetchNotifications,
            fetchPreferences: vi.fn(),
            fetchUnreadCount: vi.fn(),
            markAsRead: mockMarkAsRead,
            markAllAsRead: mockMarkAllAsRead,
            updatePreferences: vi.fn(),
        });
    });

    function mountComponent() {
        return mount(Notifications, { global: { stubs: globalStubs } });
    }

    it('should render notifications grouped by date', async () => {
        const wrapper = mountComponent();
        await flushPromises();

        const groups = wrapper.findAll('.notification-group');
        expect(groups.length).toBeGreaterThanOrEqual(2);

        const rows = wrapper.findAll('.notification-row');
        expect(rows).toHaveLength(2);
    });

    it('should display group labels', async () => {
        const wrapper = mountComponent();
        await flushPromises();

        expect(wrapper.text()).toContain('Today');
        expect(wrapper.text()).toContain('Yesterday');
    });

    it('should display unread notification with unread class', async () => {
        const wrapper = mountComponent();
        await flushPromises();

        const unreadNotification = wrapper.find('.notification-unread');
        expect(unreadNotification.exists()).toBe(true);
    });

    it('should show "Mark all as read" button when there are unread notifications', async () => {
        const wrapper = mountComponent();
        await flushPromises();

        const buttons = wrapper.findAll('button');
        const markAllButton = buttons.find(b => b.text().includes('Mark all as read'));
        expect(markAllButton).toBeDefined();
    });

    it('should not show "Mark all as read" button when all notifications are read', async () => {
        const allReadNotifications = mockNotifications.map(n => ({ ...n, read: true }));
        vi.mocked(useNotifications).mockReturnValue({
            notifications: ref(allReadNotifications),
            preferences: ref(null),
            unreadCount: ref(0),
            fetchNotifications: mockFetchNotifications,
            fetchPreferences: vi.fn(),
            fetchUnreadCount: vi.fn(),
            markAsRead: mockMarkAsRead,
            markAllAsRead: mockMarkAllAsRead,
            updatePreferences: vi.fn(),
        });

        const wrapper = mountComponent();
        await flushPromises();

        const buttons = wrapper.findAll('button');
        const markAllButton = buttons.find(b => b.text().includes('Mark all as read'));
        expect(markAllButton).toBeUndefined();
    });

    it('should call markAsRead when mark as read button is clicked', async () => {
        const wrapper = mountComponent();
        await flushPromises();

        const markReadButton = wrapper.find('.notification-row .notification-actions button');
        await markReadButton.trigger('click');

        expect(mockMarkAsRead).toHaveBeenCalledWith('1');
    });

    it('should update UI when notification is marked as read', async () => {
        const notificationsRef = ref([...mockNotifications]);
        const mockMarkAsReadFn = vi.fn().mockImplementation(async (id: string) => {
            const notification = notificationsRef.value.find((n) => n.id === id);
            if (notification) {
                notification.read = true;
            }
        });

        vi.mocked(useNotifications).mockReturnValue({
            notifications: notificationsRef,
            preferences: ref(null),
            unreadCount: ref(1),
            fetchNotifications: mockFetchNotifications,
            fetchPreferences: vi.fn(),
            fetchUnreadCount: vi.fn(),
            markAsRead: mockMarkAsReadFn,
            markAllAsRead: mockMarkAllAsRead,
            updatePreferences: vi.fn(),
        });

        const wrapper = mountComponent();
        await flushPromises();

        expect(wrapper.find('.notification-unread').exists()).toBe(true);

        const markReadButton = wrapper.find('.notification-row .notification-actions button');
        await markReadButton.trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.find('.notification-unread').exists()).toBe(false);
    });

    it('should call markAllAsRead when "Mark all as read" button is clicked', async () => {
        const wrapper = mountComponent();
        await flushPromises();

        const buttons = wrapper.findAll('button');
        const markAllButton = buttons.find(b => b.text().includes('Mark all as read'));
        await markAllButton?.trigger('click');

        expect(mockMarkAllAsRead).toHaveBeenCalled();
    });

    it('should update UI when all notifications are marked as read', async () => {
        const notificationsRef = ref([...mockNotifications]);
        const mockMarkAllAsReadFn = vi.fn().mockImplementation(async () => {
            notificationsRef.value.forEach((n) => {
                n.read = true;
            });
        });

        vi.mocked(useNotifications).mockReturnValue({
            notifications: notificationsRef,
            preferences: ref(null),
            unreadCount: ref(1),
            fetchNotifications: mockFetchNotifications,
            fetchPreferences: vi.fn(),
            fetchUnreadCount: vi.fn(),
            markAsRead: mockMarkAsRead,
            markAllAsRead: mockMarkAllAsReadFn,
            updatePreferences: vi.fn(),
        });

        const wrapper = mountComponent();
        await flushPromises();

        expect(wrapper.find('.notification-unread').exists()).toBe(true);

        const buttons = wrapper.findAll('button');
        const markAllButton = buttons.find(b => b.text().includes('Mark all as read'));
        await markAllButton?.trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.find('.notification-unread').exists()).toBe(false);
    });

    it('should show loading state initially', () => {
        const wrapper = mountComponent();

        const loadingDiv = wrapper.find('.notification-loading');
        expect(loadingDiv.exists()).toBe(true);
    });

    it('should show empty state when there are no notifications', async () => {
        vi.mocked(useNotifications).mockReturnValue({
            notifications: ref([]),
            preferences: ref(null),
            unreadCount: ref(0),
            fetchNotifications: vi.fn().mockResolvedValue([]),
            fetchPreferences: vi.fn(),
            fetchUnreadCount: vi.fn(),
            markAsRead: mockMarkAsRead,
            markAllAsRead: mockMarkAllAsRead,
            updatePreferences: vi.fn(),
        });

        const wrapper = mountComponent();
        await flushPromises();

        const emptyDiv = wrapper.find('.notification-empty');
        expect(emptyDiv.exists()).toBe(true);
    });

    it('should format notification dates correctly', async () => {
        const wrapper = mountComponent();
        await flushPromises();

        const dateElement = wrapper.find('.notification-date');
        expect(dateElement.text()).toMatch(/\d{2}\.\d{2}\.\d{2}, \d{2}:\d{2}/);
    });

    it('should display notification messages using formatter', async () => {
        const wrapper = mountComponent();
        await flushPromises();

        const messages = wrapper.findAll('.notification-message');
        expect(messages[0].text()).toBe('Document added');
        expect(messages[1].text()).toBe('Comment added to document');
    });

    it('should group notifications in correct date buckets', async () => {
        const notifs: Notification[] = [
            { id: '1', type: 'document.added', createdAt: todayAt(9, 0), read: false },
            { id: '2', type: 'document.removed', createdAt: todayAt(8, 0), read: true },
            { id: '3', type: 'document.approved', createdAt: daysAgo(1), read: true },
            { id: '4', type: 'document.rejected', createdAt: daysAgo(10), read: true },
        ];

        vi.mocked(useNotifications).mockReturnValue({
            notifications: ref(notifs),
            preferences: ref(null),
            unreadCount: ref(1),
            fetchNotifications: vi.fn().mockResolvedValue(notifs),
            fetchPreferences: vi.fn(),
            fetchUnreadCount: vi.fn(),
            markAsRead: mockMarkAsRead,
            markAllAsRead: mockMarkAllAsRead,
            updatePreferences: vi.fn(),
        });

        const wrapper = mountComponent();
        await flushPromises();

        const groups = wrapper.findAll('.notification-group');
        expect(groups.length).toBe(3); // Today, Yesterday, Earlier

        expect(wrapper.text()).toContain('Today');
        expect(wrapper.text()).toContain('Yesterday');
        expect(wrapper.text()).toContain('Earlier');
    });
});
