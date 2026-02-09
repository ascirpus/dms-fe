import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { ref } from 'vue';
import Header from '../Header.vue';
import { useAuth } from '@/composables/useAuth';
import { useNotifications } from '@/composables/useNotifications';
import { useMainStore } from '@/stores/mainStore';
import { useRouter, useRoute } from 'vue-router';

vi.mock('@/composables/useAuth');
vi.mock('@/composables/useNotifications');
vi.mock('vue-router');
vi.mock('@/stores/mainStore');
vi.mock('@/composables/useSearch', () => ({
  useSearch: vi.fn(() => ({
    query: ref(''),
    results: ref([]),
    loading: ref(false),
    search: vi.fn(),
    clear: vi.fn(),
  })),
}));
vi.mock('@/composables/useProjects', () => ({
  useProjects: vi.fn(() => ({
    resolveProject: vi.fn(),
    projects: ref([]),
    loading: ref(false),
  })),
}));

const globalStubs = {
  Avatar: {
    template: '<div :class="[$attrs.class]" @click="$emit(\'click\', $event)"><slot>{{ label }}</slot></div>',
    props: ['image', 'label', 'shape', 'size'],
    inheritAttrs: false,
  },
  Button: {
    template: '<button :class="[$attrs.class]" :aria-label="$attrs[\'aria-label\']" @click="$emit(\'click\', $event)"><slot>{{ label }}</slot></button>',
    props: ['label', 'icon', 'text', 'rounded', 'severity'],
    inheritAttrs: false,
  },
  Badge: {
    name: 'Badge',
    template: '<span :class="[$attrs.class]">{{ value }}</span>',
    props: ['value', 'severity'],
    inheritAttrs: false,
  },
  Menu: {
    template: '<div />',
    props: ['model', 'popup'],
    methods: { toggle: vi.fn() },
  },
  InputText: {
    template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue', 'placeholder', 'size'],
  },
  InputIcon: { template: '<span><slot /></span>' },
  IconField: { template: '<div><slot /></div>' },
  Logo: { template: '<div class="logo-stub" />' },
  WorkspaceSwitcher: { template: '<div class="workspace-switcher-stub" />' },
  'router-link': {
    template: '<a :class="[$attrs.class]" :href="to"><slot /></a>',
    props: ['to'],
  },
};

