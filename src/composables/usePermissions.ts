import { computed } from 'vue';
import { useWorkspace } from '@/composables/useWorkspace';
import type { TenantRole } from '@/types';

const ROLE_HIERARCHY: Record<TenantRole, number> = {
  MEMBER: 0,
  ADMIN: 1,
  OWNER: 2,
};

export function usePermissions() {
  const { currentWorkspaceRole } = useWorkspace();

  function isAtLeast(minimumRole: TenantRole): boolean {
    const current = currentWorkspaceRole.value;
    if (!current) return false;
    return ROLE_HIERARCHY[current] >= ROLE_HIERARCHY[minimumRole];
  }

  const canManageMembers = computed(() => isAtLeast('ADMIN'));
  const canManageInvites = computed(() => isAtLeast('ADMIN'));
  const canManageProjects = computed(() => isAtLeast('ADMIN'));
  const canManageDocumentTypes = computed(() => isAtLeast('ADMIN'));

  return {
    currentRole: currentWorkspaceRole,
    isAtLeast,
    canManageMembers,
    canManageInvites,
    canManageProjects,
    canManageDocumentTypes,
  };
}
