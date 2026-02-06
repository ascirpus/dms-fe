import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { ref } from 'vue';
import Header from '../Header.vue';
import { useAuth } from '@/composables/useAuth';
import { useNotifications } from '@/composables/useNotifications';
import { useRouter } from 'vue-router';

vi.mock('@/composables/useAuth');
vi.mock('@/composables/useNotifications');
vi.mock('vue-router');

describe('Header.vue', () => {
  let mockRouter: any;
  let mockFetchUnreadCount: any;
  let mockLogout: any;

  beforeEach(() => {
    mockRouter = {
      push: vi.fn(),
    };

    mockFetchUnreadCount = vi.fn().mockResolvedValue(5);
    mockLogout = vi.fn();

    vi.mocked(useRouter).mockReturnValue(mockRouter);

    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: ref(true),
      getCurrentUser: vi.fn(() => ({
        firstName: 'John',
        lastName: 'Doe',
        name: 'John Doe',
        email: 'john@example.com',
        picture: 'https://example.com/avatar.jpg',
      })),
      logout: mockLogout,
    } as any);

    vi.mocked(useNotifications).mockReturnValue({
      notifications: ref([]),
      unreadCount: ref(0),
      preferences: ref(null),
      fetchNotifications: vi.fn(),
      fetchUnreadCount: mockFetchUnreadCount,
      fetchPreferences: vi.fn(),
      markAsRead: vi.fn(),
      markAllAsRead: vi.fn(),
      updatePreferences: vi.fn(),
    });
  });

  describe('Initial Render', () => {
    it('should render the header with logo', () => {
      const wrapper = mount(Header);

      const header = wrapper.find('.app-header');
      expect(header.exists()).toBe(true);

      const logo = wrapper.find('.header-logo');
      expect(logo.exists()).toBe(true);
    });

    it('should render notification bell button', () => {
      const wrapper = mount(Header);

      const bellButton = wrapper.find('[aria-label="Notifications"]');
      expect(bellButton.exists()).toBe(true);
      expect(bellButton.classes()).toContain('notification-btn');
    });

    it('should not show badge when unreadCount is 0', () => {
      vi.mocked(useNotifications).mockReturnValue({
        notifications: ref([]),
        unreadCount: ref(0),
        preferences: ref(null),
        fetchNotifications: vi.fn(),
        fetchUnreadCount: mockFetchUnreadCount,
        fetchPreferences: vi.fn(),
        markAsRead: vi.fn(),
        markAllAsRead: vi.fn(),
        updatePreferences: vi.fn(),
      });

      const wrapper = mount(Header);

      const badge = wrapper.find('.notification-badge');
      expect(badge.exists()).toBe(false);
    });

    it('should show badge when unreadCount > 0', () => {
      vi.mocked(useNotifications).mockReturnValue({
        notifications: ref([]),
        unreadCount: ref(5),
        preferences: ref(null),
        fetchNotifications: vi.fn(),
        fetchUnreadCount: mockFetchUnreadCount,
        fetchPreferences: vi.fn(),
        markAsRead: vi.fn(),
        markAllAsRead: vi.fn(),
        updatePreferences: vi.fn(),
      });

      const wrapper = mount(Header);

      const badge = wrapper.find('.notification-badge');
      expect(badge.exists()).toBe(true);
      expect(badge.text()).toBe('5');
    });

    it('should display "99+" when unreadCount > 99', () => {
      vi.mocked(useNotifications).mockReturnValue({
        notifications: ref([]),
        unreadCount: ref(150),
        preferences: ref(null),
        fetchNotifications: vi.fn(),
        fetchUnreadCount: mockFetchUnreadCount,
        fetchPreferences: vi.fn(),
        markAsRead: vi.fn(),
        markAllAsRead: vi.fn(),
        updatePreferences: vi.fn(),
      });

      const wrapper = mount(Header);

      const badge = wrapper.find('.notification-badge');
      expect(badge.text()).toBe('99+');
    });
  });

  describe('Authentication', () => {
    it('should fetch unread count on mount if user is authenticated', async () => {
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: ref(true),
        getCurrentUser: vi.fn(() => ({
          sub: 'user-123',
          name: 'John Doe',
          email: 'john@example.com',
        })),
        logout: mockLogout,
      } as any);

      mount(Header);
      await flushPromises();

      expect(mockFetchUnreadCount).toHaveBeenCalled();
    });

    it('should not fetch unread count if user is not authenticated', async () => {
      mockFetchUnreadCount.mockClear();

      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: ref(false),
        getCurrentUser: vi.fn(() => null),
        logout: mockLogout,
      } as any);

      mount(Header);
      await flushPromises();

      expect(mockFetchUnreadCount).not.toHaveBeenCalled();
    });

    it('should show user avatar when authenticated with picture', () => {
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: ref(true),
        getCurrentUser: vi.fn(() => ({
          sub: 'user-123',
          name: 'John Doe',
          email: 'john@example.com',
          picture: 'https://example.com/avatar.jpg',
        })),
        logout: mockLogout,
      } as any);

      const wrapper = mount(Header);

      const avatars = wrapper.findAll('.user-avatar');
      expect(avatars.length).toBeGreaterThan(0);
    });

    it('should show user avatar with initials when authenticated without picture', () => {
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: ref(true),
        getCurrentUser: vi.fn(() => ({
          sub: 'user-123',
          name: 'John Doe',
          email: 'john@example.com',
        })),
        logout: mockLogout,
      } as any);

      const wrapper = mount(Header);

      const initialsAvatar = wrapper.find('.user-avatar-initials');
      expect(initialsAvatar.exists()).toBe(true);
    });

    it('should show "Sign In" option when not authenticated', async () => {
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: ref(false),
        getCurrentUser: vi.fn(() => null),
        logout: mockLogout,
      } as any);

      const wrapper = mount(Header);
      await flushPromises();

      const avatar = wrapper.find('.user-avatar');
      await avatar.trigger('click');
      await wrapper.vm.$nextTick();

      expect(wrapper.vm.userMenuItems).toContainEqual(
        expect.objectContaining({ label: 'Sign In' })
      );
    });
  });

  describe('Interactions', () => {
    it('should navigate to notifications page when bell icon is clicked', async () => {
      const wrapper = mount(Header);

      const bellButton = wrapper.find('[aria-label="Notifications"]');
      await bellButton.trigger('click');

      expect(mockRouter.push).toHaveBeenCalledWith({ name: 'notifications' });
    });

    it('should navigate to profile when profile menu item is clicked', async () => {
      const wrapper = mount(Header);

      expect(wrapper.vm.userMenuItems).toContainEqual(
        expect.objectContaining({
          label: 'Profile',
          command: expect.any(Function),
        })
      );

      const profileItem = wrapper.vm.userMenuItems.find((item: any) => item.label === 'Profile');
      profileItem.command();

      expect(mockRouter.push).toHaveBeenCalledWith({ name: 'profile' });
    });

    it('should call logout when sign out is clicked', async () => {
      const wrapper = mount(Header);

      const signOutItem = wrapper.vm.userMenuItems.find(
        (item: any) => item.label === 'Sign Out'
      );
      expect(signOutItem).toBeDefined();

      signOutItem.command();

      expect(mockLogout).toHaveBeenCalled();
    });

    it('should navigate to admin when IAM button is clicked', async () => {
      const wrapper = mount(Header);

      const iamButton = wrapper.find('.admin-link');
      await iamButton.trigger('click');

      expect(mockRouter.push).toHaveBeenCalledWith({ name: 'admin' });
    });

    it('should navigate to settings when settings menu item is clicked', async () => {
      const wrapper = mount(Header);

      const settingsItem = wrapper.vm.userMenuItems.find(
        (item: any) => item.label === 'Settings'
      );
      expect(settingsItem).toBeDefined();

      settingsItem.command();

      expect(mockRouter.push).toHaveBeenCalledWith({ name: 'settings' });
    });
  });

  describe('Reactivity', () => {
    it('should update badge when unreadCount changes', async () => {
      const unreadCountRef = ref(5);

      vi.mocked(useNotifications).mockReturnValue({
        notifications: ref([]),
        unreadCount: unreadCountRef,
        preferences: ref(null),
        fetchNotifications: vi.fn(),
        fetchUnreadCount: mockFetchUnreadCount,
        fetchPreferences: vi.fn(),
        markAsRead: vi.fn(),
        markAllAsRead: vi.fn(),
        updatePreferences: vi.fn(),
      });

      const wrapper = mount(Header);
      await wrapper.vm.$nextTick();

      let badge = wrapper.find('.notification-badge');
      expect(badge.exists()).toBe(true);
      expect(badge.text()).toBe('5');

      unreadCountRef.value = 10;
      await wrapper.vm.$nextTick();

      badge = wrapper.find('.notification-badge');
      expect(badge.text()).toBe('10');
    });

    it('should hide badge when unreadCount becomes 0', async () => {
      const unreadCountRef = ref(5);

      vi.mocked(useNotifications).mockReturnValue({
        notifications: ref([]),
        unreadCount: unreadCountRef,
        preferences: ref(null),
        fetchNotifications: vi.fn(),
        fetchUnreadCount: mockFetchUnreadCount,
        fetchPreferences: vi.fn(),
        markAsRead: vi.fn(),
        markAllAsRead: vi.fn(),
        updatePreferences: vi.fn(),
      });

      const wrapper = mount(Header);
      await wrapper.vm.$nextTick();

      let badge = wrapper.find('.notification-badge');
      expect(badge.exists()).toBe(true);

      unreadCountRef.value = 0;
      await wrapper.vm.$nextTick();

      badge = wrapper.find('.notification-badge');
      expect(badge.exists()).toBe(false);
    });

    it('should show badge when unreadCount increases from 0', async () => {
      const unreadCountRef = ref(0);

      vi.mocked(useNotifications).mockReturnValue({
        notifications: ref([]),
        unreadCount: unreadCountRef,
        preferences: ref(null),
        fetchNotifications: vi.fn(),
        fetchUnreadCount: mockFetchUnreadCount,
        fetchPreferences: vi.fn(),
        markAsRead: vi.fn(),
        markAllAsRead: vi.fn(),
        updatePreferences: vi.fn(),
      });

      const wrapper = mount(Header);
      await wrapper.vm.$nextTick();

      let badge = wrapper.find('.notification-badge');
      expect(badge.exists()).toBe(false);

      unreadCountRef.value = 3;
      await wrapper.vm.$nextTick();

      badge = wrapper.find('.notification-badge');
      expect(badge.exists()).toBe(true);
      expect(badge.text()).toBe('3');
    });

    it('should update badge to "99+" when count exceeds 99', async () => {
      const unreadCountRef = ref(50);

      vi.mocked(useNotifications).mockReturnValue({
        notifications: ref([]),
        unreadCount: unreadCountRef,
        preferences: ref(null),
        fetchNotifications: vi.fn(),
        fetchUnreadCount: mockFetchUnreadCount,
        fetchPreferences: vi.fn(),
        markAsRead: vi.fn(),
        markAllAsRead: vi.fn(),
        updatePreferences: vi.fn(),
      });

      const wrapper = mount(Header);
      await wrapper.vm.$nextTick();

      let badge = wrapper.find('.notification-badge');
      expect(badge.text()).toBe('50');

      unreadCountRef.value = 100;
      await wrapper.vm.$nextTick();

      badge = wrapper.find('.notification-badge');
      expect(badge.text()).toBe('99+');
    });
  });
});
