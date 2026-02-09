import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { ref, nextTick } from 'vue';
import ProfileNotifications from '../ProfileNotifications.vue';
import type { NotificationPreferences } from '@/types/Notification';

const mockFetchPreferences = vi.fn();
const mockUpdatePreferences = vi.fn();

vi.mock('@/composables/useNotifications', () => ({
  useNotifications: vi.fn(() => ({
    fetchPreferences: mockFetchPreferences,
    updatePreferences: mockUpdatePreferences,
    preferences: ref(null),
    notifications: ref([]),
    unreadCount: ref(0),
    fetchNotifications: vi.fn(),
    fetchUnreadCount: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
  })),
}));

const globalStubs = {
  ToggleSwitch: {
    inheritAttrs: false,
    template: '<button :data-testid="$attrs[\'data-testid\'] || \'toggle\'" :class="{ \'toggle-on\': modelValue }" @click="$emit(\'update:modelValue\', !modelValue)">{{ modelValue ? \'on\' : \'off\' }}</button>',
    props: ['modelValue'],
  },
  Button: {
    inheritAttrs: false,
    template: '<button :data-testid="$attrs[\'data-testid\']" @click="$emit(\'click\', $event)">{{ label }}</button>',
    props: ['label', 'text', 'size', 'icon', 'severity', 'rounded'],
  },
  ProgressSpinner: { template: '<div data-testid="spinner">Loading...</div>' },
};

