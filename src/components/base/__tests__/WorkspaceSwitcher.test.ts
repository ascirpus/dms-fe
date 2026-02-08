import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref, computed } from 'vue';
import WorkspaceSwitcher from '../WorkspaceSwitcher.vue';

const mockFetchWorkspaces = vi.fn();
const mockSwitchWorkspace = vi.fn();
const mockRouterPush = vi.fn();

const canCreateWorkspaceRef = ref(true);

vi.mock('@/composables/useWorkspace', () => ({
  useWorkspace: vi.fn(() => ({
    currentWorkspace: ref({ tier: { name: 'Team', maxTenants: 5 } }),
    currentWorkspaceName: computed(() => 'Acme Corp'),
    userWorkspaces: ref([
      { tenantId: 'tenant-1', name: 'Acme Corp', role: 'OWNER', createdAt: '2024-01-01' },
      { tenantId: 'tenant-2', name: 'Beta Inc', role: 'MEMBER', createdAt: '2024-02-01' },
    ]),
    workspacesLoaded: ref(true),
    canCreateWorkspace: canCreateWorkspaceRef,
    fetchWorkspaces: mockFetchWorkspaces,
    switchWorkspace: mockSwitchWorkspace,
  })),
}));

vi.mock('@/composables/useAuth', () => ({
  useAuth: vi.fn(() => ({
    getCurrentTenantId: () => 'tenant-1',
  })),
}));

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
    canCreateWorkspaceRef.value = true;
  });

  it('should render with workspace name', () => {
    const wrapper = mount(WorkspaceSwitcher, {
      global: { stubs },
    });

    expect(wrapper.text()).toContain('Acme Corp');
  });

  it('should render chevron icon', () => {
    const wrapper = mount(WorkspaceSwitcher, {
      global: { stubs },
    });

    expect(wrapper.find('.pi-chevron-down').exists()).toBe(true);
  });

  it('should show current workspace with check icon', () => {
    const wrapper = mount(WorkspaceSwitcher, {
      global: { stubs },
    });

    expect(wrapper.find('.pi-check').exists()).toBe(true);
    expect(wrapper.text()).toContain('Acme Corp');
  });

  it('should show other workspaces as switchable', () => {
    const wrapper = mount(WorkspaceSwitcher, {
      global: { stubs },
    });

    expect(wrapper.text()).toContain('Beta Inc');
  });

  it('should render settings and usage links', () => {
    const wrapper = mount(WorkspaceSwitcher, {
      global: { stubs },
    });

    expect(wrapper.text()).toContain('Workspace Settings');
    expect(wrapper.text()).toContain('Usage');
  });

  it('should render "New Workspace" add button', () => {
    const wrapper = mount(WorkspaceSwitcher, {
      global: { stubs },
    });

    expect(wrapper.text()).toContain('New Workspace');
  });

  it('should navigate to create-workspace when canCreateWorkspace is true', async () => {
    canCreateWorkspaceRef.value = true;

    const wrapper = mount(WorkspaceSwitcher, {
      global: { stubs },
    });

    const popoverContent = wrapper.find('.popover-stub');
    const items = popoverContent.findAll('div[class*="cursor-pointer"]');
    const addItem = items.find(el => el.text().includes('New Workspace'));
    expect(addItem).toBeDefined();

    await addItem!.trigger('click');

    expect(mockRouterPush).toHaveBeenCalledWith({ name: 'create-workspace' });
  });

  it('should navigate to workspace-overview when canCreateWorkspace is false', async () => {
    canCreateWorkspaceRef.value = false;

    const wrapper = mount(WorkspaceSwitcher, {
      global: { stubs },
    });

    const popoverContent = wrapper.find('.popover-stub');
    const items = popoverContent.findAll('div[class*="cursor-pointer"]');
    const addItem = items.find(el => el.text().includes('New Workspace'));
    expect(addItem).toBeDefined();

    await addItem!.trigger('click');

    expect(mockRouterPush).toHaveBeenCalledWith({ name: 'workspace-overview' });
  });

  it('should not fetch workspaces on mount if already loaded', () => {
    mount(WorkspaceSwitcher, {
      global: { stubs },
    });

    expect(mockFetchWorkspaces).not.toHaveBeenCalled();
  });
});
