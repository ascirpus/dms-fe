import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';
import { usePermissions } from '../usePermissions';

const mockCurrentWorkspaceRole = ref<string | null>('MEMBER');

vi.mock('@/composables/useWorkspace', () => ({
  useWorkspace: vi.fn(() => ({
    currentWorkspaceRole: mockCurrentWorkspaceRole,
  })),
}));

describe('usePermissions', () => {
  beforeEach(() => {
    mockCurrentWorkspaceRole.value = 'MEMBER';
  });

  describe('isAtLeast', () => {
    it('should return false when role is null', () => {
      mockCurrentWorkspaceRole.value = null;
      const { isAtLeast } = usePermissions();
      expect(isAtLeast('MEMBER')).toBe(false);
      expect(isAtLeast('ADMIN')).toBe(false);
      expect(isAtLeast('OWNER')).toBe(false);
    });

    it('should return true for MEMBER checking MEMBER', () => {
      mockCurrentWorkspaceRole.value = 'MEMBER';
      const { isAtLeast } = usePermissions();
      expect(isAtLeast('MEMBER')).toBe(true);
    });

    it('should return false for MEMBER checking ADMIN or OWNER', () => {
      mockCurrentWorkspaceRole.value = 'MEMBER';
      const { isAtLeast } = usePermissions();
      expect(isAtLeast('ADMIN')).toBe(false);
      expect(isAtLeast('OWNER')).toBe(false);
    });

    it('should return true for ADMIN checking MEMBER or ADMIN', () => {
      mockCurrentWorkspaceRole.value = 'ADMIN';
      const { isAtLeast } = usePermissions();
      expect(isAtLeast('MEMBER')).toBe(true);
      expect(isAtLeast('ADMIN')).toBe(true);
    });

    it('should return false for ADMIN checking OWNER', () => {
      mockCurrentWorkspaceRole.value = 'ADMIN';
      const { isAtLeast } = usePermissions();
      expect(isAtLeast('OWNER')).toBe(false);
    });

    it('should return true for OWNER checking any role', () => {
      mockCurrentWorkspaceRole.value = 'OWNER';
      const { isAtLeast } = usePermissions();
      expect(isAtLeast('MEMBER')).toBe(true);
      expect(isAtLeast('ADMIN')).toBe(true);
      expect(isAtLeast('OWNER')).toBe(true);
    });
  });

  describe('computed permissions', () => {
    it('should deny all manage permissions for MEMBER', () => {
      mockCurrentWorkspaceRole.value = 'MEMBER';
      const { canManageMembers, canManageInvites, canManageProjects, canManageDocumentTypes } = usePermissions();
      expect(canManageMembers.value).toBe(false);
      expect(canManageInvites.value).toBe(false);
      expect(canManageProjects.value).toBe(false);
      expect(canManageDocumentTypes.value).toBe(false);
    });

    it('should grant all manage permissions for ADMIN', () => {
      mockCurrentWorkspaceRole.value = 'ADMIN';
      const { canManageMembers, canManageInvites, canManageProjects, canManageDocumentTypes } = usePermissions();
      expect(canManageMembers.value).toBe(true);
      expect(canManageInvites.value).toBe(true);
      expect(canManageProjects.value).toBe(true);
      expect(canManageDocumentTypes.value).toBe(true);
    });

    it('should grant all manage permissions for OWNER', () => {
      mockCurrentWorkspaceRole.value = 'OWNER';
      const { canManageMembers, canManageInvites, canManageProjects, canManageDocumentTypes } = usePermissions();
      expect(canManageMembers.value).toBe(true);
      expect(canManageInvites.value).toBe(true);
      expect(canManageProjects.value).toBe(true);
      expect(canManageDocumentTypes.value).toBe(true);
    });

    it('should deny all manage permissions when role is null', () => {
      mockCurrentWorkspaceRole.value = null;
      const { canManageMembers, canManageInvites, canManageProjects, canManageDocumentTypes } = usePermissions();
      expect(canManageMembers.value).toBe(false);
      expect(canManageInvites.value).toBe(false);
      expect(canManageProjects.value).toBe(false);
      expect(canManageDocumentTypes.value).toBe(false);
    });
  });

  describe('reactivity', () => {
    it('should update permissions when role changes', () => {
      mockCurrentWorkspaceRole.value = 'MEMBER';
      const { canManageMembers, canManageProjects } = usePermissions();

      expect(canManageMembers.value).toBe(false);
      expect(canManageProjects.value).toBe(false);

      mockCurrentWorkspaceRole.value = 'ADMIN';
      expect(canManageMembers.value).toBe(true);
      expect(canManageProjects.value).toBe(true);

      mockCurrentWorkspaceRole.value = 'MEMBER';
      expect(canManageMembers.value).toBe(false);
      expect(canManageProjects.value).toBe(false);
    });
  });

  describe('currentRole', () => {
    it('should expose the current workspace role', () => {
      mockCurrentWorkspaceRole.value = 'OWNER';
      const { currentRole } = usePermissions();
      expect(currentRole.value).toBe('OWNER');
    });
  });
});
