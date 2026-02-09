import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUserPermissions } from '../useUserPermissions';
import { useAuth } from '../useAuth';
import { useQueryClient } from 'vue-query';
import type { UserPermissionOverride } from '@/types/UserPermission';

vi.mock('../useAuth');
vi.mock('vue-query', () => ({
  useQueryClient: vi.fn(),
}));

describe('useUserPermissions', () => {
  let mockApiClient: any;
  let mockQueryClient: any;

  beforeEach(() => {
    mockApiClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
    };

    mockQueryClient = {
      fetchQuery: vi.fn(),
      invalidateQueries: vi.fn(),
    };

    vi.mocked(useAuth).mockReturnValue({
      apiClient: mockApiClient,
    } as any);

    vi.mocked(useQueryClient).mockReturnValue(mockQueryClient);
  });

  describe('fetchOverrides', () => {
    it('should fetch and store permission overrides', async () => {
      const mockOverrides: UserPermissionOverride[] = [
        {
          userId: 'user-1',
          userEmail: 'test@example.com',
          documentId: 'doc-1',
          documentTitle: 'Requirements.pdf',
          projectName: 'Project Alpha',
          permission: 'VIEW',
        },
      ];

      mockQueryClient.fetchQuery.mockResolvedValue(mockOverrides);

      const { fetchOverrides, overrides, loading } = useUserPermissions();
      const result = await fetchOverrides();

      expect(result).toEqual(mockOverrides);
      expect(overrides.value).toEqual(mockOverrides);
      expect(loading.value).toBe(false);
    });

    it('should use correct query key', async () => {
      mockQueryClient.fetchQuery.mockResolvedValue([]);

      const { fetchOverrides } = useUserPermissions();
      await fetchOverrides();

      expect(mockQueryClient.fetchQuery).toHaveBeenCalledWith({
        queryKey: ['my-permission-overrides'],
        queryFn: expect.any(Function),
      });
    });

    it('should set loading state during fetch', async () => {
      let resolvePromise: (value: any) => void;
      mockQueryClient.fetchQuery.mockReturnValue(
        new Promise((resolve) => { resolvePromise = resolve; }),
      );

      const { fetchOverrides, loading } = useUserPermissions();
      const fetchPromise = fetchOverrides();

      expect(loading.value).toBe(true);

      resolvePromise!([]);
      await fetchPromise;

      expect(loading.value).toBe(false);
    });

    it('should set error on failure', async () => {
      const fetchError = new Error('Network error');
      mockQueryClient.fetchQuery.mockRejectedValue(fetchError);

      const { fetchOverrides, error, loading } = useUserPermissions();

      await expect(fetchOverrides()).rejects.toThrow('Network error');
      expect(error.value).toBe(fetchError);
      expect(loading.value).toBe(false);
    });
  });
});
