import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { computed, ref } from 'vue';
import { i18n } from '@/plugins/i18n';
import WorkspaceSettings from '../WorkspaceSettings.vue';
import { usePermissions } from '@/composables/usePermissions';
import { useTenantFeatures } from '@/composables/useTenantFeatures';

const mockPush = vi.fn();

vi.mock('@/composables/useWorkspace', () => ({
  useWorkspace: vi.fn(() => ({
    currentWorkspaceName: computed(() => 'Acme Corp'),
  })),
}));

vi.mock('@/composables/usePermissions');
vi.mock('@/composables/useTenantFeatures');

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({ name: 'workspace-document-types' })),
  useRouter: vi.fn(() => ({ push: mockPush })),
}));

const stubs = {
  'router-view': { template: '<div class="router-view-stub" />' },
};

const globalConfig = {
  stubs,
  plugins: [i18n],
};

function mockPermissions(canManageMembers: boolean) {
  vi.mocked(usePermissions).mockReturnValue({
    canManageMembers: computed(() => canManageMembers),
    canManageInvites: computed(() => canManageMembers),
    canManageProjects: computed(() => canManageMembers),
    currentRole: ref(canManageMembers ? 'ADMIN' : 'MEMBER'),
    isAtLeast: vi.fn(),
  } as any);
}

function mockFeatures(selfStorage: boolean) {
  vi.mocked(useTenantFeatures).mockReturnValue({
    selfStorageEnabled: computed(() => selfStorage),
    unlimitedDocumentTypesEnabled: computed(() => false),
    versioningEnabled: computed(() => false),
    tenant: { value: null } as any,
    features: computed(() => []),
    fetchTenant: vi.fn(),
    isFeatureEnabled: vi.fn(),
  } as any);
}

describe('WorkspaceSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPermissions(true);
    mockFeatures(true);
  });

  it('should render the page with workspace name in heading', () => {
    const wrapper = mount(WorkspaceSettings, {
      global: globalConfig,
    });

    expect(wrapper.find('h1').text()).toBe('Acme Corp Settings');
  });

  it('should render sidebar navigation with Document Types, Members, and Storage items for admin with storage feature', () => {
    const wrapper = mount(WorkspaceSettings, {
      global: globalConfig,
    });

    const navButtons = wrapper.findAll('nav button');
    expect(navButtons).toHaveLength(3);
    expect(navButtons[0].text()).toBe('Document Types');
    expect(navButtons[1].text()).toBe('Members');
    expect(navButtons[2].text()).toBe('Storage');
  });

  it('should show Document Types and Storage for member role with storage feature', () => {
    mockPermissions(false);

    const wrapper = mount(WorkspaceSettings, {
      global: globalConfig,
    });

    const navButtons = wrapper.findAll('nav button');
    expect(navButtons).toHaveLength(2);
    expect(navButtons[0].text()).toBe('Document Types');
    expect(navButtons[1].text()).toBe('Storage');
  });

  it('should hide Storage nav item when selfStorageEnabled is false', () => {
    mockFeatures(false);

    const wrapper = mount(WorkspaceSettings, {
      global: globalConfig,
    });

    const navButtons = wrapper.findAll('nav button');
    expect(navButtons).toHaveLength(2);
    expect(navButtons[0].text()).toBe('Document Types');
    expect(navButtons[1].text()).toBe('Members');
  });

  it('should show only Document Types for member without storage feature', () => {
    mockPermissions(false);
    mockFeatures(false);

    const wrapper = mount(WorkspaceSettings, {
      global: globalConfig,
    });

    const navButtons = wrapper.findAll('nav button');
    expect(navButtons).toHaveLength(1);
    expect(navButtons[0].text()).toBe('Document Types');
  });

  it('should highlight the active nav item', () => {
    const wrapper = mount(WorkspaceSettings, {
      global: globalConfig,
    });

    const navButtons = wrapper.findAll('nav button');
    expect(navButtons[0].classes()).toContain('bg-[var(--primary-color)]');
    expect(navButtons[1].classes()).not.toContain('bg-[var(--primary-color)]');
  });

  it('should navigate when a nav item is clicked', async () => {
    const wrapper = mount(WorkspaceSettings, {
      global: globalConfig,
    });

    const navButtons = wrapper.findAll('nav button');
    await navButtons[1].trigger('click');

    expect(mockPush).toHaveBeenCalledWith({ name: 'workspace-members' });
  });

  it('should render the router-view for child content', () => {
    const wrapper = mount(WorkspaceSettings, {
      global: globalConfig,
    });

    expect(wrapper.find('.router-view-stub').exists()).toBe(true);
  });
});
