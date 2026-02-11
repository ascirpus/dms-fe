import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { ref, computed } from 'vue';
import WorkspaceOverview from '../WorkspaceOverview.vue';
import type { Tenant } from '@/types';

const mockFetchCurrentWorkspace = vi.fn();
const mockFetchBillingStatus = vi.fn().mockResolvedValue({});
const mockFetchPlans = vi.fn().mockResolvedValue([]);
const mockStartCheckout = vi.fn();
const mockOpenBillingPortal = vi.fn();
const mockCancelSubscription = vi.fn();

function makeTenant(overrides: Partial<Tenant> = {}): Tenant {
  return {
    id: 'tenant-1',
    name: 'Acme Corp',
    tier: {
      id: 'tier-1',
      name: 'Pro',
      rank: 1,
      maxProjects: 10,
      maxDocumentsPerProject: 50,
      maxStorageMb: 1024,
      maxDocumentSizeMb: 50,
      maxUsersPerProject: 20,
      maxTenants: 5,
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

const billingPlansRef = ref<any[]>([]);

vi.mock('@/composables/useBilling', () => ({
  useBilling: vi.fn(() => ({
    billingStatus: ref(null),
    plans: billingPlansRef,
    isSubscribed: computed(() => false),
    currentSubscription: computed(() => null),
    fetchBillingStatus: mockFetchBillingStatus,
    fetchPlans: mockFetchPlans,
    startCheckout: mockStartCheckout,
    openBillingPortal: mockOpenBillingPortal,
    cancelSubscription: mockCancelSubscription,
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
  Dialog: { template: '<div><slot /><slot name="footer" /></div>' },
  SelectButton: { template: '<div />', props: ['modelValue', 'options', 'optionLabel', 'optionValue', 'allowEmpty'] },
};

describe('WorkspaceOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    workspaceRef.value = null;
    billingPlansRef.value = [];
  });

  it('should show loading spinner initially', () => {
    mockFetchCurrentWorkspace.mockImplementation(() => new Promise(() => {}));

    const wrapper = mount(WorkspaceOverview, {
      global: { stubs },
    });

    expect(wrapper.text()).toContain('Loading workspace...');
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

    expect(wrapper.find('h1').text()).toBe('Acme Corp');
    expect(wrapper.text()).toContain('PRO');
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

    expect(wrapper.text()).toContain('Projects');
    expect(wrapper.text()).toContain('Documents');
    expect(wrapper.text()).toContain('Storage');
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

    expect(wrapper.find('.pi-check-circle').exists()).toBe(true);
    expect(wrapper.find('.pi-times-circle').exists()).toBe(true);
    expect(wrapper.text()).toContain('DOCUMENT VERSIONING');
    expect(wrapper.text()).toContain('OCR PROCESSING');
  });

  it('should render upgrade section when not subscribed', async () => {
    const tenant = makeTenant();
    mockFetchCurrentWorkspace.mockImplementation(async () => {
      workspaceRef.value = tenant;
      return tenant;
    });

    const wrapper = mount(WorkspaceOverview, {
      global: { stubs },
    });

    await flushPromises();

    expect(wrapper.text()).toContain('Need more from your workspace?');
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

    expect(wrapper.text()).not.toContain('Cleanup Suggestions');
  });

  it('should show "2 months free" text for yearly plans instead of savings percentage', async () => {
    const tenant = makeTenant({ tier: { ...makeTenant().tier, name: 'Free', rank: 0 } });
    mockFetchCurrentWorkspace.mockImplementation(async () => {
      workspaceRef.value = tenant;
      return tenant;
    });
    billingPlansRef.value = [
      {
        id: 'plan-team',
        name: 'Team',
        currency: 'eur',
        prices: [
          { interval: 'MONTHLY', priceInCents: 4900 },
          { interval: 'YEARLY', priceInCents: 49000 },
        ],
      },
    ];

    const wrapper = mount(WorkspaceOverview, {
      global: { stubs },
    });

    await flushPromises();

    expect(wrapper.text()).toContain('2 months free');
    expect(wrapper.text()).not.toMatch(/Save \d+%/);
  });

  it('should show only the cheapest next plan for Free tier users', async () => {
    const tenant = makeTenant({ tier: { ...makeTenant().tier, name: 'Free', rank: 0 } });
    mockFetchCurrentWorkspace.mockImplementation(async () => {
      workspaceRef.value = tenant;
      return tenant;
    });
    billingPlansRef.value = [
      {
        id: 'plan-business',
        name: 'Business',
        currency: 'eur',
        prices: [
          { interval: 'MONTHLY', priceInCents: 14900 },
          { interval: 'YEARLY', priceInCents: 149000 },
        ],
      },
      {
        id: 'plan-team',
        name: 'Team',
        currency: 'eur',
        prices: [
          { interval: 'MONTHLY', priceInCents: 4900 },
          { interval: 'YEARLY', priceInCents: 49000 },
        ],
      },
    ];

    const wrapper = mount(WorkspaceOverview, {
      global: { stubs },
    });

    await flushPromises();

    const planNames = wrapper.findAll('h3').map(h => h.text());
    expect(planNames).toContain('Team');
    expect(planNames).not.toContain('Business');
  });

  it('should show contact sales for Business tier users', async () => {
    const tenant = makeTenant({ tier: { ...makeTenant().tier, name: 'Business', rank: 2 } });
    mockFetchCurrentWorkspace.mockImplementation(async () => {
      workspaceRef.value = tenant;
      return tenant;
    });

    const wrapper = mount(WorkspaceOverview, {
      global: { stubs },
    });

    await flushPromises();

    expect(wrapper.text()).toContain('Need more?');
    expect(wrapper.text()).toContain('Enterprise plan');
  });

  it('should show top-tier message for Enterprise tier users', async () => {
    const tenant = makeTenant({ tier: { ...makeTenant().tier, name: 'Enterprise', rank: 3 } });
    mockFetchCurrentWorkspace.mockImplementation(async () => {
      workspaceRef.value = tenant;
      return tenant;
    });

    const wrapper = mount(WorkspaceOverview, {
      global: { stubs },
    });

    await flushPromises();

    expect(wrapper.text()).toContain("You're on our top-tier plan");
  });
});
