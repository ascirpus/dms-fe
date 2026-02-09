import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { ref } from 'vue';
import Profile from '../Profile.vue';
import { useAuth } from '@/composables/useAuth';

vi.mock('@/composables/useAuth');

const globalStubs = {
  Button: {
    template: '<button @click="$emit(\'click\', $event)"><slot>{{ label }}</slot></button>',
    props: ['label', 'icon', 'size', 'text', 'severity'],
  },
  DataTable: { template: '<div><slot /></div>', props: ['value', 'first', 'rows', 'dataKey'] },
  Column: { template: '<div />', props: ['field', 'header', 'sortable'] },
  Paginator: { template: '<div />', props: ['first', 'rows', 'totalRecords', 'rowsPerPageOptions', 'template'] },
  Dialog: { template: '<div v-if="visible"><slot /><slot name="footer" /></div>', props: ['visible', 'header', 'modal'] },
  InputText: {
    template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue'],
  },
  FloatLabel: { template: '<div><slot /></div>', props: ['variant'] },
};

describe('Profile.vue', () => {
  let mockUpdateProfile: any;

  beforeEach(() => {
    mockUpdateProfile = vi.fn().mockResolvedValue(undefined);

    vi.mocked(useAuth).mockReturnValue({
      currentUser: ref({
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+123',
        themePreference: 'light',
      }),
      getCurrentUser: vi.fn(() => ({
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+123',
        themePreference: 'light',
      })),
      fetchCurrentUser: vi.fn().mockResolvedValue(null),
      updateProfile: mockUpdateProfile,
      decodedToken: ref(null),
    } as any);
  });

  function mountProfile() {
    return mount(Profile, { global: { stubs: globalStubs } });
  }

  describe('General Information', () => {
    it('should display user profile data', async () => {
      const wrapper = mountProfile();
      await flushPromises();

      expect(wrapper.text()).toContain('test@example.com');
      expect(wrapper.text()).toContain('John');
      expect(wrapper.text()).toContain('Doe');
    });

    it('should render the General Information heading', async () => {
      const wrapper = mountProfile();
      await flushPromises();

      const heading = wrapper.findAll('h2').find(h => h.text() === 'General Information');
      expect(heading).toBeDefined();
    });

    it('should render the Access heading', async () => {
      const wrapper = mountProfile();
      await flushPromises();

      const heading = wrapper.findAll('h2').find(h => h.text() === 'Access');
      expect(heading).toBeDefined();
    });
  });
});
