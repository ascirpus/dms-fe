import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useWorkspace } from '../useWorkspace';
import { useAuth } from '../useAuth';
import { useAuthStore } from '@/stores/authStore';
import { useQueryClient } from 'vue-query';
import type { Tenant, UserTenantsResponse } from '@/types';

vi.mock('../useAuth');
vi.mock('@/stores/authStore');

vi.mock('vue-query', () => ({
  useQuery: vi.fn(),
  useQueryClient: vi.fn(),
  useMutation: vi.fn(),
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

const mockRouterPush = vi.fn();

function makeTenant(overrides: Partial<Tenant> = {}): Tenant {
  return {
    id: 'tenant-1',
    name: 'Acme Corp',
    tier: {
      id: 'tier-1',
      name: 'Pro',
      rank: 1,
      features: [],
    },
    usage: { projectsCount: 5, documentsCount: 20, storageUsedMb: 100 },
    createdAt: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('useWorkspace', () => {
  let mockApiClient: any;
  let mockQueryClient: any;
  let mockAuthStore: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockApiClient = {
      get: vi.fn(),
      put: vi.fn(),
    };

    mockQueryClient = {
      fetchQuery: vi.fn(),
      setQueryData: vi.fn(),
      invalidateQueries: vi.fn(),
      clear: vi.fn(),
    };

    mockAuthStore = {
      tenantId: 'tenant-1',
      setTenantId: vi.fn(),
    };

    vi.mocked(useAuth).mockReturnValue({
      apiClient: mockApiClient,
      getCurrentTenantId: () => 'tenant-1',
    } as any);

    vi.mocked(useQueryClient).mockReturnValue(mockQueryClient);
    vi.mocked(useAuthStore).mockReturnValue(mockAuthStore as any);
  });

  it('should return initial empty state', () => {
    const { currentWorkspace, userWorkspaces, workspacesLoaded, currentWorkspaceName } = useWorkspace();

    expect(currentWorkspaceName.value).toBe('');
    expect(workspacesLoaded.value).toBe(false);
    expect(userWorkspaces.value).toEqual([]);
  });

  it('should fetch current workspace via queryClient', async () => {
    const mockTenant = makeTenant();
    mockQueryClient.fetchQuery.mockResolvedValue(mockTenant);

    const { fetchCurrentWorkspace, currentWorkspace, currentWorkspaceName } = useWorkspace();
    await fetchCurrentWorkspace();

    expect(mockQueryClient.fetchQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['tenant'],
      }),
    );
    expect(currentWorkspace.value).toEqual(mockTenant);
    expect(currentWorkspaceName.value).toBe('Acme Corp');
  });

  it('should fetch workspaces and populate both refs', async () => {
    const mockTenantsResponse: UserTenantsResponse = {
      tenants: [
        { tenantId: 'tenant-1', name: 'Acme Corp', role: 'OWNER', createdAt: '2024-01-01' },
        { tenantId: 'tenant-2', name: 'Beta Inc', role: 'MEMBER', createdAt: '2024-02-01' },
      ],
      lastAccessedTenantId: 'tenant-1',
    };
    const mockTenant = makeTenant();

    mockQueryClient.fetchQuery
      .mockResolvedValueOnce(mockTenantsResponse)
      .mockResolvedValueOnce(mockTenant);

    const { fetchWorkspaces, userWorkspaces, workspacesLoaded, currentWorkspace } = useWorkspace();
    await fetchWorkspaces();

    expect(userWorkspaces.value).toHaveLength(2);
    expect(workspacesLoaded.value).toBe(true);
    expect(currentWorkspace.value).toEqual(mockTenant);
  });

  it('should derive currentWorkspaceRole from userWorkspaces', async () => {
    const mockTenantsResponse: UserTenantsResponse = {
      tenants: [
        { tenantId: 'tenant-1', name: 'Acme Corp', role: 'OWNER', createdAt: '2024-01-01' },
      ],
      lastAccessedTenantId: 'tenant-1',
    };
    const mockTenant = makeTenant();

    mockQueryClient.fetchQuery
      .mockResolvedValueOnce(mockTenantsResponse)
      .mockResolvedValueOnce(mockTenant);

    const { fetchWorkspaces, currentWorkspaceRole } = useWorkspace();
    await fetchWorkspaces();

    expect(currentWorkspaceRole.value).toBe('OWNER');
  });

  it('should switch workspace: set tenant, clear cache, fetch new workspace, navigate', async () => {
    const newTenant = makeTenant({ id: 'tenant-2', name: 'Beta Inc' });
    mockQueryClient.fetchQuery.mockResolvedValue(newTenant);
    mockApiClient.put.mockResolvedValue({});

    const { switchWorkspace, currentWorkspace } = useWorkspace();
    await switchWorkspace('tenant-2');

    expect(mockAuthStore.setTenantId).toHaveBeenCalledWith('tenant-2');
    expect(mockQueryClient.clear).toHaveBeenCalled();
    expect(currentWorkspace.value).toEqual(newTenant);
    expect(mockRouterPush).toHaveBeenCalledWith({ name: 'projects' });
  });

  it('should return null for currentWorkspaceRole when no matching workspace', () => {
    vi.mocked(useAuth).mockReturnValue({
      apiClient: mockApiClient,
      getCurrentTenantId: () => 'nonexistent',
    } as any);

    const { currentWorkspaceRole } = useWorkspace();
    expect(currentWorkspaceRole.value).toBeNull();
  });
});
