import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { ref, nextTick } from 'vue';
import ProjectSettings from '../ProjectSettings.vue';

vi.mock('vue-router', () => ({
  useRoute: vi.fn(() => ({
    params: { id: '550e8400-e29b-41d4-a716-446655440000' },
  })),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
  })),
}));

vi.mock('primevue/usetoast', () => ({
  useToast: vi.fn(() => ({
    add: vi.fn(),
  })),
}));

vi.mock('primevue/useconfirm', () => ({
  useConfirm: vi.fn(() => ({
    require: vi.fn(),
  })),
}));

const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  delete: vi.fn(),
  put: vi.fn(),
};

vi.mock('@/composables/useAuth', () => ({
  useAuth: vi.fn(() => ({
    apiClient: mockApiClient,
    getCurrentUser: () => ({ sub: 'user-1' }),
  })),
}));

vi.mock('@/composables/useProjects', () => ({
  useProjects: vi.fn(() => ({
    useResolvedProjectId: vi.fn(() => ref('550e8400-e29b-41d4-a716-446655440000')),
    fetchProjectById: vi.fn().mockResolvedValue({
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Test Project',
      description: 'Test Description',
    }),
    loading: ref(false),
  })),
}));

vi.mock('@/composables/useDocumentTypes', () => ({
  useDocumentTypes: vi.fn(() => ({
    documentTypes: ref([
      { id: 'dt-1', name: 'Contract', requiresApproval: false, defaultApprovalThreshold: 0, requiresSignature: false, defaultPermissions: 1 },
      { id: 'dt-2', name: 'Invoice', requiresApproval: true, defaultApprovalThreshold: 1, requiresSignature: false, defaultPermissions: 1 },
    ]),
  })),
}));

vi.mock('@/services/UsersService', () => {
  const UsersService = vi.fn();
  UsersService.prototype.fetchTenantUsers = vi.fn().mockResolvedValue([
    { userId: 'user-1', email: 'admin@test.com', firstName: 'Admin', lastName: 'User' },
    { userId: 'user-2', email: 'member@test.com', firstName: 'Team', lastName: 'Member' },
  ]);
  return { UsersService };
});

const globalStubs = {
  Button: {
    template: '<button @click="$emit(\'click\')"><slot>{{ label }}</slot></button>',
    props: ['label', 'icon', 'severity', 'text', 'rounded', 'size', 'disabled', 'loading', 'outlined'],
  },
  InputText: {
    template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue', 'id', 'placeholder'],
  },
  Textarea: {
    template: '<textarea :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />',
    props: ['modelValue', 'id', 'rows', 'placeholder'],
  },
  DataTable: {
    template: '<div class="datatable-stub"><slot name="empty" /></div>',
    props: ['value', 'filters', 'globalFilterFields', 'paginator', 'rows', 'first', 'rowsPerPageOptions', 'dataKey', 'loading', 'stripedRows'],
  },
  Column: { template: '<div />', props: ['field', 'header', 'sortable', 'style', 'alignFrozen'] },
  Dialog: {
    template: '<div v-if="visible" class="dialog-stub"><slot /><slot name="footer" /></div>',
    props: ['visible', 'header', 'modal', 'style'],
  },
  Select: {
    template: '<select><option v-for="o in options" :key="o">{{ o }}</option></select>',
    props: ['modelValue', 'options', 'optionLabel', 'optionValue', 'placeholder', 'showClear', 'filter'],
  },
  ProgressSpinner: { template: '<div class="spinner-stub" />' },
  TabMenu: {
    template: '<div class="tabmenu-stub" />',
    props: ['activeIndex', 'model'],
  },
  IconField: { template: '<div><slot /></div>' },
  InputIcon: { template: '<span />' },
  Paginator: { template: '<div />', props: ['first', 'rows', 'totalRecords'] },
};

function createPartyWithMembers(overrides = {}) {
  return {
    party: {
      id: 'party-1',
      name: 'Legal Team',
      description: 'Legal department',
      meta: {
        vatNumber: 'VAT123',
        contactEmail: 'legal@test.com',
        contactPhone: '+1234567890',
        address: '123 Main St',
      },
      createdAt: '2024-01-01T00:00:00Z',
    },
    members: [
      { id: 'user-1', email: 'admin@test.com', firstName: 'Admin', lastName: 'User' },
    ],
    ...overrides,
  };
}

