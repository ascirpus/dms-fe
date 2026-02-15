import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { computed } from 'vue';
import { i18n } from '@/plugins/i18n';
import WorkspaceStorage from '../WorkspaceStorage.vue';
import { useTenantFeatures } from '@/composables/useTenantFeatures';

vi.mock('@/composables/useTenantFeatures');

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

const globalConfig = {
  plugins: [i18n],
};

describe('WorkspaceStorage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show "Coming Soon" tag when selfStorageEnabled is false', () => {
    mockFeatures(false);

    const wrapper = mount(WorkspaceStorage, {
      global: globalConfig,
    });

    const tag = wrapper.findComponent({ name: 'Tag' });
    expect(tag.exists()).toBe(true);
    expect(tag.props('value')).toBe('Coming Soon');
    expect(tag.props('severity')).toBe('info');
  });

  it('should show "Available" tag when selfStorageEnabled is true', () => {
    mockFeatures(true);

    const wrapper = mount(WorkspaceStorage, {
      global: globalConfig,
    });

    const tag = wrapper.findComponent({ name: 'Tag' });
    expect(tag.exists()).toBe(true);
    expect(tag.props('value')).toBe('Available');
    expect(tag.props('severity')).toBe('success');
  });

  it('should render the storage title and description', () => {
    mockFeatures(false);

    const wrapper = mount(WorkspaceStorage, {
      global: globalConfig,
    });

    expect(wrapper.text()).toContain('Self-Hosted Storage');
    expect(wrapper.text()).toContain('Connect your own storage backend');
  });

  it('should render the server icon', () => {
    mockFeatures(false);

    const wrapper = mount(WorkspaceStorage, {
      global: globalConfig,
    });

    expect(wrapper.find('.pi-server').exists()).toBe(true);
  });
});
