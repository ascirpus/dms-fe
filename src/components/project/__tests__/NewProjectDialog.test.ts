import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import NewProjectDialog from '../NewProjectDialog.vue';
import { useAuth } from '@/composables/useAuth';
import { ProjectsService } from '@/services/ProjectsService';
import { UsersService } from '@/services/UsersService';
import type { Project } from '@/types/Project';
import type { TenantUser } from '@/services/UsersService';

vi.mock('@/composables/useAuth');

// Mock service functions
const mockCreateProject = vi.fn();
const mockFetchTenantUsers = vi.fn();

// Mock ProjectsService class
vi.mock('@/services/ProjectsService', () => {
  return {
    ProjectsService: class {
      createProject = mockCreateProject;
    },
  };
});

// Mock UsersService class
vi.mock('@/services/UsersService', () => {
  return {
    UsersService: class {
      fetchTenantUsers = mockFetchTenantUsers;
    },
  };
});

// Simplified component stubs for PrimeVue
const globalStubs = {
  Dialog: {
    template: '<div v-if="visible" class="dialog-stub"><slot /></div>',
    props: ['visible', 'modal', 'closable', 'style', 'pt'],
  },
  Button: {
    template: '<button @click="$emit(\'click\')" :disabled="disabled" :class="[\'button-stub\', $attrs.class]"><slot>{{ label }}</slot></button>',
    props: ['label', 'icon', 'text', 'rounded', 'size', 'severity', 'loading', 'disabled'],
  },
  InputText: {
    template: '<input :id="id" :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" @blur="$emit(\'blur\')" :class="$attrs.class" />',
    props: ['id', 'modelValue', 'placeholder'],
  },
  Select: {
    template: '<select :id="id" :value="modelValue" @change="handleChange"><option v-for="opt in options" :key="opt.userId" :value="opt">{{ opt[optionLabel] || opt.userId }}</option></select>',
    props: ['id', 'modelValue', 'options', 'optionLabel', 'placeholder', 'loading'],
    methods: {
      handleChange(e: any) {
        this.$emit('update:modelValue', e.target.value);
        this.$emit('change');
      },
    },
  },
};

