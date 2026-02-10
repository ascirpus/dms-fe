import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { ref } from 'vue';
import InviteDialog from '../InviteDialog.vue';
import type { TenantInvite } from '@/types';

const mockCreateInvite = vi.fn();
const mockFetchParties = vi.fn();
const mockPartiesList = ref<any[]>([]);
const mockProjects = ref<any[]>([]);

vi.mock('@/composables/useInvites', () => ({
  useInvites: () => ({
    createInvite: mockCreateInvite,
  }),
}));

vi.mock('@/composables/useProjects', () => ({
  useProjects: () => ({
    projects: mockProjects,
  }),
}));

vi.mock('@/composables/useParties', () => ({
  useParties: () => ({
    fetchParties: mockFetchParties,
    parties: mockPartiesList,
  }),
}));

vi.mock('primevue/usetoast', () => ({
  useToast: () => ({
    add: vi.fn(),
  }),
}));

const globalStubs = {
  Dialog: {
    template: '<div v-if="visible" class="dialog-stub"><slot /><slot name="footer" /></div>',
    props: ['visible', 'modal', 'header'],
  },
  Button: {
    template: '<button @click="$emit(\'click\')" :disabled="disabled"><slot>{{ label }}</slot></button>',
    props: ['label', 'icon', 'loading', 'disabled', 'text', 'size', 'severity', 'outlined'],
  },
  InputText: {
    template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue', 'type', 'placeholder'],
  },
  Select: {
    template: '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)"><option v-for="opt in options" :value="opt[optionValue]">{{ opt[optionLabel] }}</option></select>',
    props: ['modelValue', 'options', 'optionLabel', 'optionValue', 'placeholder', 'loading', 'disabled'],
  },
  Tag: {
    template: '<span class="tag-stub">{{ value }}</span>',
    props: ['value', 'severity'],
  },
};

