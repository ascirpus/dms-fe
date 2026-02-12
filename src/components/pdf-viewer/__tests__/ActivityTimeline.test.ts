import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import ActivityTimeline from '../ActivityTimeline.vue';
import type { DocumentApproval, SignatureStatus } from '@/types/Document';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: { en: {} },
  missingWarn: false,
  fallbackWarn: false,
});

const globalConfig = { plugins: [i18n] };

describe('ActivityTimeline.vue', () => {
  it('should show empty state when no activity', () => {
    const wrapper = mount(ActivityTimeline, {
      props: { approvals: [], signatureStatus: null, loading: false },
      global: globalConfig,
    });

    expect(wrapper.find('.pi-clock').exists()).toBe(true);
  });

  it('should show loading spinner when loading', () => {
    const wrapper = mount(ActivityTimeline, {
      props: { approvals: [], signatureStatus: null, loading: true },
      global: globalConfig,
    });

    expect(wrapper.find('.pi-spinner').exists()).toBe(true);
  });

  it('should render approval entries', () => {
    const approvals: DocumentApproval[] = [
      {
        id: 'a-1',
        user: { id: 'u-1', email: 'john@test.com', firstName: 'John', lastName: 'Doe' },
        action: 'APPROVE',
        comment: null,
        createdAt: new Date().toISOString(),
      },
    ];

    const wrapper = mount(ActivityTimeline, {
      props: { approvals, signatureStatus: null, loading: false },
      global: globalConfig,
    });

    expect(wrapper.text()).toContain('John Doe');
    expect(wrapper.text()).toContain('JD');
  });

  it('should render decline entries with comment', () => {
    const approvals: DocumentApproval[] = [
      {
        id: 'a-2',
        user: { id: 'u-2', email: 'jane@test.com', firstName: 'Jane', lastName: 'Smith' },
        action: 'DECLINE',
        comment: 'Quality issues found',
        createdAt: new Date().toISOString(),
      },
    ];

    const wrapper = mount(ActivityTimeline, {
      props: { approvals, signatureStatus: null, loading: false },
      global: globalConfig,
    });

    expect(wrapper.text()).toContain('Jane Smith');
    expect(wrapper.text()).toContain('Quality issues found');
  });

  it('should render signed entries from signature status', () => {
    const sigStatus: SignatureStatus = {
      signatures: [
        {
          user: { id: 'u-3', email: 'signer@test.com', firstName: 'Bob', lastName: 'Jones' },
          signedAt: new Date().toISOString(),
          contentHash: 'abc123',
        },
      ],
      signedCount: 1,
    };

    const wrapper = mount(ActivityTimeline, {
      props: { approvals: [], signatureStatus: sigStatus, loading: false },
      global: globalConfig,
    });

    expect(wrapper.text()).toContain('Bob Jones');
    expect(wrapper.text()).toContain('BJ');
  });

  it('should sort timeline entries newest first', () => {
    const approvals: DocumentApproval[] = [
      {
        id: 'a-1',
        user: { id: 'u-1', email: 'first@test.com', firstName: 'First', lastName: 'User' },
        action: 'APPROVE',
        comment: null,
        createdAt: '2024-01-01T10:00:00',
      },
      {
        id: 'a-2',
        user: { id: 'u-2', email: 'second@test.com', firstName: 'Second', lastName: 'User' },
        action: 'APPROVE',
        comment: null,
        createdAt: '2024-01-02T10:00:00',
      },
    ];

    const wrapper = mount(ActivityTimeline, {
      props: { approvals, signatureStatus: null, loading: false },
      global: globalConfig,
    });

    const text = wrapper.text();
    const firstIdx = text.indexOf('Second User');
    const secondIdx = text.indexOf('First User');
    expect(firstIdx).toBeLessThan(secondIdx);
  });
});