function setupApiMocks(partiesData = [createPartyWithMembers()], permissionsData: any[] = []) {
  mockApiClient.get.mockImplementation((url: string) => {
    if (url.includes('/party/permissions')) {
      return Promise.resolve({ data: { data: permissionsData } });
    }
    if (url.includes('/party')) {
      return Promise.resolve({
        data: {
          data: {
            projectId: '550e8400-e29b-41d4-a716-446655440000',
            parties: partiesData,
          },
        },
      });
    }
    return Promise.reject(new Error(`Unexpected GET: ${url}`));
  });
  mockApiClient.post.mockResolvedValue({ data: { data: { id: 'new-party-id' } } });
  mockApiClient.delete.mockResolvedValue({ data: { status: 'ok' } });
}

async function mountAndLoad(partiesData?: any[], permissionsData?: any[]) {
  setupApiMocks(partiesData, permissionsData);
  const wrapper = mount(ProjectSettings, {
    global: { stubs: globalStubs },
  });
  await flushPromises();
  return wrapper;
}

describe('ProjectSettings.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Party Types and Metadata', () => {
    it('should load parties with metadata', async () => {
      const wrapper = await mountAndLoad();
      expect(wrapper.vm.parties).toHaveLength(1);
      expect(wrapper.vm.parties[0].party.meta.vatNumber).toBe('VAT123');
      expect(wrapper.vm.parties[0].party.meta.contactEmail).toBe('legal@test.com');
    });

    it('should detect party metadata with hasPartyMeta', async () => {
      const wrapper = await mountAndLoad();
      expect(wrapper.vm.hasPartyMeta({ vatNumber: 'VAT123' })).toBe(true);
      expect(wrapper.vm.hasPartyMeta({})).toBe(false);
      expect(wrapper.vm.hasPartyMeta(undefined)).toBe(false);
    });

    it('should handle parties with empty metadata', async () => {
      const partyNoMeta = createPartyWithMembers({
        party: {
          id: 'party-2',
          name: 'Empty Meta',
          meta: {},
          createdAt: '2024-01-01T00:00:00Z',
        },
      });
      const wrapper = await mountAndLoad([partyNoMeta]);
      expect(wrapper.vm.hasPartyMeta(wrapper.vm.parties[0].party.meta)).toBe(false);
    });
  });

  describe('Create Party with Metadata', () => {
    it('should include metadata in party creation', async () => {
      const wrapper = await mountAndLoad();

      wrapper.vm.addPartyForm.name = 'New Party';
      wrapper.vm.addPartyForm.description = 'New description';
      wrapper.vm.addPartyForm.vatNumber = 'NEW-VAT';
      wrapper.vm.addPartyForm.contactEmail = 'new@test.com';
      wrapper.vm.addPartyForm.contactPhone = '+999';
      wrapper.vm.addPartyForm.address = '456 New St';

      await wrapper.vm.addParty();
      await flushPromises();

      expect(mockApiClient.post).toHaveBeenCalledWith(
        expect.stringContaining('/party'),
        expect.objectContaining({
          name: 'New Party',
          description: 'New description',
          meta: {
            vatNumber: 'NEW-VAT',
            contactEmail: 'new@test.com',
            contactPhone: '+999',
            address: '456 New St',
          },
        })
      );
    });

    it('should not include meta if all metadata fields are empty', async () => {
      const wrapper = await mountAndLoad();

      wrapper.vm.addPartyForm.name = 'Plain Party';
      wrapper.vm.addPartyForm.description = '';

      await wrapper.vm.addParty();
      await flushPromises();

      const callArgs = mockApiClient.post.mock.calls[0][1];
      expect(callArgs.meta).toBeUndefined();
    });

    it('should optimistically add party with metadata', async () => {
      const wrapper = await mountAndLoad();
      const initialCount = wrapper.vm.parties.length;

      wrapper.vm.addPartyForm.name = 'Optimistic Party';
      wrapper.vm.addPartyForm.vatNumber = 'OPT-VAT';

      await wrapper.vm.addParty();

      expect(wrapper.vm.parties.length).toBe(initialCount + 1);
      const newParty = wrapper.vm.parties[wrapper.vm.parties.length - 1];
      expect(newParty.party.name).toBe('Optimistic Party');
      expect(newParty.party.meta.vatNumber).toBe('OPT-VAT');
    });

    it('should reset all form fields after creation', async () => {
      const wrapper = await mountAndLoad();

      wrapper.vm.addPartyForm.name = 'Test';
      wrapper.vm.addPartyForm.vatNumber = 'VAT';
      wrapper.vm.addPartyForm.contactEmail = 'test@test.com';

      await wrapper.vm.addParty();

      expect(wrapper.vm.addPartyForm.name).toBe('');
      expect(wrapper.vm.addPartyForm.vatNumber).toBe('');
      expect(wrapper.vm.addPartyForm.contactEmail).toBe('');
      expect(wrapper.vm.addPartyForm.contactPhone).toBe('');
      expect(wrapper.vm.addPartyForm.address).toBe('');
    });

    it('should roll back optimistic party on API error', async () => {
      const wrapper = await mountAndLoad();
      const initialCount = wrapper.vm.parties.length;

      mockApiClient.post.mockRejectedValueOnce(new Error('Server error'));

      wrapper.vm.addPartyForm.name = 'Will Fail';
      await wrapper.vm.addParty();
      await flushPromises();

      expect(wrapper.vm.parties.length).toBe(initialCount);
    });
  });

  describe('Edit Party Dialog', () => {
    it('should populate form when opening edit dialog', async () => {
      const wrapper = await mountAndLoad();
      const party = wrapper.vm.parties[0];

      wrapper.vm.openEditPartyDialog(party);

      expect(wrapper.vm.editPartyForm.name).toBe('Legal Team');
      expect(wrapper.vm.editPartyForm.description).toBe('Legal department');
      expect(wrapper.vm.editPartyForm.vatNumber).toBe('VAT123');
      expect(wrapper.vm.editPartyForm.contactEmail).toBe('legal@test.com');
      expect(wrapper.vm.editPartyForm.contactPhone).toBe('+1234567890');
      expect(wrapper.vm.editPartyForm.address).toBe('123 Main St');
      expect(wrapper.vm.showEditPartyDialog).toBe(true);
    });

    it('should handle party with no meta in edit dialog', async () => {
      const partyNoMeta = createPartyWithMembers({
        party: {
          id: 'party-nometa',
          name: 'No Meta',
          meta: {},
          createdAt: '2024-01-01T00:00:00Z',
        },
      });
      const wrapper = await mountAndLoad([partyNoMeta]);

      wrapper.vm.openEditPartyDialog(wrapper.vm.parties[0]);

      expect(wrapper.vm.editPartyForm.vatNumber).toBe('');
      expect(wrapper.vm.editPartyForm.contactEmail).toBe('');
    });

    it('should update party locally on save', async () => {
      const wrapper = await mountAndLoad();
      const party = wrapper.vm.parties[0];

      wrapper.vm.openEditPartyDialog(party);
      wrapper.vm.editPartyForm.name = 'Updated Name';
      wrapper.vm.editPartyForm.vatNumber = 'NEW-VAT';

      await wrapper.vm.saveEditParty();
      await flushPromises();

      expect(wrapper.vm.parties[0].party.name).toBe('Updated Name');
      expect(wrapper.vm.parties[0].party.meta.vatNumber).toBe('NEW-VAT');
      expect(wrapper.vm.showEditPartyDialog).toBe(false);
    });

    it('should close dialog after saving', async () => {
      const wrapper = await mountAndLoad();

      wrapper.vm.openEditPartyDialog(wrapper.vm.parties[0]);
      expect(wrapper.vm.showEditPartyDialog).toBe(true);

      await wrapper.vm.saveEditParty();
      await flushPromises();

      expect(wrapper.vm.showEditPartyDialog).toBe(false);
      expect(wrapper.vm.editingParty).toBeNull();
    });
  });

  describe('Party Permissions', () => {
    it('should fetch party permissions on load', async () => {
      const permissions = [
        { partyId: 'party-1', permissions: { 'dt-1': 'VIEW', 'dt-2': 'COMMENT' } },
      ];
      const wrapper = await mountAndLoad(undefined, permissions);

      expect(wrapper.vm.partyPermissions.get('party-1')).toEqual({
        'dt-1': 'VIEW',
        'dt-2': 'COMMENT',
      });
    });

    it('should return correct permission count', async () => {
      const permissions = [
        { partyId: 'party-1', permissions: { 'dt-1': 'VIEW', 'dt-2': 'COMMENT' } },
      ];
      const wrapper = await mountAndLoad(undefined, permissions);

      expect(wrapper.vm.getPermissionCount('party-1')).toBe(2);
      expect(wrapper.vm.getPermissionCount('nonexistent')).toBe(0);
    });

    it('should populate permission dropdowns in edit dialog', async () => {
      const permissions = [
        { partyId: 'party-1', permissions: { 'dt-1': 'VIEW' } },
      ];
      const wrapper = await mountAndLoad(undefined, permissions);

      wrapper.vm.openEditPartyDialog(wrapper.vm.parties[0]);

      expect(wrapper.vm.editPartyPermissions['dt-1']).toBe('VIEW');
      expect(wrapper.vm.editPartyPermissions['dt-2']).toBe('');
    });

    it('should save updated permissions via API', async () => {
      const wrapper = await mountAndLoad();

      wrapper.vm.openEditPartyDialog(wrapper.vm.parties[0]);
      wrapper.vm.editPartyPermissions['dt-1'] = 'DECIDE';
      wrapper.vm.editPartyPermissions['dt-2'] = 'VIEW';

      await wrapper.vm.saveEditParty();
      await flushPromises();

      expect(mockApiClient.post).toHaveBeenCalledWith(
        expect.stringContaining('/party/party-1/permission'),
        { permissions: { 'dt-1': 'DECIDE', 'dt-2': 'VIEW' } }
      );
    });

    it('should call DELETE when all permissions removed', async () => {
      const permissions = [
        { partyId: 'party-1', permissions: { 'dt-1': 'VIEW' } },
      ];
      const wrapper = await mountAndLoad(undefined, permissions);

      wrapper.vm.openEditPartyDialog(wrapper.vm.parties[0]);
      wrapper.vm.editPartyPermissions['dt-1'] = '';

      await wrapper.vm.saveEditParty();
      await flushPromises();

      expect(mockApiClient.delete).toHaveBeenCalledWith(
        expect.stringContaining('/party/party-1/permission')
      );
    });

    it('should update permissions map optimistically', async () => {
      const wrapper = await mountAndLoad();

      wrapper.vm.openEditPartyDialog(wrapper.vm.parties[0]);
      wrapper.vm.editPartyPermissions['dt-1'] = 'COMMENT';

      await wrapper.vm.saveEditParty();

      expect(wrapper.vm.partyPermissions.get('party-1')).toEqual({
        'dt-1': 'COMMENT',
      });
    });

    it('should roll back permissions on API error', async () => {
      const permissions = [
        { partyId: 'party-1', permissions: { 'dt-1': 'VIEW' } },
      ];
      const wrapper = await mountAndLoad(undefined, permissions);

      mockApiClient.post.mockRejectedValueOnce(new Error('Permission save failed'));

      wrapper.vm.openEditPartyDialog(wrapper.vm.parties[0]);
      wrapper.vm.editPartyPermissions['dt-1'] = 'DECIDE';
      wrapper.vm.editPartyPermissions['dt-2'] = 'COMMENT';

      await wrapper.vm.saveEditParty();
      await flushPromises();

      expect(wrapper.vm.partyPermissions.get('party-1')).toEqual({
        'dt-1': 'VIEW',
      });
    });

    it('should not call API when permissions unchanged', async () => {
      const wrapper = await mountAndLoad();

      wrapper.vm.openEditPartyDialog(wrapper.vm.parties[0]);
      // Don't change any permissions

      await wrapper.vm.saveEditParty();
      await flushPromises();

      expect(mockApiClient.post).not.toHaveBeenCalledWith(
        expect.stringContaining('/permission'),
        expect.anything()
      );
    });
  });

  describe('Permission Options', () => {
    it('should have correct permission options', async () => {
      const wrapper = await mountAndLoad();

      expect(wrapper.vm.permissionOptions).toEqual([
        { label: 'None', value: '' },
        { label: 'View', value: 'VIEW' },
        { label: 'Comment', value: 'COMMENT' },
        { label: 'Decide', value: 'DECIDE' },
      ]);
    });
  });
});
