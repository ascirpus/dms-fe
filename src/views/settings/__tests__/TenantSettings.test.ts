import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { ref } from 'vue';
import TenantSettings from '../TenantSettings.vue';

// Mock composables
const mockCreateDocumentType = vi.fn();
const mockUpdateDocumentType = vi.fn();
const mockDeleteDocumentType = vi.fn();
const mockRefetch = vi.fn();

vi.mock('@/composables/useDocumentTypes', () => ({
  useDocumentTypes: vi.fn(() => ({
    documentTypes: ref([
      {
        id: 'dt-1',
        name: 'Invoice',
        requiresApproval: true,
        defaultApprovalThreshold: 2,
        requiresSignature: false,
        defaultPermissions: 1,
      },
      {
        id: 'dt-2',
        name: 'Contract',
        requiresApproval: false,
        defaultApprovalThreshold: 0,
        requiresSignature: true,
        defaultPermissions: 3,
      },
    ]),
    loading: ref(false),
    error: ref(null),
    refetch: mockRefetch,
    createDocumentType: mockCreateDocumentType,
    updateDocumentType: mockUpdateDocumentType,
    deleteDocumentType: mockDeleteDocumentType,
  })),
}));

// Mock PrimeVue
vi.mock('primevue/usetoast', () => ({
  useToast: () => ({ add: vi.fn() }),
}));

vi.mock('primevue/useconfirm', () => ({
  useConfirm: () => ({
    require: vi.fn((opts: any) => opts.accept?.()),
  }),
}));

// Stub PrimeVue components
const stubs = {
  Button: { template: '<button @click="$attrs.onClick?.($event)"><slot /></button>', inheritAttrs: true },
  DataTable: { template: '<div class="datatable"><slot /><slot name="empty" v-if="!value?.length" /></div>', props: ['value'] },
  Column: { template: '<div class="column"><slot name="body" v-bind="{ data: {} }" /></div>', props: ['field', 'header'] },
  Dialog: { template: '<div class="dialog" v-if="visible"><slot /><slot name="footer" /></div>', props: ['visible', 'header'] },
  InputText: { template: '<input />', props: ['modelValue'] },
  InputNumber: { template: '<input type="number" />', props: ['modelValue'] },
  ToggleSwitch: { template: '<input type="checkbox" />', props: ['modelValue'] },
  Select: { template: '<select />', props: ['modelValue', 'options'] },
  TabMenu: { template: '<div class="tabmenu"><slot /></div>', props: ['activeIndex', 'model'] },
  ProgressSpinner: { template: '<div class="spinner" />' },
};

describe('TenantSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the page with tab menu', () => {
    const wrapper = mount(TenantSettings, {
      global: { stubs },
    });

    expect(wrapper.find('.tenant-settings-page').exists()).toBe(true);
    expect(wrapper.find('.tabmenu').exists()).toBe(true);
  });

  it('should display document types in a table', () => {
    const wrapper = mount(TenantSettings, {
      global: { stubs },
    });

    expect(wrapper.find('.datatable').exists()).toBe(true);
  });

  it('should show toolbar with add button', () => {
    const wrapper = mount(TenantSettings, {
      global: { stubs },
    });

    expect(wrapper.find('.table-toolbar').exists()).toBe(true);
    const buttons = wrapper.findAll('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should render the toolbar', () => {
    const wrapper = mount(TenantSettings, {
      global: { stubs },
    });

    expect(wrapper.find('.table-toolbar').exists()).toBe(true);
    expect(wrapper.find('.toolbar-right').exists()).toBe(true);
  });
});