describe('NewProjectDialog.vue', () => {
  let mockApiClient: any;
  let mockTenantUsers: TenantUser[];

  beforeEach(() => {
    mockApiClient = { post: vi.fn(), get: vi.fn() };
    mockCreateProject.mockClear();
    mockFetchTenantUsers.mockClear();

    mockTenantUsers = [
      { userId: 'user-1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', role: 'ADMIN', createdAt: '2024-01-15T10:30:00' },
      { userId: 'user-2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', role: 'MEMBER', createdAt: '2024-01-14T14:22:00' },
    ];

    mockFetchTenantUsers.mockResolvedValue(mockTenantUsers);

    vi.mocked(useAuth).mockReturnValue({
      apiClient: mockApiClient,
      getCurrentUser: vi.fn().mockReturnValue({ sub: 'current-user-id' }),
    } as any);
  });

  describe('Component Behavior', () => {
    it('should initialize with empty form', () => {
      const wrapper = mount(NewProjectDialog, {
        props: { visible: true },
        global: { stubs: globalStubs },
      });

      expect(wrapper.vm.form.name).toBe('');
      expect(wrapper.vm.form.selectedUsers).toEqual([]);
      expect(wrapper.vm.form.inviteEmails).toEqual([]);
    });

    it('should validate form correctly', () => {
      const wrapper = mount(NewProjectDialog, {
        props: { visible: true },
        global: { stubs: globalStubs },
      });

      // Empty form should be invalid
      expect(wrapper.vm.v$.$invalid).toBe(true);

      // With name, should be valid
      wrapper.vm.form.name = 'Test Project';
      wrapper.vm.v$.$validate();
      expect(wrapper.vm.v$.$invalid).toBe(false);
    });

    it('should track form data state', () => {
      const wrapper = mount(NewProjectDialog, {
        props: { visible: true },
        global: { stubs: globalStubs },
      });

      expect(wrapper.vm.hasFormData).toBe(false);

      wrapper.vm.form.name = 'Test';
      expect(wrapper.vm.hasFormData).toBe(true);
    });
  });

  describe('User Fetching', () => {
    it('should fetch users on mount when visible', async () => {
      mount(NewProjectDialog, {
        props: { visible: true },
        global: { stubs: globalStubs },
      });

      await nextTick();

      expect(mockFetchTenantUsers).toHaveBeenCalled();
    });

    it('should not show dropdown when no users available', async () => {
      mockFetchTenantUsers.mockResolvedValue([]);

      const wrapper = mount(NewProjectDialog, {
        props: { visible: true },
        global: { stubs: globalStubs },
      });

      await nextTick();
      wrapper.vm.availableUsers = [];
      await nextTick();

      expect(wrapper.vm.hasUsersToInvite).toBe(false);
    });

    it('should show dropdown when users are available', async () => {
      const wrapper = mount(NewProjectDialog, {
        props: { visible: true },
        global: { stubs: globalStubs },
      });

      await nextTick();
      wrapper.vm.availableUsers = mockTenantUsers;
      await nextTick();

      expect(wrapper.vm.hasUsersToInvite).toBe(true);
    });
  });

  describe('User Selection', () => {
    it('should add user to selected list', async () => {
      const wrapper = mount(NewProjectDialog, {
        props: { visible: true },
        global: { stubs: globalStubs },
      });

      await nextTick();

      const user = mockTenantUsers[0];
      wrapper.vm.form.selectedUser = user;
      wrapper.vm.onUserSelect();

      expect(wrapper.vm.form.selectedUsers).toContainEqual(user);
      expect(wrapper.vm.form.selectedUser).toBeNull();
    });

    it('should remove user from list', async () => {
      const wrapper = mount(NewProjectDialog, {
        props: { visible: true },
        global: { stubs: globalStubs },
      });

      await nextTick();

      const user = mockTenantUsers[0];
      wrapper.vm.form.selectedUsers = [user];
      wrapper.vm.removeUser(user.userId);

      expect(wrapper.vm.form.selectedUsers).toHaveLength(0);
    });

    it('should filter out already selected users from dropdown', async () => {
      const wrapper = mount(NewProjectDialog, {
        props: { visible: true },
        global: { stubs: globalStubs },
      });

      await nextTick();

      const user = mockTenantUsers[0];
      wrapper.vm.availableUsers = mockTenantUsers;
      wrapper.vm.form.selectedUsers = [user];
      await nextTick();

      const filtered = wrapper.vm.filteredUsers;
      expect(filtered.find((u: any) => u.userId === user.userId)).toBeUndefined();
      expect(filtered).toHaveLength(1); // Only user-2 remains
    });

    it('should mark current user with isCurrent flag', async () => {
      const wrapper = mount(NewProjectDialog, {
        props: { visible: true },
        global: { stubs: globalStubs },
      });

      await nextTick();

      const currentUserInList: TenantUser = {
        userId: 'current-user-id',
        firstName: 'Current',
        lastName: 'User',
        email: 'current@example.com',
        role: 'ADMIN',
        createdAt: '2024-01-15T10:30:00',
      };

      wrapper.vm.availableUsers = [...mockTenantUsers, currentUserInList];
      await nextTick();

      const filtered = wrapper.vm.filteredUsers;
      const currentUser = filtered.find((u: any) => u.userId === 'current-user-id');
      expect(currentUser?.isCurrent).toBe(true);

      const otherUser = filtered.find((u: any) => u.userId !== 'current-user-id');
      expect(otherUser?.isCurrent).toBe(false);
    });

    it('should prevent selecting current user', async () => {
      const wrapper = mount(NewProjectDialog, {
        props: { visible: true },
        global: { stubs: globalStubs },
      });

      const currentUserInList = {
        userId: 'current-user-id',
        firstName: 'Current',
        lastName: 'User',
        email: 'current@example.com',
        role: 'ADMIN' as const,
        createdAt: '2024-01-15T10:30:00',
        displayName: 'Current User',
        isCurrent: true,
      };

      wrapper.vm.form.selectedUser = currentUserInList as any;
      wrapper.vm.onUserSelect();

      expect(wrapper.vm.form.selectedUsers).toHaveLength(0);
    });
  });

  describe('Email Invites', () => {
    it('should add valid email', () => {
      const wrapper = mount(NewProjectDialog, {
        props: { visible: true },
        global: { stubs: globalStubs },
      });

      wrapper.vm.form.currentEmail = 'test@example.com';
      wrapper.vm.addEmail();

      expect(wrapper.vm.form.inviteEmails).toContain('test@example.com');
      expect(wrapper.vm.form.currentEmail).toBe('');
    });

    it('should not add duplicate emails', () => {
      const wrapper = mount(NewProjectDialog, {
        props: { visible: true },
        global: { stubs: globalStubs },
      });

      wrapper.vm.form.inviteEmails = ['test@example.com'];
      wrapper.vm.form.currentEmail = 'test@example.com';
      wrapper.vm.addEmail();

      expect(wrapper.vm.form.inviteEmails).toHaveLength(1);
    });

    it('should remove email from list', () => {
      const wrapper = mount(NewProjectDialog, {
        props: { visible: true },
        global: { stubs: globalStubs },
      });

      wrapper.vm.form.inviteEmails = ['test@example.com'];
      wrapper.vm.removeEmail('test@example.com');

      expect(wrapper.vm.form.inviteEmails).toHaveLength(0);
    });

    it('should not add invalid email', () => {
      const wrapper = mount(NewProjectDialog, {
        props: { visible: true },
        global: { stubs: globalStubs },
      });

      wrapper.vm.form.currentEmail = 'invalid-email';
      wrapper.vm.addEmail();

      expect(wrapper.vm.form.inviteEmails).toHaveLength(0);
    });
  });

  describe('Project Creation', () => {
    it('should call API with correct data', async () => {
      const mockProject: Project = {
        id: 'proj-123',
        name: 'Test Project',
        description: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCreateProject.mockResolvedValue(mockProject);

      const wrapper = mount(NewProjectDialog, {
        props: { visible: true },
        global: { stubs: globalStubs },
      });

      wrapper.vm.form.name = 'Test Project';
      await wrapper.vm.submit();

      expect(mockCreateProject).toHaveBeenCalledWith({
        name: 'Test Project',
        description: '',
      });
    });

    it('should emit created event on success', async () => {
      const mockProject: Project = {
        id: 'proj-123',
        name: 'Test Project',
        description: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockCreateProject.mockResolvedValue(mockProject);

      const wrapper = mount(NewProjectDialog, {
        props: { visible: true },
        global: { stubs: globalStubs },
      });

      wrapper.vm.form.name = 'Test Project';
      await wrapper.vm.submit();

      expect(wrapper.emitted('created')).toBeTruthy();
      expect(wrapper.emitted('created')?.[0]).toEqual([mockProject]);
    });

    it('should set loading state during submission', async () => {
      let resolveCreate: any;
      const createPromise = new Promise((resolve) => {
        resolveCreate = resolve;
      });
      mockCreateProject.mockReturnValue(createPromise);

      const wrapper = mount(NewProjectDialog, {
        props: { visible: true },
        global: { stubs: globalStubs },
      });

      wrapper.vm.form.name = 'Test Project';
      const submitPromise = wrapper.vm.submit();

      // Wait for the promise to be initiated
      await flushPromises();

      expect(wrapper.vm.saving).toBe(true);

      resolveCreate({ id: 'test', name: 'Test Project', description: '', createdAt: new Date(), updatedAt: new Date() });
      await submitPromise;
      await flushPromises();

      expect(wrapper.vm.saving).toBe(false);
    });

    it('should handle API errors', async () => {
      mockCreateProject.mockRejectedValue(new Error('API Error'));

      const wrapper = mount(NewProjectDialog, {
        props: { visible: true },
        global: { stubs: globalStubs },
      });

      wrapper.vm.form.name = 'Test Project';
      await wrapper.vm.submit();

      expect(wrapper.vm.saving).toBe(false);
      expect(wrapper.emitted('created')).toBeFalsy();
    });

    it('should not submit invalid form', async () => {
      const wrapper = mount(NewProjectDialog, {
        props: { visible: true },
        global: { stubs: globalStubs },
      });

      // Empty name
      await wrapper.vm.submit();

      expect(mockCreateProject).not.toHaveBeenCalled();
    });
  });

  describe('User Display Names', () => {
    it('should display full name when firstName and lastName are available', () => {
      const wrapper = mount(NewProjectDialog, {
        props: { visible: true },
        global: { stubs: globalStubs },
      });

      const user: TenantUser = {
        userId: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'ADMIN',
        createdAt: '2024-01-15T10:30:00',
      };

      const displayName = wrapper.vm.getUserDisplayName(user);
      expect(displayName).toBe('John Doe');
    });

    it('should display firstName only when lastName is missing', () => {
      const wrapper = mount(NewProjectDialog, {
        props: { visible: true },
        global: { stubs: globalStubs },
      });

      const user: TenantUser = {
        userId: 'user-1',
        firstName: 'John',
        email: 'john@example.com',
        role: 'ADMIN',
        createdAt: '2024-01-15T10:30:00',
      };

      const displayName = wrapper.vm.getUserDisplayName(user);
      expect(displayName).toBe('John');
    });

    it('should display email when name fields are missing', () => {
      const wrapper = mount(NewProjectDialog, {
        props: { visible: true },
        global: { stubs: globalStubs },
      });

      const user: TenantUser = {
        userId: 'user-1',
        email: 'john@example.com',
        role: 'ADMIN',
        createdAt: '2024-01-15T10:30:00',
      };

      const displayName = wrapper.vm.getUserDisplayName(user);
      expect(displayName).toBe('john@example.com');
    });

    it('should display userId as last fallback', () => {
      const wrapper = mount(NewProjectDialog, {
        props: { visible: true },
        global: { stubs: globalStubs },
      });

      const user: TenantUser = {
        userId: 'user-1',
        role: 'ADMIN',
        createdAt: '2024-01-15T10:30:00',
      };

      const displayName = wrapper.vm.getUserDisplayName(user);
      expect(displayName).toBe('user-1');
    });
  });

  describe('Dialog Lifecycle', () => {
    it('should emit update:visible when closing', () => {
      const wrapper = mount(NewProjectDialog, {
        props: { visible: true },
        global: { stubs: globalStubs },
      });

      wrapper.vm.closeDialog();

      expect(wrapper.emitted('update:visible')).toBeTruthy();
      expect(wrapper.emitted('update:visible')?.[0]).toEqual([false]);
    });

    it('should reset form when dialog opens', async () => {
      const wrapper = mount(NewProjectDialog, {
        props: { visible: false },
        global: { stubs: globalStubs },
      });

      // Fill form
      wrapper.vm.form.name = 'Test';
      wrapper.vm.form.inviteEmails = ['test@example.com'];

      // Open dialog
      await wrapper.setProps({ visible: true });

      expect(wrapper.vm.form.name).toBe('');
      expect(wrapper.vm.form.inviteEmails).toHaveLength(0);
    });
  });
});
