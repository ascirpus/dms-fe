import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TenantService } from '../TenantService';
import type { Tenant, UserTenantsResponse } from '@/types';

describe('TenantService', () => {
  let service: TenantService;
  let mockApiClient: any;

  const mockTenant: Tenant = {
    id: 'tenant-1',
    name: 'Test Tenant',
    tier: {
      id: 'tier-1',
      name: 'Pro',
      rank: 1,
      features: [
        { feature: 'DOCUMENT_VERSIONING', enabled: true, config: {} },
        { feature: 'OCR_PROCESSING', enabled: false, config: {} },
      ],
    },
    usage: {
      projectsCount: 5,
      documentsCount: 20,
      storageUsedMb: 100,
    },
    createdAt: '2024-01-01T00:00:00Z',
  };

  const mockUserTenants: UserTenantsResponse = {
    tenants: [
      { tenantId: 'tenant-1', name: 'Tenant One', role: 'ADMIN', createdAt: '2024-01-01T00:00:00Z' },
      { tenantId: 'tenant-2', name: 'Tenant Two', role: 'MEMBER', createdAt: '2024-02-01T00:00:00Z' },
    ],
    lastAccessedTenantId: 'tenant-2',
  };

  beforeEach(() => {
    mockApiClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    };

    service = new TenantService(mockApiClient);
  });

  describe('fetchTenant', () => {
    it('should fetch and return tenant data', async () => {
      mockApiClient.get.mockResolvedValue({
        data: {
          status: 'SUCCESS',
          data: mockTenant,
        },
      });

      const result = await service.fetchTenant();

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/tenants/current');
      expect(result).toEqual(mockTenant);
      expect(result.tier.features).toHaveLength(2);
    });

    it('should throw error on API failure', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Unauthorized'));

      await expect(service.fetchTenant()).rejects.toThrow('Unauthorized');
    });
  });

  describe('fetchUserTenants', () => {
    it('should fetch and return user tenants', async () => {
      mockApiClient.get.mockResolvedValue({
        data: {
          status: 'SUCCESS',
          data: mockUserTenants,
        },
      });

      const result = await service.fetchUserTenants();

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/tenants');
      expect(result.tenants).toHaveLength(2);
      expect(result.lastAccessedTenantId).toBe('tenant-2');
    });

    it('should throw error on API failure', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Unauthorized'));

      await expect(service.fetchUserTenants()).rejects.toThrow('Unauthorized');
    });
  });

  describe('selectTenant', () => {
    it('should call PUT to select a tenant', async () => {
      mockApiClient.put.mockResolvedValue({ data: { status: 'SUCCESS' } });

      await service.selectTenant('tenant-1');

      expect(mockApiClient.put).toHaveBeenCalledWith('/api/me/active-tenant', { tenantId: 'tenant-1' });
    });

    it('should throw error on API failure', async () => {
      mockApiClient.put.mockRejectedValue(new Error('Forbidden'));

      await expect(service.selectTenant('tenant-1')).rejects.toThrow('Forbidden');
    });
  });
});
