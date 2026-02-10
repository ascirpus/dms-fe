import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { ref } from 'vue';
import PublicLayout from '../PublicLayout.vue';
import { useAuth } from '@/composables/useAuth';
import { useMainStore } from '@/stores/mainStore';

vi.mock('@/composables/useAuth');
vi.mock('@/stores/mainStore');
vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  RouterLink: { template: '<a><slot /></a>', props: ['to'] },
  RouterView: { template: '<div />' },
}));
vi.mock('@/components/base/Logo.vue', () => ({ default: { template: '<span>Logo</span>' } }));
vi.mock('@/components/base/Footer.vue', () => ({ default: { template: '<footer>Footer</footer>' } }));

const globalStubs = {
  Button: {
    template: '<button :aria-label="ariaLabel" @click="$emit(\'click\', $event)"><i v-if="icon" :class="icon" /><slot>{{ label }}</slot></button>',
    props: ['label', 'icon', 'text', 'rounded', 'iconPos', 'severity', 'ariaLabel'],
  },
};

describe('PublicLayout.vue', () => {
  let mockSetTheme: ReturnType<typeof vi.fn>;
  let mockUpdateProfile: ReturnType<typeof vi.fn>;
  let mockLogin: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockSetTheme = vi.fn();
    mockUpdateProfile = vi.fn().mockResolvedValue(undefined);
    mockLogin = vi.fn();

    vi.mocked(useMainStore).mockReturnValue({
      theme: 'light',
      setTheme: mockSetTheme,
    } as any);

    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: ref(false),
      login: mockLogin,
      updateProfile: mockUpdateProfile,
      currentUser: ref(null),
      getCurrentUser: vi.fn(() => null),
    } as any);
  });

  function mountLayout() {
    return mount(PublicLayout, { global: { stubs: globalStubs } });
  }

  it('renders theme toggle button', () => {
    const wrapper = mountLayout();
    const toggleBtn = wrapper.find('button[aria-label="Toggle theme"]');
    expect(toggleBtn.exists()).toBe(true);
  });

  it('shows moon icon when theme is light', () => {
    const wrapper = mountLayout();
    const toggleBtn = wrapper.find('button[aria-label="Toggle theme"]');
    expect(toggleBtn.find('i.pi-moon').exists()).toBe(true);
  });

  it('shows sun icon when theme is dark', () => {
    vi.mocked(useMainStore).mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
    } as any);

    const wrapper = mountLayout();
    const toggleBtn = wrapper.find('button[aria-label="Toggle theme"]');
    expect(toggleBtn.find('i.pi-sun').exists()).toBe(true);
  });

  it('calls store.setTheme when clicking toggle', async () => {
    const wrapper = mountLayout();
    const toggleBtn = wrapper.find('button[aria-label="Toggle theme"]');

    await toggleBtn.trigger('click');

    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('switches from dark to light on toggle', async () => {
    vi.mocked(useMainStore).mockReturnValue({
      theme: 'dark',
      setTheme: mockSetTheme,
    } as any);

    const wrapper = mountLayout();
    const toggleBtn = wrapper.find('button[aria-label="Toggle theme"]');

    await toggleBtn.trigger('click');

    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('does not call updateProfile when unauthenticated', async () => {
    const wrapper = mountLayout();
    const toggleBtn = wrapper.find('button[aria-label="Toggle theme"]');

    await toggleBtn.trigger('click');

    expect(mockUpdateProfile).not.toHaveBeenCalled();
  });

  it('calls updateProfile when authenticated', async () => {
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: ref(true),
      login: mockLogin,
      updateProfile: mockUpdateProfile,
      currentUser: ref({ email: 'test@example.com' }),
      getCurrentUser: vi.fn(),
    } as any);

    const wrapper = mountLayout();
    const toggleBtn = wrapper.find('button[aria-label="Toggle theme"]');

    await toggleBtn.trigger('click');

    expect(mockSetTheme).toHaveBeenCalledWith('dark');
    expect(mockUpdateProfile).toHaveBeenCalledWith({ themePreference: 'dark' });
  });
});
