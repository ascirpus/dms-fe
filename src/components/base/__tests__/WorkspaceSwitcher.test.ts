import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref, computed } from 'vue';
import WorkspaceSwitcher from '../WorkspaceSwitcher.vue';

const mockFetchWorkspaces = vi.fn();
const mockSwitchWorkspace = vi.fn();
const mockRouterPush = vi.fn();

vi.mock('@/composables/useWorkspace', () => ({
  useWorkspace: vi.fn(() => ({
    currentWorkspaceName: computed(() => 'Acme Corp'),
    userWorkspaces: ref([
      { tenantId: 'tenant-1', name: 'Acme Corp', role: 'OWNER', createdAt: '2024-01-01' },
      { tenantId: 'tenant-2', name: 'Beta Inc', role: 'MEMBER', createdAt: '2024-02-01' },
    ]),
    workspacesLoaded: ref(true),
    fetchWorkspaces: mockFetchWorkspaces,
    switchWorkspace: mockSwitchWorkspace,
  })),
}));

vi.mock('@/composables/useAuth', () => ({
  useAuth: vi.fn(() => ({
    getCurrentTenantId: () => 'tenant-1',
  })),
}));

vi.mock('primevue/usetoast', () => ({
  useToast: () => ({ add: mockToastAdd }),
}));

const mockToastAdd = vi.fn();

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

const stubs = {
  Popover: {
    template: '<div class="popover-stub"><slot /></div>',
    methods: {
      toggle: vi.fn(),
      hide: vi.fn(),
    },
  },
};

describe('WorkspaceSwitcher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with workspace name', () => {
    const wrapper = mount(WorkspaceSwitcher, {
      global: { stubs },
    });

    expect(wrapper.find('.workspace-name').text()).toBe('Acme Corp');
  });

  it('should render chevron icon', () => {
    const wrapper = mount(WorkspaceSwitcher, {
      global: { stubs },
    });

    expect(wrapper.find('.chevron-icon').exists()).toBe(true);
  });

  it('should show current workspace with check icon', () => {
    const wrapper = mount(WorkspaceSwitcher, {
      global: { stubs },
    });

    expect(wrapper.find('.workspace-item-current').exists()).toBe(true);
    expect(wrapper.find('.check-icon').exists()).toBe(true);
  });

  it('should show other workspaces as switchable', () => {
    const wrapper = mount(WorkspaceSwitcher, {
      global: { stubs },
    });

    const switchable = wrapper.findAll('.workspace-item-switchable');
    expect(switchable).toHaveLength(1);
    expect(switchable[0].text()).toBe('Beta Inc');
  });

  it('should render settings and usage links', () => {
    const wrapper = mount(WorkspaceSwitcher, {
      global: { stubs },
    });

    const links = wrapper.findAll('.workspace-item-link');
    expect(links).toHaveLength(2);
    expect(links[0].text()).toBe('Workspace Settings');
    expect(links[1].text()).toContain('Usage');
  });

  it('should render "New Workspace" add button', () => {
    const wrapper = mount(WorkspaceSwitcher, {
      global: { stubs },
    });

    const addItem = wrapper.find('.workspace-item-add');
    expect(addItem.exists()).toBe(true);
    expect(addItem.text()).toBe('New Workspace');
  });

  it('should show toast when "New Workspace" is clicked', async () => {
    const wrapper = mount(WorkspaceSwitcher, {
      global: { stubs },
    });

    await wrapper.find('.workspace-item-add').trigger('click');

    expect(mockToastAdd).toHaveBeenCalledWith(
      expect.objectContaining({
        severity: 'info',
        summary: 'Coming Soon',
      }),
    );
  });

  it('should not fetch workspaces on mount if already loaded', () => {
    mount(WorkspaceSwitcher, {
      global: { stubs },
    });

    expect(mockFetchWorkspaces).not.toHaveBeenCalled();
  });
});
