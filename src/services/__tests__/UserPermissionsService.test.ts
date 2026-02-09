import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UserPermissionsService } from '../UserPermissionsService';
import type { UserPermissionOverride } from '@/types/UserPermission';

describe('UserPermissionsService', () => {
  let service: UserPermissionsService;
  let mockApiClient: any;

  beforeEach(() => {
    mockApiClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    };

    service = new UserPermissionsService(mockApiClient);
  });

  describe('fetchMyOverrides', () => {
    it('should fetch and return permission overrides', async () => {
      const mockOverrides: UserPermissionOverride[] = [
        {
          userId: 'user-1',
          userEmail: 'test@example.com',
          documentId: 'doc-1',
          documentTitle: 'Requirements.pdf',
          projectName: 'Project Alpha',
          permission: 'VIEW',
        },
        {
          userId: 'user-1',
          userEmail: 'test@example.com',
          documentId: 'doc-2',
          documentTitle: 'Design Specs.pdf',
          projectName: 'Project Beta',
          permission: 'COMMENT',
        },
      ];

      mockApiClient.get.mockResolvedValue({
        data: { status: 'SUCCESS', data: mockOverrides },
      });

      const result = await service.fetchMyOverrides();

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/me/permission-overrides');
      expect(result).toEqual(mockOverrides);
    });

    it('should return empty array when no overrides exist', async () => {
      mockApiClient.get.mockResolvedValue({
        data: { status: 'SUCCESS', data: [] },
      });

      const result = await service.fetchMyOverrides();

      expect(result).toEqual([]);
    });

    it('should throw error on failure', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Unauthorized'));

      await expect(service.fetchMyOverrides()).rejects.toThrow('Unauthorized');
    });
  });
});
