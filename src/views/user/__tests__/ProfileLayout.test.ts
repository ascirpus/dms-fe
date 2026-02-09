import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { ref } from 'vue';
import ProfileLayout from '../ProfileLayout.vue';

const mockPush = vi.fn();
const mockRouteName = ref('profile-general');

vi.mock('vue-router', () => ({
  useRoute: () => ({
    name: mockRouteName.value,
  }),
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock('@/composables/useAuth', () => ({
  useAuth: vi.fn(() => ({
    currentUser: ref({
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
    }),
    getCurrentUser: vi.fn(() => ({
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
    })),
    fetchCurrentUser: vi.fn().mockResolvedValue(null),
  })),
}));

describe('ProfileLayout.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRouteName.value = 'profile-general';
  });

  function mountLayout() {
    return mount(ProfileLayout, {
      global: {
        stubs: {
          'router-view': { template: '<div data-testid="router-view" />' },
        },
      },
    });
  }

  it('should render the user full name as heading', async () => {
    const wrapper = mountLayout();
    await flushPromises();

    expect(wrapper.find('h1').text()).toBe('John Doe');
  });

  it('should render all three sidebar nav links', async () => {
    const wrapper = mountLayout();
    await flushPromises();

    const buttons = wrapper.findAll('nav button');
    expect(buttons).toHaveLength(3);
    expect(buttons[0].text()).toContain('General');
    expect(buttons[1].text()).toContain('Notifications');
    expect(buttons[2].text()).toContain('Appearance');
  });

  it('should highlight the active link based on current route', async () => {
    mockRouteName.value = 'profile-notifications';
    const wrapper = mountLayout();
    await flushPromises();

    const buttons = wrapper.findAll('nav button');
    // Notifications button should have active class
    expect(buttons[1].classes()).toContain('bg-[var(--primary-color)]');
    expect(buttons[1].classes()).toContain('text-white');
    // General button should not
    expect(buttons[0].classes()).not.toContain('bg-[var(--primary-color)]');
  });

  it('should navigate when clicking a nav link', async () => {
    const wrapper = mountLayout();
    await flushPromises();

    const buttons = wrapper.findAll('nav button');
    await buttons[1].trigger('click');

    expect(mockPush).toHaveBeenCalledWith({ name: 'profile-notifications' });
  });

  it('should render the router-view for child content', async () => {
    const wrapper = mountLayout();
    await flushPromises();

    expect(wrapper.find('[data-testid="router-view"]').exists()).toBe(true);
  });
});