describe('ProfileNotifications.vue', () => {
  function createDefaultPreferences(): NotificationPreferences {
    return {
      'project.user_added': { web: true, email: false },
      'project.user_removed': { web: false, email: true },
      'document.added': { web: true, email: true },
      'document.removed': { web: false, email: false },
      'document.approved': { web: true, email: false },
      'document.rejected': { web: false, email: false },
      'document.updated.version': { web: true, email: false },
      'document.updated.comment_added': { web: true, email: true },
      'document.updated.comment_resolved': { web: false, email: false },
      'document.action_date_approaching': { web: true, email: true },
      'document.approval_deadline_approaching': { web: true, email: false },
      'document.signature_deadline_approaching': { web: false, email: true },
    };
  }

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchPreferences.mockResolvedValue(createDefaultPreferences());
    mockUpdatePreferences.mockResolvedValue(undefined);
  });

  function mountComponent() {
    return mount(ProfileNotifications, {
      global: { stubs: globalStubs },
    });
  }

  it('should show loading state while fetching preferences', async () => {
    let resolvePrefs: (value: NotificationPreferences) => void;
    mockFetchPreferences.mockReturnValue(new Promise(resolve => {
      resolvePrefs = resolve;
    }));

    const wrapper = mountComponent();

    expect(wrapper.find('[data-testid="spinner"]').exists()).toBe(true);

    resolvePrefs!(createDefaultPreferences());
    await flushPromises();

    expect(wrapper.find('[data-testid="spinner"]').exists()).toBe(false);
  });

  it('should render all event type groups', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    const text = wrapper.text();
    expect(text).toContain('Project');
    expect(text).toContain('Documents');
    expect(text).toContain('Document Updates');
    expect(text).toContain('Deadline Reminders');
  });

  it('should render correct number of toggles (2 per event, 12 events)', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    const toggles = wrapper.findAll('[data-testid="toggle"]');
    expect(toggles).toHaveLength(24);
  });

  it('should display initial preference states correctly', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    const toggles = wrapper.findAll('[data-testid="toggle"]');

    // First event (project.user_added): web=true, email=false
    expect(toggles[0].classes()).toContain('toggle-on');
    expect(toggles[1].classes()).not.toContain('toggle-on');
  });

  it('should call updatePreferences when toggling a channel', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    const toggles = wrapper.findAll('[data-testid="toggle"]');
    await toggles[1].trigger('click');

    expect(mockUpdatePreferences).toHaveBeenCalledTimes(1);
    const calledWith = mockUpdatePreferences.mock.calls[0][0];
    expect(calledWith['project.user_added'].email).toBe(true);
  });

  it('should revert on update error', async () => {
    mockUpdatePreferences.mockRejectedValueOnce(new Error('API error'));

    const wrapper = mountComponent();
    await flushPromises();

    let toggles = wrapper.findAll('[data-testid="toggle"]');
    expect(toggles[1].text()).toBe('off');

    await toggles[1].trigger('click');

    await flushPromises();
    await nextTick();
    await flushPromises();

    toggles = wrapper.findAll('[data-testid="toggle"]');
    expect(toggles[1].text()).toBe('off');
  });

  it('should render event labels and descriptions', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    expect(wrapper.text()).toContain('Added to project');
    expect(wrapper.text()).toContain('When you are added as a member to a project');
    expect(wrapper.text()).toContain('Document added');
    expect(wrapper.text()).toContain('When a new document is uploaded to a project you belong to');
    expect(wrapper.text()).toContain('Version updated');
    expect(wrapper.text()).toContain('When a new version of a document is uploaded');
    expect(wrapper.text()).toContain('Action date approaching');
    expect(wrapper.text()).toContain('Reminder before a document\'s required action date');
  });

  it('should default missing preferences to enabled (true)', async () => {
    mockFetchPreferences.mockResolvedValue({});

    const wrapper = mountComponent();
    await flushPromises();

    const toggles = wrapper.findAll('[data-testid="toggle"]');
    for (const toggle of toggles) {
      expect(toggle.classes()).toContain('toggle-on');
    }
  });

  it('should show bulk toggle switches for web and email', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    const allWebToggle = wrapper.find('[data-testid="toggle-all-web"]');
    const allEmailToggle = wrapper.find('[data-testid="toggle-all-email"]');

    expect(allWebToggle.exists()).toBe(true);
    expect(allEmailToggle.exists()).toBe(true);
  });

  it('should reflect all-off state when not all notifications are enabled', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    const allWebToggle = wrapper.find('[data-testid="toggle-all-web"]');
    const allEmailToggle = wrapper.find('[data-testid="toggle-all-email"]');

    // Default prefs have mixed states — not all on, so switches should be off
    expect(allWebToggle.classes()).not.toContain('toggle-on');
    expect(allEmailToggle.classes()).not.toContain('toggle-on');
  });

  it('should reflect all-on state when all notifications are enabled', async () => {
    const allOnPrefs: NotificationPreferences = {};
    for (const key of [
      'project.user_added', 'project.user_removed',
      'document.added', 'document.removed', 'document.approved', 'document.rejected',
      'document.updated.version', 'document.updated.comment_added', 'document.updated.comment_resolved',
      'document.action_date_approaching', 'document.approval_deadline_approaching', 'document.signature_deadline_approaching',
    ]) {
      allOnPrefs[key] = { web: true, email: true };
    }
    mockFetchPreferences.mockResolvedValue(allOnPrefs);

    const wrapper = mountComponent();
    await flushPromises();

    const allWebToggle = wrapper.find('[data-testid="toggle-all-web"]');
    const allEmailToggle = wrapper.find('[data-testid="toggle-all-email"]');

    expect(allWebToggle.classes()).toContain('toggle-on');
    expect(allEmailToggle.classes()).toContain('toggle-on');
  });

  it('should turn all web toggles off when toggle-all is switched off', async () => {
    const allOnPrefs: NotificationPreferences = {};
    for (const key of [
      'project.user_added', 'project.user_removed',
      'document.added', 'document.removed', 'document.approved', 'document.rejected',
      'document.updated.version', 'document.updated.comment_added', 'document.updated.comment_resolved',
      'document.action_date_approaching', 'document.approval_deadline_approaching', 'document.signature_deadline_approaching',
    ]) {
      allOnPrefs[key] = { web: true, email: true };
    }
    mockFetchPreferences.mockResolvedValue(allOnPrefs);

    const wrapper = mountComponent();
    await flushPromises();

    const allWebToggle = wrapper.find('[data-testid="toggle-all-web"]');
    expect(allWebToggle.classes()).toContain('toggle-on');

    mockUpdatePreferences.mockClear();
    await allWebToggle.trigger('click');
    await flushPromises();

    expect(mockUpdatePreferences).toHaveBeenCalledTimes(1);
    const calledWith = mockUpdatePreferences.mock.calls[0][0];
    for (const key of Object.keys(calledWith)) {
      expect(calledWith[key].web).toBe(false);
    }
  });

  it('should turn all email toggles on when toggle-all is switched on', async () => {
    const wrapper = mountComponent();
    await flushPromises();

    const allEmailToggle = wrapper.find('[data-testid="toggle-all-email"]');
    // Mixed email states → not all on → switch is off
    expect(allEmailToggle.classes()).not.toContain('toggle-on');

    mockUpdatePreferences.mockClear();
    await allEmailToggle.trigger('click');
    await flushPromises();

    expect(mockUpdatePreferences).toHaveBeenCalledTimes(1);
    const calledWith = mockUpdatePreferences.mock.calls[0][0];
    for (const key of Object.keys(calledWith)) {
      expect(calledWith[key].email).toBe(true);
    }
  });
});
