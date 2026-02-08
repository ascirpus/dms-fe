import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { ref, computed } from 'vue';
import WorkspaceOverview from '../WorkspaceOverview.vue';
import type { Tenant } from '@/types';

const mockFetchCurrentWorkspace = vi.fn();

function makeTenant(overrides: Partial<Tenant> = {}): Tenant {
  return {
    id: 'tenant-1',
    name: 'Acme Corp',
    tier: {
      id: 'tier-1',
      name: 'Pro',
      maxProjects: 10,
      maxDocumentsPerProject: 50,
      maxStorageMb: 1024,
      features: [
        { feature: 'DOCUMENT_VERSIONING', enabled: true, config: {} },
        { feature: 'OCR_PROCESSING', enabled: false, config: {} },
      ],
    },
    usage: { projectsCount: 3, documentsCount: 12, storageUsedMb: 256 },
    createdAt: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

const workspaceRef = ref<Tenant | null>(null);

vi.mock('@/composables/useWorkspace', () => ({
  useWorkspace: vi.fn(() => ({
    currentWorkspace: workspaceRef,
    fetchCurrentWorkspace: mockFetchCurrentWorkspace,
  })),
}));

vi.mock('@/composables/useAuth', () => ({
  useAuth: vi.fn(() => ({
    apiClient: {
      get: vi.fn().mockResolvedValue({ data: { data: [] } }),
      post: vi.fn(),
      put: vi.fn(),
    },
  })),
}));

vi.mock('primevue/usetoast', () => ({
  useToast: () => ({ add: vi.fn() }),
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

const stubs = {
  ProgressBar: { template: '<div class="progress-bar" />', props: ['value', 'showValue', 'severity'] },
  Button: { template: '<button @click="$attrs.onClick?.($event)"><slot /></button>', inheritAttrs: true },
  ProgressSpinner: { template: '<div class="spinner" />' },
};

describe('WorkspaceOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    workspaceRef.value = null;
  });

  it('should show loading spinner initially', () => {
    mockFetchCurrentWorkspace.mockImplementation(() => new Promise(() => {}));

    const wrapper = mount(WorkspaceOverview, {
      global: { stubs },
    });

    expect(wrapper.find('.loading-container').exists()).toBe(true);
  });

  it('should render workspace name and tier badge after loading', async () => {
    const tenant = makeTenant();
    mockFetchCurrentWorkspace.mockImplementation(async () => {
      workspaceRef.value = tenant;
      return tenant;
    });

    const wrapper = mount(WorkspaceOverview, {
      global: { stubs },
    });

    await flushPromises();

    expect(wrapper.find('.workspace-name').text()).toBe('Acme Corp');
    expect(wrapper.find('.tier-badge').text()).toBe('Pro');
  });

  it('should render usage metrics cards', async () => {
    const tenant = makeTenant();
    mockFetchCurrentWorkspace.mockImplementation(async () => {
      workspaceRef.value = tenant;
      return tenant;
    });

    const wrapper = mount(WorkspaceOverview, {
      global: { stubs },
    });

    await flushPromises();

    const cards = wrapper.findAll('.usage-card');
    expect(cards).toHaveLength(3);
    expect(cards[0].find('.usage-label').text()).toBe('Projects');
    expect(cards[1].find('.usage-label').text()).toBe('Documents');
    expect(cards[2].find('.usage-label').text()).toBe('Storage');
  });

  it('should render features with check/cross icons', async () => {
    const tenant = makeTenant();
    mockFetchCurrentWorkspace.mockImplementation(async () => {
      workspaceRef.value = tenant;
      return tenant;
    });

    const wrapper = mount(WorkspaceOverview, {
      global: { stubs },
    });

    await flushPromises();

    const features = wrapper.findAll('.feature-item');
    expect(features).toHaveLength(2);
    expect(features[0].find('.feature-enabled').exists()).toBe(true);
    expect(features[1].find('.feature-disabled').exists()).toBe(true);
  });

  it('should render upgrade card section', async () => {
    const tenant = makeTenant();
    mockFetchCurrentWorkspace.mockImplementation(async () => {
      workspaceRef.value = tenant;
      return tenant;
    });

    const wrapper = mount(WorkspaceOverview, {
      global: { stubs },
    });

    await flushPromises();

    expect(wrapper.find('.upgrade-card').exists()).toBe(true);
    expect(wrapper.find('.upgrade-heading').text()).toBe('Need more from your workspace?');
  });

  it('should not show cleanup section when usage is below 80%', async () => {
    const tenant = makeTenant();
    mockFetchCurrentWorkspace.mockImplementation(async () => {
      workspaceRef.value = tenant;
      return tenant;
    });

    const wrapper = mount(WorkspaceOverview, {
      global: { stubs },
    });

    await flushPromises();

    expect(wrapper.find('.cleanup-list').exists()).toBe(false);
  });
});
