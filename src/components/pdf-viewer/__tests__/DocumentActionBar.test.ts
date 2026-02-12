import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import DocumentActionBar from '../DocumentActionBar.vue';
import { DocumentStatus, type Document, type SignatureStatus } from '@/types/Document';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en: {} },
  missingWarn: false,
  fallbackWarn: false,
});

const globalStubs = {
  Button: {
    template: '<button @click="$emit(\'click\')" :disabled="disabled"><slot>{{ label }}</slot></button>',
    props: ['label', 'icon', 'loading', 'disabled', 'severity', 'outlined', 'size'],
  },
};

const globalConfig = { stubs: globalStubs, plugins: [i18n] };

function createDocument(overrides: Partial<Document> = {}): Document {
  return {
    id: 'doc-1',
    title: 'Test Doc',
    documentType: {
      id: 'type-1',
      name: 'Contract',
      requiresApproval: true,
      defaultApprovalThreshold: 3,
      requiresSignature: false,
      defaultPermissions: 1,
      meta: {},
    },
    status: DocumentStatus.PENDING,
    versions: [],
    approvals: [],
    requiredApprovals: 3,
    effectivePermission: 'DECIDE' as const,
    ...overrides,
  };
}

describe('DocumentActionBar.vue', () => {
  it('should show approval row when document type requires approval', () => {
    const wrapper = mount(DocumentActionBar, {
      props: { document: createDocument(), signatureStatus: null, loading: false },
      global: globalConfig,
    });

    expect(wrapper.text()).toContain('documentViewer.approvalsProgress');
  });

  it('should show approve and decline buttons when PENDING', () => {
    const wrapper = mount(DocumentActionBar, {
      props: { document: createDocument(), signatureStatus: null, loading: false },
      global: globalConfig,
    });

    const buttons = wrapper.findAll('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it('should emit approve event when approve button clicked', async () => {
    const wrapper = mount(DocumentActionBar, {
      props: { document: createDocument(), signatureStatus: null, loading: false },
      global: globalConfig,
    });

    const buttons = wrapper.findAll('button');
    await buttons[0].trigger('click');

    expect(wrapper.emitted('approve')).toBeTruthy();
  });

  it('should emit decline event when decline button clicked', async () => {
    const wrapper = mount(DocumentActionBar, {
      props: { document: createDocument(), signatureStatus: null, loading: false },
      global: globalConfig,
    });

    const buttons = wrapper.findAll('button');
    await buttons[1].trigger('click');

    expect(wrapper.emitted('decline')).toBeTruthy();
  });

  it('should show approved badge when status is APPROVED', () => {
    const wrapper = mount(DocumentActionBar, {
      props: {
        document: createDocument({ status: DocumentStatus.APPROVED }),
        signatureStatus: null,
        loading: false,
      },
      global: globalConfig,
    });

    expect(wrapper.find('.pi-check-circle').exists()).toBe(true);
    // No approve/decline buttons when approved
    expect(wrapper.findAll('button')).toHaveLength(0);
  });

  it('should show declined badge when status is DECLINED', () => {
    const wrapper = mount(DocumentActionBar, {
      props: {
        document: createDocument({ status: DocumentStatus.DECLINED }),
        signatureStatus: null,
        loading: false,
      },
      global: globalConfig,
    });

    expect(wrapper.find('.pi-times-circle').exists()).toBe(true);
  });

  it('should not render when no approval workflow and no signatures', () => {
    const doc = createDocument({
      documentType: {
        id: 'type-1',
        name: 'Basic',
        requiresApproval: false,
        defaultApprovalThreshold: 0,
        requiresSignature: false,
        defaultPermissions: 1,
        meta: {},
      },
    });

    const wrapper = mount(DocumentActionBar, {
      props: { document: doc, signatureStatus: null, loading: false },
      global: globalConfig,
    });

    expect(wrapper.html()).toBe('<!--v-if-->');
  });

  it('should show signature row when document is approved and requires signature', () => {
    const sigStatus: SignatureStatus = {
      signatures: [],
      signedCount: 0,
    };

    const doc = createDocument({
      status: DocumentStatus.APPROVED,
      requiresSignature: true,
      documentType: {
        id: 'type-1',
        name: 'Basic',
        requiresApproval: false,
        defaultApprovalThreshold: 0,
        requiresSignature: true,
        defaultPermissions: 1,
        meta: {},
      },
    });

    const wrapper = mount(DocumentActionBar, {
      props: { document: doc, signatureStatus: sigStatus, loading: false },
      global: globalConfig,
    });

    // Should render signature row with sign button
    expect(wrapper.findAll('button').length).toBeGreaterThanOrEqual(1);
  });

  it('should show signature row when signatures exist', () => {
    const sigStatus: SignatureStatus = {
      signatures: [
        { user: { id: 'u-1', email: 'a@b.com' }, signedAt: '2024-01-15T10:00:00', contentHash: 'abc123' },
      ],
      signedCount: 1,
    };

    const doc = createDocument({
      status: DocumentStatus.APPROVED,
      requiresSignature: true,
    });

    const wrapper = mount(DocumentActionBar, {
      props: { document: doc, signatureStatus: sigStatus, loading: false },
      global: globalConfig,
    });

    expect(wrapper.findAll('button').length).toBeGreaterThanOrEqual(1);
  });

  it('should not show approve/decline buttons when effectivePermission is VIEW', () => {
    const wrapper = mount(DocumentActionBar, {
      props: {
        document: createDocument({ effectivePermission: 'VIEW' }),
        signatureStatus: null,
        loading: false,
      },
      global: globalConfig,
    });

    // Approval row shown but no buttons
    expect(wrapper.text()).toContain('documentViewer.approvalsProgress');
    expect(wrapper.findAll('button')).toHaveLength(0);
  });

  it('should show approve/decline buttons when effectivePermission is DECIDE', () => {
    const wrapper = mount(DocumentActionBar, {
      props: {
        document: createDocument({ effectivePermission: 'DECIDE' }),
        signatureStatus: null,
        loading: false,
      },
      global: globalConfig,
    });

    expect(wrapper.findAll('button').length).toBeGreaterThanOrEqual(2);
  });

  it('should not show sign button when effectivePermission is VIEW', () => {
    const sigStatus: SignatureStatus = {
      signatures: [],
      signedCount: 0,
    };

    const doc = createDocument({
      status: DocumentStatus.APPROVED,
      requiresSignature: true,
      effectivePermission: 'VIEW',
      documentType: {
        id: 'type-1',
        name: 'Basic',
        requiresApproval: false,
        defaultApprovalThreshold: 0,
        requiresSignature: true,
        defaultPermissions: 1,
        meta: {},
      },
    });

    const wrapper = mount(DocumentActionBar, {
      props: { document: doc, signatureStatus: sigStatus, loading: false },
      global: globalConfig,
    });

    // canSign is true but canDecide is false, so no sign button
    expect(wrapper.findAll('button')).toHaveLength(0);
  });

  it('should emit sign event when sign button clicked', async () => {
    const sigStatus: SignatureStatus = {
      signatures: [],
      signedCount: 0,
    };

    const doc = createDocument({
      status: DocumentStatus.APPROVED,
      requiresSignature: true,
      documentType: {
        id: 'type-1',
        name: 'Basic',
        requiresApproval: false,
        defaultApprovalThreshold: 0,
        requiresSignature: true,
        defaultPermissions: 1,
        meta: {},
      },
    });

    const wrapper = mount(DocumentActionBar, {
      props: { document: doc, signatureStatus: sigStatus, loading: false },
      global: globalConfig,
    });

    const signBtn = wrapper.findAll('button')[0];
    await signBtn.trigger('click');

    expect(wrapper.emitted('sign')).toBeTruthy();
  });
});