describe('InviteDialog.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPartiesList.value = [];
    mockProjects.value = [
      { project: { id: 'proj-1', name: 'Project One' }, document_count: 5 },
      { project: { id: 'proj-2', name: 'Project Two' }, document_count: 3 },
    ];
  });

  it('should render dialog when visible', () => {
    const wrapper = mount(InviteDialog, {
      props: { visible: true },
      global: { stubs: globalStubs },
    });

    expect(wrapper.find('.dialog-stub').exists()).toBe(true);
  });

  it('should not render dialog when not visible', () => {
    const wrapper = mount(InviteDialog, {
      props: { visible: false },
      global: { stubs: globalStubs },
    });

    expect(wrapper.find('.dialog-stub').exists()).toBe(false);
  });

  it('should reset form when dialog opens', async () => {
    const wrapper = mount(InviteDialog, {
      props: { visible: false },
      global: { stubs: globalStubs },
    });

    await wrapper.setProps({ visible: true });

    expect(wrapper.vm.form.email).toBe('');
    expect(wrapper.vm.form.role).toBe('MEMBER');
    expect(wrapper.vm.isSubmitting).toBe(false);
  });

  it('should pre-select project when context is provided', async () => {
    mockFetchParties.mockResolvedValue([]);

    const wrapper = mount(InviteDialog, {
      props: {
        visible: false,
        context: {
          projectId: 'proj-1',
          projectName: 'Project One',
          partyId: 'party-1',
          partyName: 'Reviewers',
        },
      },
      global: { stubs: globalStubs },
    });

    // Trigger the watch by changing visible to true
    await wrapper.setProps({ visible: true });
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.selectedProjectId).toBe('proj-1');
    expect(wrapper.vm.selectedPartyId).toBe('party-1');
    expect(wrapper.vm.showProjectAccess).toBe(true);
  });

  it('should call createInvite with email and role', async () => {
    const mockInvite: TenantInvite = {
      id: 'inv-1',
      email: 'test@example.com',
      invitedBy: { userId: 'u1', email: 'admin@test.com' },
      role: 'MEMBER',
      expiresAt: '2025-02-01',
      createdAt: '2025-01-01',
    };
    mockCreateInvite.mockResolvedValue(mockInvite);

    const wrapper = mount(InviteDialog, {
      props: { visible: true },
      global: { stubs: globalStubs },
    });

    wrapper.vm.form.email = 'test@example.com';
    wrapper.vm.form.role = 'MEMBER';

    await wrapper.vm.submit();
    await flushPromises();

    expect(mockCreateInvite).toHaveBeenCalledWith({
      email: 'test@example.com',
      role: 'MEMBER',
    });
  });

  it('should include project assignments when selected', async () => {
    mockPartiesList.value = [
      { party: { id: 'party-1', name: 'Reviewers', meta: {}, createdAt: '' }, members: [] },
    ];
    mockFetchParties.mockResolvedValue([]);

    const mockInvite: TenantInvite = {
      id: 'inv-1',
      email: 'test@example.com',
      invitedBy: { userId: 'u1', email: 'admin@test.com' },
      role: 'MEMBER',
      projectAssignments: [{ projectId: 'proj-1', partyId: 'party-1' }],
      expiresAt: '2025-02-01',
      createdAt: '2025-01-01',
    };
    mockCreateInvite.mockResolvedValue(mockInvite);

    const wrapper = mount(InviteDialog, {
      props: { visible: true },
      global: { stubs: globalStubs },
    });

    wrapper.vm.form.email = 'test@example.com';
    wrapper.vm.showProjectAccess = true;
    wrapper.vm.selectedProjectId = 'proj-1';
    wrapper.vm.selectedPartyId = 'party-1';

    await wrapper.vm.submit();
    await flushPromises();

    expect(mockCreateInvite).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'test@example.com',
        projectAssignments: expect.arrayContaining([
          expect.objectContaining({
            projectId: 'proj-1',
            partyId: 'party-1',
          }),
        ]),
      }),
    );
  });

  it('should emit created event on success', async () => {
    const mockInvite: TenantInvite = {
      id: 'inv-1',
      email: 'test@example.com',
      invitedBy: { userId: 'u1', email: 'admin@test.com' },
      role: 'MEMBER',
      expiresAt: '2025-02-01',
      createdAt: '2025-01-01',
    };
    mockCreateInvite.mockResolvedValue(mockInvite);

    const wrapper = mount(InviteDialog, {
      props: { visible: true },
      global: { stubs: globalStubs },
    });

    wrapper.vm.form.email = 'test@example.com';
    await wrapper.vm.submit();
    await flushPromises();

    expect(wrapper.emitted('created')).toBeTruthy();
    expect(wrapper.emitted('created')![0]).toEqual([mockInvite]);
    expect(wrapper.emitted('update:visible')![0]).toEqual([false]);
  });

  it('should not submit with empty email', async () => {
    const wrapper = mount(InviteDialog, {
      props: { visible: true },
      global: { stubs: globalStubs },
    });

    wrapper.vm.form.email = '';
    await wrapper.vm.submit();

    expect(mockCreateInvite).not.toHaveBeenCalled();
  });

  it('should compute project options from projects list', () => {
    const wrapper = mount(InviteDialog, {
      props: { visible: true },
      global: { stubs: globalStubs },
    });

    expect(wrapper.vm.projectOptions).toEqual([
      { label: 'Project One', value: 'proj-1' },
      { label: 'Project Two', value: 'proj-2' },
    ]);
  });

  it('should show project access section when projects exist', () => {
    const wrapper = mount(InviteDialog, {
      props: { visible: true },
      global: { stubs: globalStubs },
    });

    expect(wrapper.text()).toContain('Grant project access');
  });

  it('should not show project access section when no projects', () => {
    mockProjects.value = [];

    const wrapper = mount(InviteDialog, {
      props: { visible: true },
      global: { stubs: globalStubs },
    });

    expect(wrapper.text()).not.toContain('Grant project access');
  });
});
