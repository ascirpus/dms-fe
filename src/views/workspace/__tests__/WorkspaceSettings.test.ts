import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { computed } from 'vue';
import WorkspaceSettings from '../WorkspaceSettings.vue';

const mockPush = vi.fn();

vi.mock('@/composables/useWorkspace', () => ({
  useWorkspace: vi.fn(() => ({
    currentWorkspaceName: computed(() => 'Acme Corp'),
  })),
}));

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({ name: 'workspace-document-types' })),
  useRouter: vi.fn(() => ({ push: mockPush })),
}));

const stubs = {
  'router-view': { template: '<div class="router-view-stub" />' },
};

describe('WorkspaceSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the page with workspace name in heading', () => {
    const wrapper = mount(WorkspaceSettings, {
      global: { stubs },
    });

    expect(wrapper.find('h1').text()).toBe('Acme Corp Settings');
  });

  it('should render sidebar navigation with Document Types and Members items', () => {
    const wrapper = mount(WorkspaceSettings, {
      global: { stubs },
    });

    const navButtons = wrapper.findAll('nav button');
    expect(navButtons).toHaveLength(2);
    expect(navButtons[0].text()).toBe('Document Types');
    expect(navButtons[1].text()).toBe('Members');
  });

  it('should highlight the active nav item', () => {
    const wrapper = mount(WorkspaceSettings, {
      global: { stubs },
    });

    const navButtons = wrapper.findAll('nav button');
    expect(navButtons[0].classes()).toContain('bg-[var(--primary-color)]');
    expect(navButtons[1].classes()).not.toContain('bg-[var(--primary-color)]');
  });

  it('should navigate when a nav item is clicked', async () => {
    const wrapper = mount(WorkspaceSettings, {
      global: { stubs },
    });

    const navButtons = wrapper.findAll('nav button');
    await navButtons[1].trigger('click');

    expect(mockPush).toHaveBeenCalledWith({ name: 'workspace-members' });
  });

  it('should render the router-view for child content', () => {
    const wrapper = mount(WorkspaceSettings, {
      global: { stubs },
    });

    expect(wrapper.find('.router-view-stub').exists()).toBe(true);
  });
});