describe('Header.vue', () => {
  let mockRouter: any;
  let mockFetchUnreadCount: any;
  let mockLogout: any;
  let mockSetTheme: any;
  let mockUpdateProfile: any;

  beforeEach(() => {
    mockRouter = {
      push: vi.fn(),
    };

    mockFetchUnreadCount = vi.fn().mockResolvedValue(5);
    mockLogout = vi.fn();
    mockSetTheme = vi.fn();
    mockUpdateProfile = vi.fn().mockResolvedValue(null);

    vi.mocked(useRouter).mockReturnValue(mockRouter);
    vi.mocked(useRoute).mockReturnValue({
      params: {},
      query: {},
      name: 'home',
      path: '/',
      matched: [],
    } as any);

    vi.mocked(useMainStore).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    } as any);

    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: ref(true),
      getCurrentUser: vi.fn(() => ({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        picture: 'https://example.com/avatar.jpg',
      })),
      logout: mockLogout,
      updateProfile: mockUpdateProfile,
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

  function mountHeader() {
    return mount(Header, { global: { stubs: globalStubs } });
  }

  describe('Initial Render', () => {
    it('should render the header element', () => {
      const wrapper = mountHeader();

      expect(wrapper.find('header').exists()).toBe(true);
    });

    it('should render the logo', () => {
      const wrapper = mountHeader();

      expect(wrapper.find('.logo-stub').exists()).toBe(true);
    });

    it('should render notification bell button', () => {
      const wrapper = mountHeader();

      const bellButton = wrapper.find('[aria-label="Notifications"]');
      expect(bellButton.exists()).toBe(true);
    });

    it('should render theme toggle button', () => {
      const wrapper = mountHeader();

      const themeButton = wrapper.find('[aria-label="Toggle theme"]');
      expect(themeButton.exists()).toBe(true);
    });

    it('should not show badge when unreadCount is 0', () => {
      const wrapper = mountHeader();

      const badges = wrapper.findAll('span').filter(s => s.text().match(/^\d+$/));
      expect(badges.length).toBe(0);
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

      const wrapper = mountHeader();

      const badge = wrapper.findComponent({ name: 'Badge' });
      expect(badge.exists()).toBe(true);
      expect(badge.props('value')).toBe('5');
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

      const wrapper = mountHeader();

      const badge = wrapper.findComponent({ name: 'Badge' });
      expect(badge.props('value')).toBe('99+');
    });
  });

  describe('Authentication', () => {
    it('should fetch unread count on mount if user is authenticated', async () => {
      mountHeader();
      await flushPromises();

      expect(mockFetchUnreadCount).toHaveBeenCalled();
    });

    it('should not fetch unread count if user is not authenticated', async () => {
      mockFetchUnreadCount.mockClear();

      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: ref(false),
        getCurrentUser: vi.fn(() => null),
        logout: mockLogout,
        updateProfile: mockUpdateProfile,
      } as any);

      mountHeader();
      await flushPromises();

      expect(mockFetchUnreadCount).not.toHaveBeenCalled();
    });

    it('should show "Sign In" option when not authenticated', async () => {
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: ref(false),
        getCurrentUser: vi.fn(() => null),
        logout: mockLogout,
        updateProfile: mockUpdateProfile,
      } as any);

      const wrapper = mountHeader();
      await flushPromises();

      expect(wrapper.vm.userMenuItems).toContainEqual(
        expect.objectContaining({ label: 'Sign In' })
      );
    });
  });

  describe('Interactions', () => {
    it('should navigate to notifications page when bell icon is clicked', async () => {
      const wrapper = mountHeader();

      const bellButton = wrapper.find('[aria-label="Notifications"]');
      await bellButton.trigger('click');

      expect(mockRouter.push).toHaveBeenCalledWith({ name: 'notifications' });
    });

    it('should navigate to profile when profile menu item is clicked', async () => {
      const wrapper = mountHeader();

      const profileItem = wrapper.vm.userMenuItems.find((item: any) => item.label === 'Profile');
      expect(profileItem).toBeDefined();

      profileItem.command();

      expect(mockRouter.push).toHaveBeenCalledWith({ name: 'profile-general' });
    });

    it('should call logout when sign out is clicked', async () => {
      const wrapper = mountHeader();

      const signOutItem = wrapper.vm.userMenuItems.find(
        (item: any) => item.label === 'Sign Out'
      );
      expect(signOutItem).toBeDefined();

      signOutItem.command();

      expect(mockLogout).toHaveBeenCalled();
    });

    it('should navigate to admin when IAM button is clicked', async () => {
      const wrapper = mountHeader();

      const buttons = wrapper.findAll('button');
      const iamButton = buttons.find(b => b.text().includes('IAM'));
      expect(iamButton).toBeDefined();

      await iamButton!.trigger('click');

      expect(mockRouter.push).toHaveBeenCalledWith({ name: 'admin' });
    });

    it('should toggle theme when theme button is clicked', async () => {
      const wrapper = mountHeader();

      const themeButton = wrapper.find('[aria-label="Toggle theme"]');
      await themeButton.trigger('click');

      expect(mockSetTheme).toHaveBeenCalledWith('dark');
      expect(mockUpdateProfile).toHaveBeenCalledWith({ themePreference: 'dark' });
    });

    it('should toggle from dark to light', async () => {
      vi.mocked(useMainStore).mockReturnValue({
        theme: 'dark',
        setTheme: mockSetTheme,
      } as any);

      const wrapper = mountHeader();

      const themeButton = wrapper.find('[aria-label="Toggle theme"]');
      await themeButton.trigger('click');

      expect(mockSetTheme).toHaveBeenCalledWith('light');
      expect(mockUpdateProfile).toHaveBeenCalledWith({ themePreference: 'light' });
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

      const wrapper = mountHeader();
      await wrapper.vm.$nextTick();

      let badge = wrapper.findComponent({ name: 'Badge' });
      expect(badge.exists()).toBe(true);
      expect(badge.props('value')).toBe('5');

      unreadCountRef.value = 10;
      await wrapper.vm.$nextTick();

      badge = wrapper.findComponent({ name: 'Badge' });
      expect(badge.props('value')).toBe('10');
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

      const wrapper = mountHeader();
      await wrapper.vm.$nextTick();

      expect(wrapper.findComponent({ name: 'Badge' }).exists()).toBe(true);

      unreadCountRef.value = 0;
      await wrapper.vm.$nextTick();

      expect(wrapper.findComponent({ name: 'Badge' }).exists()).toBe(false);
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

      const wrapper = mountHeader();
      await wrapper.vm.$nextTick();

      expect(wrapper.findComponent({ name: 'Badge' }).exists()).toBe(false);

      unreadCountRef.value = 3;
      await wrapper.vm.$nextTick();

      const badge = wrapper.findComponent({ name: 'Badge' });
      expect(badge.exists()).toBe(true);
      expect(badge.props('value')).toBe('3');
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

      const wrapper = mountHeader();
      await wrapper.vm.$nextTick();

      let badge = wrapper.findComponent({ name: 'Badge' });
      expect(badge.props('value')).toBe('50');

      unreadCountRef.value = 100;
      await wrapper.vm.$nextTick();

      badge = wrapper.findComponent({ name: 'Badge' });
      expect(badge.props('value')).toBe('99+');
    });
  });
});
