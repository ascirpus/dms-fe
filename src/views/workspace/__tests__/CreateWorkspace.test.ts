import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { ref } from 'vue';
import CreateWorkspace from '../CreateWorkspace.vue';

const mockCreateWorkspace = vi.fn();
const mockToastAdd = vi.fn();

vi.mock('@/composables/useWorkspace', () => ({
  useWorkspace: vi.fn(() => ({
    createWorkspace: mockCreateWorkspace,
  })),
}));

vi.mock('primevue/usetoast', () => ({
  useToast: () => ({ add: mockToastAdd }),
}));

vi.mock('vue-query', () => ({
  useQueryClient: () => ({
    fetchQuery: vi.fn(),
    invalidateQueries: vi.fn(),
    clear: vi.fn(),
  }),
}));

const stubs = {
  Button: {
    template: '<button :type="$attrs.type || \'button\'" :disabled="$attrs.disabled" @click="$attrs.onClick?.($event)"><slot /></button>',
    inheritAttrs: true,
  },
  InputText: {
    template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue'],
    emits: ['update:modelValue'],
  },
  FloatLabel: { template: '<div><slot /></div>' },
};

describe('CreateWorkspace', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the form with heading and input', () => {
    const wrapper = mount(CreateWorkspace, {
      global: { stubs },
    });

    expect(wrapper.text()).toContain('Create Workspace');
    expect(wrapper.text()).toContain('Set up a new workspace for your team');
    expect(wrapper.find('input').exists()).toBe(true);
  });

  it('should disable submit button when name is empty', () => {
    const wrapper = mount(CreateWorkspace, {
      global: { stubs },
    });

    const button = wrapper.find('button[type="submit"]');
    expect(button.attributes('disabled')).toBeDefined();
  });

  it('should enable submit button when name is entered', async () => {
    const wrapper = mount(CreateWorkspace, {
      global: { stubs },
    });

    await wrapper.find('input').setValue('My Workspace');

    const button = wrapper.find('button[type="submit"]');
    expect(button.attributes('disabled')).toBeUndefined();
  });

  it('should call createWorkspace with entered name on submit', async () => {
    mockCreateWorkspace.mockResolvedValue(undefined);

    const wrapper = mount(CreateWorkspace, {
      global: { stubs },
    });

    await wrapper.find('input').setValue('My Workspace');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(mockCreateWorkspace).toHaveBeenCalledWith('My Workspace');
  });

  it('should show error toast on failure', async () => {
    mockCreateWorkspace.mockRejectedValue(new Error('fail'));

    const wrapper = mount(CreateWorkspace, {
      global: { stubs },
    });

    await wrapper.find('input').setValue('My Workspace');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(mockToastAdd).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error', detail: 'Could not create workspace. Please try again.' })
    );
  });

  it('should trim whitespace from workspace name', async () => {
    mockCreateWorkspace.mockResolvedValue(undefined);

    const wrapper = mount(CreateWorkspace, {
      global: { stubs },
    });

    await wrapper.find('input').setValue('  My Workspace  ');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(mockCreateWorkspace).toHaveBeenCalledWith('My Workspace');
  });
});
