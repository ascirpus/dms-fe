import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTenantFeatures } from '../useTenantFeatures';
import { useAuth } from '../useAuth';
import { useQueryClient } from 'vue-query';
import type { Tenant } from '@/types';

vi.mock('../useAuth');
vi.mock('vue-query', () => ({
  useQuery: vi.fn(),
  useQueryClient: vi.fn(),
  useMutation: vi.fn(),
}));

function makeTenant(features: Tenant['tier']['features']): Tenant {
  return {
    id: 'tenant-1',
    name: 'Test',
    tier: { id: 'tier-1', name: 'Pro', rank: 1, features },
    usage: { projectsCount: 0, documentsCount: 0, storageUsedMb: 0 },
    createdAt: '2024-01-01T00:00:00Z',
  };
}

describe('useTenantFeatures', () => {
  let mockApiClient: any;
  let mockQueryClient: any;

  beforeEach(() => {
    mockApiClient = {
      get: vi.fn(),
      post: vi.fn(),
    };

    mockQueryClient = {
      fetchQuery: vi.fn(),
      setQueryData: vi.fn(),
      invalidateQueries: vi.fn(),
    };

    vi.mocked(useAuth).mockReturnValue({
      apiClient: mockApiClient,
    } as any);

    vi.mocked(useQueryClient).mockReturnValue(mockQueryClient);
  });

  it('should fetch tenant and expose features from tier', async () => {
    const mockTenant = makeTenant([
      { feature: 'DOCUMENT_VERSIONING', enabled: true, config: {} },
      { feature: 'OCR_PROCESSING', enabled: false, config: {} },
    ]);

    mockQueryClient.fetchQuery.mockResolvedValue(mockTenant);

    const { fetchTenant, features, tenant } = useTenantFeatures();
    await fetchTenant();

    expect(mockQueryClient.fetchQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['tenant'],
      }),
    );
    expect(tenant.value).toEqual(mockTenant);
    expect(features.value).toHaveLength(2);
  });

  it('should report versioningEnabled correctly when enabled', async () => {
    mockQueryClient.fetchQuery.mockResolvedValue(
      makeTenant([{ feature: 'DOCUMENT_VERSIONING', enabled: true, config: {} }]),
    );

    const { fetchTenant, versioningEnabled } = useTenantFeatures();
    await fetchTenant();

    expect(versioningEnabled.value).toBe(true);
  });

  it('should report versioningEnabled as false when disabled', async () => {
    mockQueryClient.fetchQuery.mockResolvedValue(
      makeTenant([{ feature: 'DOCUMENT_VERSIONING', enabled: false, config: {} }]),
    );

    const { fetchTenant, versioningEnabled } = useTenantFeatures();
    await fetchTenant();

    expect(versioningEnabled.value).toBe(false);
  });

  it('should report versioningEnabled as false when feature not present', async () => {
    mockQueryClient.fetchQuery.mockResolvedValue(
      makeTenant([{ feature: 'OCR_PROCESSING', enabled: true, config: {} }]),
    );

    const { fetchTenant, versioningEnabled } = useTenantFeatures();
    await fetchTenant();

    expect(versioningEnabled.value).toBe(false);
  });

  it('isFeatureEnabled should check by feature name', async () => {
    mockQueryClient.fetchQuery.mockResolvedValue(
      makeTenant([
        { feature: 'DOCUMENT_VERSIONING', enabled: true, config: {} },
        { feature: 'OCR_PROCESSING', enabled: false, config: {} },
        { feature: 'API_ACCESS', enabled: true, config: {} },
      ]),
    );

    const { fetchTenant, isFeatureEnabled } = useTenantFeatures();
    await fetchTenant();

    expect(isFeatureEnabled('DOCUMENT_VERSIONING')).toBe(true);
    expect(isFeatureEnabled('OCR_PROCESSING')).toBe(false);
    expect(isFeatureEnabled('API_ACCESS')).toBe(true);
    expect(isFeatureEnabled('ADVANCED_REPORTING')).toBe(false);
  });
});
