import { describe, it, expect, vi, beforeEach } from 'vitest';
import { UsersService } from '../UsersService';

describe('UsersService', () => {
  let service: UsersService;
  let mockApiClient: any;

  beforeEach(() => {
    mockApiClient = {
      get: vi.fn(),
    };

    service = new UsersService(mockApiClient);
  });

  describe('fetchTenantUsers', () => {
    it('should fetch and map nested response to flat TenantUser', async () => {
      mockApiClient.get.mockResolvedValue({
        data: {
          status: 'SUCCESS',
          data: [
            {
              user: { id: 'user-1', email: 'john@example.com', firstName: 'John', lastName: 'Doe' },
              role: 'ADMIN',
              createdAt: '2024-01-15T10:30:00',
            },
            {
              user: { id: 'user-2', email: 'jane@example.com', firstName: 'Jane', lastName: 'Smith' },
              role: 'MEMBER',
              createdAt: '2024-01-14T14:22:00',
            },
          ],
        },
      });

      const result = await service.fetchTenantUsers();

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/tenants/current/users');
      expect(result).toEqual([
        { userId: 'user-1', email: 'john@example.com', firstName: 'John', lastName: 'Doe', role: 'ADMIN', createdAt: '2024-01-15T10:30:00' },
        { userId: 'user-2', email: 'jane@example.com', firstName: 'Jane', lastName: 'Smith', role: 'MEMBER', createdAt: '2024-01-14T14:22:00' },
      ]);
    });

    it('should convert empty name strings to undefined', async () => {
      mockApiClient.get.mockResolvedValue({
        data: {
          status: 'SUCCESS',
          data: [
            {
              user: { id: 'user-1', email: 'noname@example.com', firstName: '', lastName: '' },
              role: 'MEMBER',
              createdAt: '2024-01-13T08:15:00',
            },
          ],
        },
      });

      const result = await service.fetchTenantUsers();

      expect(result[0].firstName).toBeUndefined();
      expect(result[0].lastName).toBeUndefined();
      expect(result[0].email).toBe('noname@example.com');
    });

    it('should handle empty user list', async () => {
      mockApiClient.get.mockResolvedValue({
        data: {
          status: 'SUCCESS',
          data: [],
        },
      });

      const result = await service.fetchTenantUsers();

      expect(result).toEqual([]);
    });

    it('should throw error on API failure', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Network error'));

      await expect(service.fetchTenantUsers()).rejects.toThrow('Network error');
    });

    it('should handle different user roles', async () => {
      mockApiClient.get.mockResolvedValue({
        data: {
          status: 'SUCCESS',
          data: [
            { user: { id: 'u1', email: 'owner@example.com', firstName: 'Owner', lastName: 'User' }, role: 'OWNER', createdAt: '2024-01-15T10:30:00' },
            { user: { id: 'u2', email: 'admin@example.com', firstName: 'Admin', lastName: 'User' }, role: 'ADMIN', createdAt: '2024-01-14T14:22:00' },
            { user: { id: 'u3', email: 'member@example.com', firstName: '', lastName: '' }, role: 'MEMBER', createdAt: '2024-01-13T08:15:00' },
          ],
        },
      });

      const result = await service.fetchTenantUsers();

      expect(result).toHaveLength(3);
      expect(result[0].role).toBe('OWNER');
      expect(result[1].role).toBe('ADMIN');
      expect(result[2].role).toBe('MEMBER');
    });
  });
});
