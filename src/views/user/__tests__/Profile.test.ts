import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { ref } from 'vue';
import Profile from '../Profile.vue';
import { useAuth } from '@/composables/useAuth';
import { useUserPermissions } from '@/composables/useUserPermissions';

vi.mock('@/composables/useAuth');
vi.mock('@/composables/useUserPermissions');

const globalStubs = {
  Button: {
    template: '<button @click="$emit(\'click\', $event)"><slot>{{ label }}</slot></button>',
    props: ['label', 'icon', 'size', 'text', 'severity'],
  },
  DataTable: {
    template: '<table><slot /></table>',
    props: ['value', 'first', 'rows', 'dataKey'],
  },
  Column: {
    template: '<td />',
    props: ['field', 'header', 'sortable'],
  },
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
  let mockFetchOverrides: any;
  let mockOverrides: any;
  let mockLoading: any;

  beforeEach(() => {
    mockUpdateProfile = vi.fn().mockResolvedValue(undefined);
    mockOverrides = ref([]);
    mockLoading = ref(false);
    mockFetchOverrides = vi.fn().mockResolvedValue([]);

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

    vi.mocked(useUserPermissions).mockReturnValue({
      overrides: mockOverrides,
      loading: mockLoading,
      error: ref(null),
      fetchOverrides: mockFetchOverrides,
    });
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

  });

  describe('Access section', () => {
    it('should call fetchOverrides on mount', async () => {
      mountProfile();
      await flushPromises();

      expect(mockFetchOverrides).toHaveBeenCalled();
    });

    it('should hide Access section when no overrides', async () => {
      mockOverrides.value = [];
      const wrapper = mountProfile();
      await flushPromises();

      const heading = wrapper.findAll('h2').find(h => h.text() === 'Access');
      expect(heading).toBeUndefined();
      expect(wrapper.find('.access-table-container').exists()).toBe(false);
    });

    it('should show Access section when overrides exist', async () => {
      mockOverrides.value = [
        {
          userId: 'user-1',
          userEmail: 'test@example.com',
          documentId: 'doc-1',
          documentTitle: 'Requirements.pdf',
          projectName: 'Project Alpha',
          permission: 'VIEW',
        },
      ];

      const wrapper = mountProfile();
      await flushPromises();

      const heading = wrapper.findAll('h2').find(h => h.text() === 'Access');
      expect(heading).toBeDefined();
      expect(wrapper.find('.access-table-container').exists()).toBe(true);
    });
  });
});
