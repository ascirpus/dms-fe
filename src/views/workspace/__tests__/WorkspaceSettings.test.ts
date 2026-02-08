import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref, computed } from 'vue';
import WorkspaceSettings from '../WorkspaceSettings.vue';

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

vi.mock('@/composables/useWorkspace', () => ({
  useWorkspace: vi.fn(() => ({
    currentWorkspaceName: computed(() => 'Acme Corp'),
  })),
}));

vi.mock('primevue/usetoast', () => ({
  useToast: () => ({ add: vi.fn() }),
}));

vi.mock('primevue/useconfirm', () => ({
  useConfirm: () => ({
    require: vi.fn((opts: any) => opts.accept?.()),
  }),
}));

const stubs = {
  Button: { template: '<button @click="$attrs.onClick?.($event)"><slot /></button>', inheritAttrs: true },
  DataTable: { template: '<div class="datatable"><slot /><slot name="empty" v-if="!value?.length" /></div>', props: ['value'] },
  Column: { template: '<div class="column"><slot name="body" v-bind="{ data: {} }" /></div>', props: ['field', 'header'] },
  Dialog: { template: '<div class="dialog" v-if="visible"><slot /><slot name="footer" /></div>', props: ['visible', 'header'] },
  InputText: { template: '<input />', props: ['modelValue'] },
  InputNumber: { template: '<input type="number" />', props: ['modelValue'] },
  ToggleSwitch: { template: '<input type="checkbox" />', props: ['modelValue'] },
  Select: { template: '<select />', props: ['modelValue', 'options'] },
  Popover: { template: '<div class="popover"><slot /></div>' },
  ProgressSpinner: { template: '<div class="spinner" />' },
  IconPicker: { template: '<div class="icon-picker" />', props: ['modelValue'] },
};

describe('WorkspaceSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the page with workspace name in heading', () => {
    const wrapper = mount(WorkspaceSettings, {
      global: { stubs },
    });

    expect(wrapper.find('.workspace-settings').exists()).toBe(true);
    expect(wrapper.find('.page-title').text()).toBe('Acme Corp Settings');
  });

  it('should display document types section header with add button', () => {
    const wrapper = mount(WorkspaceSettings, {
      global: { stubs },
    });

    expect(wrapper.find('.section-header').exists()).toBe(true);
    expect(wrapper.find('.section-title').text()).toBe('Document Types');
    const buttons = wrapper.findAll('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should display document types in a table', () => {
    const wrapper = mount(WorkspaceSettings, {
      global: { stubs },
    });

    expect(wrapper.find('.datatable').exists()).toBe(true);
  });

  it('should not render TabMenu (tabs removed)', () => {
    const wrapper = mount(WorkspaceSettings, {
      global: { stubs },
    });

    expect(wrapper.find('.tabmenu').exists()).toBe(false);
  });

  it('should render table container with rounded style', () => {
    const wrapper = mount(WorkspaceSettings, {
      global: { stubs },
    });

    expect(wrapper.find('.table-container').exists()).toBe(true);
  });
});
